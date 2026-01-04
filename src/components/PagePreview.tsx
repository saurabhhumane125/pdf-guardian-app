import { useEffect, useRef, useState } from 'react';
import { pdfjsLib } from '@/lib/pdfWorker';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface PagePreviewProps {
  pdfData: ArrayBuffer;
  pageNumber: number;
  isSelected?: boolean;
  onToggle?: () => void;
  showCheckbox?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PagePreview = ({
  pdfData,
  pageNumber,
  isSelected = false,
  onToggle,
  showCheckbox = false,
  size = 'md'
}: PagePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-24 h-32',
    md: 'w-32 h-44',
    lg: 'w-48 h-64'
  };

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current) return;

      try {
        setIsLoading(true);
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfData.slice(0) }).promise;
        const page = await pdfDoc.getPage(pageNumber);
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale: 0.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport
        }).promise;
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error rendering page:', error);
        setIsLoading(false);
      }
    };

    renderPage();
  }, [pdfData, pageNumber]);

  return (
    <div
      onClick={onToggle}
      className={cn(
        "relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer group",
        sizeClasses[size],
        isSelected
          ? "border-primary shadow-lg shadow-primary/20"
          : "border-border hover:border-primary/50"
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain bg-card"
      />
      
      {showCheckbox && (
        <div className="absolute top-2 left-2">
          <Checkbox
            checked={isSelected}
            className="bg-card border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary/80 to-transparent p-2">
        <span className="text-xs font-medium text-secondary-foreground">
          Page {pageNumber}
        </span>
      </div>
    </div>
  );
};

export default PagePreview;
