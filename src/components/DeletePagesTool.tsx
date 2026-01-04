import { useState, useCallback } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Trash2, Download, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DropZone from './DropZone';
import PageThumbnail from './PageThumbnail';
import { toast } from 'sonner';
import { pdfjsLib } from '@/lib/pdfWorker';

interface PageData {
  pageNumber: number;
  rotation: number;
  previewUrl: string | null;
  deleted: boolean;
}

const DeletePagesTool = () => {
  const [pdfFile, setPdfFile] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadPdfPages = useCallback(async (data: ArrayBuffer) => {
    setIsLoading(true);
    try {
      const pdfDoc = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
      const numPages = pdfDoc.numPages;
      const pageDataArray: PageData[] = [];

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

        pageDataArray.push({
          pageNumber: i,
          rotation: 0,
          previewUrl: canvas.toDataURL(),
          deleted: false
        });
      }

      setPages(pageDataArray);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFilesSelected = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as ArrayBuffer;
      setPdfFile({ name: file.name, data });
      loadPdfPages(data);
    };
    reader.readAsArrayBuffer(file);
  }, [loadPdfPages]);

  const togglePageDeletion = (pageNumber: number) => {
    setPages(prev => prev.map(page => {
      if (page.pageNumber === pageNumber) {
        return { ...page, deleted: !page.deleted };
      }
      return page;
    }));
  };

  const rotatePageLeft = (pageNumber: number) => {
    setPages(prev => prev.map(page => 
      page.pageNumber === pageNumber 
        ? { ...page, rotation: (page.rotation - 90 + 360) % 360 }
        : page
    ));
  };

  const rotatePageRight = (pageNumber: number) => {
    setPages(prev => prev.map(page => 
      page.pageNumber === pageNumber 
        ? { ...page, rotation: (page.rotation + 90) % 360 }
        : page
    ));
  };

  const handleDownload = async () => {
    if (!pdfFile) return;

    const pagesToKeep = pages.filter(p => !p.deleted);
    if (pagesToKeep.length === 0) {
      toast.error('Cannot delete all pages');
      return;
    }

    setIsProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(pdfFile.data);
      const newPdf = await PDFDocument.create();
      
      for (const pageData of pagesToKeep) {
        const [copiedPage] = await newPdf.copyPages(srcDoc, [pageData.pageNumber - 1]);
        
        if (pageData.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees(currentRotation + pageData.rotation));
        }
        
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile.name.replace('.pdf', '')}_edited.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      const deletedCount = pages.filter(p => p.deleted).length;
      toast.success(`Removed ${deletedCount} page${deletedCount > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const deletedCount = pages.filter(p => p.deleted).length;
  const hasChanges = deletedCount > 0;
  const keptCount = pages.length - deletedCount;

  const reset = () => {
    setPdfFile(null);
    setPages([]);
  };

  const resetDeletions = () => {
    setPages(prev => prev.map(page => ({ ...page, deleted: false })));
  };

  return (
    <div className="space-y-6">
      {!pdfFile ? (
        <DropZone onFilesSelected={handleFilesSelected} multiple={false} />
      ) : (
        <>
          {/* File info */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">{pdfFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {pages.length} pages
                  {hasChanges && (
                    <span className="text-destructive font-medium"> — {deletedCount} to delete</span>
                  )}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading pages...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Click pages to mark for deletion • Rotate pages before deleting if needed
              </p>

              {/* Page grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {pages.map((page) => (
                  <PageThumbnail
                    key={page.pageNumber}
                    pageNumber={page.pageNumber}
                    previewUrl={page.previewUrl}
                    rotation={page.rotation}
                    isDeleted={page.deleted}
                    showRotateButtons={!page.deleted}
                    onToggle={() => togglePageDeletion(page.pageNumber)}
                    onRotateLeft={() => rotatePageLeft(page.pageNumber)}
                    onRotateRight={() => rotatePageRight(page.pageNumber)}
                  />
                ))}
              </div>

              {/* Download button */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleDownload}
                  disabled={!hasChanges || isProcessing}
                  className="flex-1"
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isProcessing ? 'Processing...' : `Download (${keptCount} pages)`}
                </Button>
                
                {hasChanges && (
                  <Button variant="outline" onClick={resetDeletions} size="lg">
                    Undo All
                  </Button>
                )}
                
                <Button variant="outline" onClick={reset} size="lg">
                  Reset
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DeletePagesTool;
