import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ImagePlus, Download, Trash2, Upload, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DropZone from './DropZone';

interface ImageFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  type: string;
}

const AddImageTool = () => {
  const [pdfFile, setPdfFile] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePdfDrop = useCallback((files: File[]) => {
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

  const handleImageDrop = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages(prev => [...prev, {
            id: crypto.randomUUID(),
            name: file.name,
            data: event.target?.result as ArrayBuffer,
            type: file.type
          }]);
        };
        reader.readAsArrayBuffer(file);
      }
    });
    toast.success(`${files.length} image(s) added`);
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleAddImages = async () => {
    if (!pdfFile || images.length === 0) {
      toast.error('Please add a PDF and at least one image');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(pdfFile.data);
      
      for (const img of images) {
        let embeddedImage;
        if (img.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(img.data);
        } else if (img.type === 'image/jpeg' || img.type === 'image/jpg') {
          embeddedImage = await pdfDoc.embedJpg(img.data);
        } else {
          toast.error(`Unsupported image format: ${img.type}`);
          continue;
        }

        // Add new page with image
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        const imgDims = embeddedImage.scale(1);
        const scale = Math.min(
          (width - 50) / imgDims.width,
          (height - 50) / imgDims.height
        );
        
        page.drawImage(embeddedImage, {
          x: (width - imgDims.width * scale) / 2,
          y: (height - imgDims.height * scale) / 2,
          width: imgDims.width * scale,
          height: imgDims.height * scale,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile.name.replace('.pdf', '')}_with_images.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('PDF with images downloaded!');
    } catch (error) {
      console.error('Error adding images:', error);
      toast.error('Failed to add images to PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setPdfFile(null);
    setImages([]);
  };

  return (
    <div className="space-y-6">
      {/* PDF Drop Zone */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">1. Select PDF</p>
        {!pdfFile ? (
          <DropZone onFilesSelected={handlePdfDrop} multiple={false} />
        ) : (
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <FileImage className="w-5 h-5 text-primary" />
              <span className="text-foreground">{pdfFile.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPdfFile(null)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">2. Add Images (PNG/JPG)</p>
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-all">
          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-muted-foreground">Click to select images</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            multiple
            onChange={handleImageDrop}
            className="hidden"
          />
        </label>
      </div>

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Images to add:</p>
          {images.map(img => (
            <div key={img.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <ImagePlus className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{img.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeImage(img.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={handleAddImages}
          disabled={!pdfFile || images.length === 0 || isProcessing}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Download PDF with Images'}
        </Button>
        
        {(pdfFile || images.length > 0) && (
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddImageTool;
