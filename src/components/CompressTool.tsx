import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Minimize2, Download, Loader2, Trash2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DropZone from './DropZone';
import { toast } from 'sonner';

const CompressTool = () => {
  const [pdfFile, setPdfFile] = useState<{ name: string; data: ArrayBuffer; size: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  const handleFilesSelected = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as ArrayBuffer;
      setPdfFile({ name: file.name, data, size: file.size });
      setCompressedSize(null);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleCompress = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    try {
      // Load the PDF
      const pdfDoc = await PDFDocument.load(pdfFile.data, {
        ignoreEncryption: true
      });

      // Create a new PDF and copy pages (this removes unused objects)
      const compressedPdf = await PDFDocument.create();
      const pages = await compressedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => compressedPdf.addPage(page));

      // Save with object streams for better compression
      const pdfBytes = await compressedPdf.save({
        useObjectStreams: true
      });

      const newSize = pdfBytes.length;
      setCompressedSize(newSize);

      // Download the compressed PDF
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile.name.replace('.pdf', '')}_compressed.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      const savings = ((pdfFile.size - newSize) / pdfFile.size * 100).toFixed(1);
      if (newSize < pdfFile.size) {
        toast.success(`Compressed! Saved ${savings}%`);
      } else {
        toast.info('PDF is already optimized, minimal compression possible');
      }
    } catch (error) {
      console.error('Error compressing PDF:', error);
      toast.error('Failed to compress PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setPdfFile(null);
    setCompressedSize(null);
  };

  return (
    <div className="space-y-6">
      {!pdfFile ? (
        <DropZone onFilesSelected={handleFilesSelected} multiple={false} />
      ) : (
        <>
          <div className="p-6 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileDown className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">{pdfFile.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border text-center">
                <p className="text-sm text-muted-foreground mb-1">Original Size</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatFileSize(pdfFile.size)}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border text-center">
                <p className="text-sm text-muted-foreground mb-1">Compressed Size</p>
                <p className="text-lg font-semibold text-foreground">
                  {compressedSize !== null ? formatFileSize(compressedSize) : '—'}
                </p>
                {compressedSize !== null && compressedSize < pdfFile.size && (
                  <p className="text-xs text-primary mt-1">
                    -{((pdfFile.size - compressedSize) / pdfFile.size * 100).toFixed(1)}% smaller
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleCompress}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Minimize2 className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? 'Compressing...' : 'Compress & Download'}
            </Button>
            
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CompressTool;
