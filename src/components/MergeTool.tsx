import { useState, useCallback, useMemo } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Download, Loader2, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DropZone from './DropZone';
import PageThumbnail from './PageThumbnail';
import { toast } from 'sonner';
import { pdfjsLib } from '@/lib/pdfWorker';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PageData {
  id: string;
  sourceFileName: string;
  sourceFileIndex: number;
  pageNumber: number;
  rotation: number;
  previewUrl: string | null;
  pdfData: ArrayBuffer;
}

interface SortablePageProps {
  page: PageData;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onDelete: () => void;
}

const SortablePage = ({ page, onRotateLeft, onRotateRight, onDelete }: SortablePageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PageThumbnail
        pageNumber={page.pageNumber}
        previewUrl={page.previewUrl}
        rotation={page.rotation}
        sourceLabel={page.sourceFileName}
        showRotateButtons
        showDeleteButton
        showDragHandle
        onRotateLeft={onRotateLeft}
        onRotateRight={onRotateRight}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

const MergeTool = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    setIsLoading(true);
    const newPages: PageData[] = [];
    const existingFileCount = new Set(pages.map(p => p.sourceFileName)).size;

    for (let fileIndex = 0; fileIndex < selectedFiles.length; fileIndex++) {
      const file = selectedFiles[fileIndex];
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
        const numPages = pdfDoc.numPages;

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport
          }).promise;

          newPages.push({
            id: crypto.randomUUID(),
            sourceFileName: file.name.length > 15 ? file.name.slice(0, 12) + '...' : file.name,
            sourceFileIndex: existingFileCount + fileIndex,
            pageNumber: i,
            rotation: 0,
            previewUrl: canvas.toDataURL(),
            pdfData: arrayBuffer
          });
        }
      } catch (error) {
        console.error(`Error loading ${file.name}:`, error);
        toast.error(`Could not load ${file.name}`);
      }
    }

    setPages(prev => [...prev, ...newPages]);
    setIsLoading(false);
    
    if (newPages.length > 0) {
      toast.success(`Added ${newPages.length} pages from ${selectedFiles.length} file(s)`);
    }
  }, [pages]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setPages(prev => {
        const oldIndex = prev.findIndex(p => p.id === active.id);
        const newIndex = prev.findIndex(p => p.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const rotatePageLeft = (id: string) => {
    setPages(prev => prev.map(page => {
      if (page.id === id) {
        return { ...page, rotation: (page.rotation - 90 + 360) % 360 };
      }
      return page;
    }));
  };

  const rotatePageRight = (id: string) => {
    setPages(prev => prev.map(page => {
      if (page.id === id) {
        return { ...page, rotation: (page.rotation + 90) % 360 };
      }
      return page;
    }));
  };

  const deletePage = (id: string) => {
    setPages(prev => prev.filter(page => page.id !== id));
  };

  const handleMerge = async () => {
    if (pages.length < 2) {
      toast.error('Please add at least 2 pages to merge');
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      // Group pages by their source PDF
      const pdfCache = new Map<ArrayBuffer, Awaited<ReturnType<typeof PDFDocument.load>>>();
      
      for (const pageData of pages) {
        let srcDoc = pdfCache.get(pageData.pdfData);
        if (!srcDoc) {
          srcDoc = await PDFDocument.load(pageData.pdfData);
          pdfCache.set(pageData.pdfData, srcDoc);
        }
        
        const [copiedPage] = await mergedPdf.copyPages(srcDoc, [pageData.pageNumber - 1]);
        
        if (pageData.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees(currentRotation + pageData.rotation));
        }
        
        mergedPdf.addPage(copiedPage);
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.click();
      URL.revokeObjectURL(url);

      toast.success('PDF merged and downloaded!');
      setPages([]);
    } catch (error) {
      console.error('Merge error:', error);
      toast.error('Failed to merge PDFs');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setPages([]);
  };

  const pageIds = useMemo(() => pages.map(p => p.id), [pages]);
  const fileCount = useMemo(() => new Set(pages.map(p => p.sourceFileName)).size, [pages]);

  return (
    <div className="space-y-6">
      {/* Step 1: Upload */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
          Upload PDFs
        </h3>
        <DropZone onFilesSelected={handleFilesSelected} multiple />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading pages...</span>
        </div>
      )}

      {/* Step 2: Reorder */}
      {pages.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Arrange Pages
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {pages.length} pages from {fileCount} file(s)
              </span>
              <Button variant="ghost" size="sm" onClick={reset}>
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Drag to reorder • Click rotate buttons to rotate • Click trash to remove
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={pageIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {pages.map((page) => (
                  <SortablePage
                    key={page.id}
                    page={page}
                    onRotateLeft={() => rotatePageLeft(page.id)}
                    onRotateRight={() => rotatePageRight(page.id)}
                    onDelete={() => deletePage(page.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Step 3: Merge */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
              Download
            </h3>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Ready to merge</p>
                  <p className="text-sm text-muted-foreground">
                    {pages.length} pages will be combined
                  </p>
                </div>
              </div>
              
              <Button
                onClick={handleMerge}
                disabled={isProcessing || pages.length < 2}
                size="lg"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isProcessing ? 'Processing...' : 'Merge & Download'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MergeTool;
