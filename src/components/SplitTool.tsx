import { useState, useCallback } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Download, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const SplitTool = () => {
  const [pdfFile, setPdfFile] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rangeInput, setRangeInput] = useState('');

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
      setRangeInput('');
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

  const parseRangeInput = (input: string): number[] => {
    const result: number[] = [];
    const parts = input.split(',').map(s => s.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i >= 1 && i <= pages.length && !result.includes(i)) {
              result.push(i);
            }
          }
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num) && num >= 1 && num <= pages.length && !result.includes(num)) {
          result.push(num);
        }
      }
    }
    
    return result.sort((a, b) => a - b);
  };

  const applyRange = () => {
    const selectedPages = parseRangeInput(rangeInput);
    if (selectedPages.length === 0) {
      toast.error('Invalid range. Use format: 1-3, 5, 7-10');
      return;
    }
    
    setPages(prev => prev.map(page => ({
      ...page,
      selected: selectedPages.includes(page.pageNumber)
    })));
    
    toast.success(`Selected ${selectedPages.length} pages`);
  };

  const handleSplit = async () => {
    if (!pdfFile) return;

    const selectedPages = pages.filter(p => p.selected);
    if (selectedPages.length === 0) {
      toast.error('Please select at least one page');
      return;
    }

    setIsProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(pdfFile.data);
      const newPdf = await PDFDocument.create();
      
      for (const pageData of selectedPages) {
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
      link.download = `${pdfFile.name.replace('.pdf', '')}_extracted.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Extracted ${selectedPages.length} pages!`);
    } catch (error) {
      console.error('Split error:', error);
      toast.error('Failed to extract pages');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setPdfFile(null);
    setPages([]);
    setRangeInput('');
  };

  const selectedCount = pages.filter(p => p.selected).length;

  return (
    <div className="space-y-6">
      {!pdfFile ? (
        <DropZone onFilesSelected={handleFilesSelected} multiple={false} />
      ) : (
        <>
          {/* File info */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div>
              <p className="font-medium text-foreground">{pdfFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {pages.length} pages • {selectedCount} selected
              </p>
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
              {/* Range input */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter page range (e.g., 1-3, 5, 7-10)"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyRange()}
                  />
                </div>
                <Button variant="secondary" onClick={applyRange}>
                  Apply Range
                </Button>
                <Button variant="outline" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Click to select pages • Use rotate buttons to rotate before extracting
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
              {selectedCount > 0 && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                  <div>
                    <p className="font-medium text-foreground">Ready to extract</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCount} page{selectedCount !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleSplit}
                    disabled={isProcessing}
                    size="lg"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isProcessing ? 'Processing...' : 'Extract & Download'}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SplitTool;
