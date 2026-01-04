import { useState, useCallback } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { RotateCw, Download, Loader2, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DropZone from './DropZone';
import PageThumbnail from './PageThumbnail';
import { toast } from 'sonner';
import { pdfjsLib } from '@/lib/pdfWorker';

interface PageData {
  pageNumber: number;
  rotation: number;
  previewUrl: string | null;
  selected: boolean;
}

const RotateTool = () => {
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
          selected: false
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

  const togglePage = (pageNumber: number) => {
    setPages(prev => prev.map(page => 
      page.pageNumber === pageNumber 
        ? { ...page, selected: !page.selected }
        : page
    ));
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

  const selectAll = () => {
    setPages(prev => prev.map(page => ({ ...page, selected: true })));
  };

  const deselectAll = () => {
    setPages(prev => prev.map(page => ({ ...page, selected: false })));
  };

  const rotateSelectedLeft = () => {
    setPages(prev => prev.map(page => 
      page.selected 
        ? { ...page, rotation: (page.rotation - 90 + 360) % 360 }
        : page
    ));
  };

  const rotateSelectedRight = () => {
    setPages(prev => prev.map(page => 
      page.selected 
        ? { ...page, rotation: (page.rotation + 90) % 360 }
        : page
    ));
  };

  const handleDownload = async () => {
    if (!pdfFile) return;

    const hasRotations = pages.some(p => p.rotation !== 0);
    if (!hasRotations) {
      toast.error('No pages have been rotated');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(pdfFile.data);
      
      for (const pageData of pages) {
        if (pageData.rotation !== 0) {
          const page = pdfDoc.getPage(pageData.pageNumber - 1);
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + pageData.rotation));
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile.name.replace('.pdf', '')}_rotated.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Rotated PDF downloaded!');
    } catch (error) {
      console.error('Error rotating PDF:', error);
      toast.error('Failed to rotate PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setPdfFile(null);
    setPages([]);
  };

  const selectedCount = pages.filter(p => p.selected).length;
  const hasRotations = pages.some(p => p.rotation !== 0);

  return (
    <div className="space-y-6">
      {!pdfFile ? (
        <DropZone onFilesSelected={handleFilesSelected} multiple={false} />
      ) : (
        <>
          {/* File info */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <RotateCw className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">{pdfFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {pages.length} pages • {selectedCount} selected
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading pages...</span>
            </div>
          ) : (
            <>
              {/* Bulk actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" onClick={deselectAll}>
                  Deselect All
                </Button>
                <div className="border-l border-border mx-2" />
                <Button 
                  variant="secondary" 
                  onClick={rotateSelectedLeft}
                  disabled={selectedCount === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rotate Selected Left
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={rotateSelectedRight}
                  disabled={selectedCount === 0}
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Rotate Selected Right
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Click checkbox to select • Use rotate buttons on each page or bulk rotate selected pages
              </p>

              {/* Page grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {pages.map((page) => (
                  <PageThumbnail
                    key={page.pageNumber}
                    pageNumber={page.pageNumber}
                    previewUrl={page.previewUrl}
                    rotation={page.rotation}
                    isSelected={page.selected}
                    showCheckbox
                    showRotateButtons
                    onToggle={() => togglePage(page.pageNumber)}
                    onRotateLeft={() => rotatePageLeft(page.pageNumber)}
                    onRotateRight={() => rotatePageRight(page.pageNumber)}
                  />
                ))}
              </div>

              {/* Download button */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleDownload}
                  disabled={!hasRotations || isProcessing}
                  className="flex-1"
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isProcessing ? 'Processing...' : 'Download Rotated PDF'}
                </Button>
                
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

export default RotateTool;
