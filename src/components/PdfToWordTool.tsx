import { useState, useCallback } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DropZone from './DropZone';
import { getPdfDocument } from '@/lib/pdfWorker';

const PdfToWordTool = () => {
  const [pdfFile, setPdfFile] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileDrop = useCallback((files: File[]) => {
    const file = files.find(f => f.type === 'application/pdf');
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfFile({
          name: file.name,
          data: e.target?.result as ArrayBuffer
        });
        toast.success('PDF loaded');
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const handleConvert = async () => {
    if (!pdfFile) {
      toast.error('Please select a PDF file');
      return;
    }

    setIsProcessing(true);
    try {
      // Load PDF with PDF.js to extract text
      const pdfDoc = await getPdfDocument(pdfFile.data);
      const paragraphs: Paragraph[] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        // Group text items into lines
        let currentLine = '';
        let lastY: number | null = null;
        
        for (const item of textContent.items) {
          if ('str' in item) {
            const textItem = item as { str: string; transform: number[] };
            const y = textItem.transform[5];
            
            if (lastY !== null && Math.abs(y - lastY) > 5) {
              // New line
              if (currentLine.trim()) {
                paragraphs.push(
                  new Paragraph({
                    children: [new TextRun(currentLine.trim())]
                  })
                );
              }
              currentLine = textItem.str;
            } else {
              currentLine += textItem.str;
            }
            lastY = y;
          }
        }
        
        // Add remaining text
        if (currentLine.trim()) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun(currentLine.trim())]
            })
          );
        }
        
        // Add page break between pages
        if (i < pdfDoc.numPages) {
          paragraphs.push(new Paragraph({ children: [] }));
        }
      }

      // Create Word document
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFile.name.replace('.pdf', '.docx');
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Word document downloaded!');
    } catch (error) {
      console.error('Error converting PDF:', error);
      toast.error('Failed to convert PDF to Word');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> This extracts text content only. Complex formatting, images, and tables may not be preserved. All processing happens locally in your browser.
        </p>
      </div>

      {!pdfFile ? (
        <DropZone onFilesSelected={handleFileDrop} multiple={false} />
      ) : (
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-foreground">{pdfFile.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setPdfFile(null)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          onClick={handleConvert}
          disabled={!pdfFile || isProcessing}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          {isProcessing ? 'Converting...' : 'Convert to Word'}
        </Button>
        
        {pdfFile && (
          <Button variant="outline" onClick={() => setPdfFile(null)}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default PdfToWordTool;
