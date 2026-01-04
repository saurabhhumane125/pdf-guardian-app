import { RotateCcw, RotateCw, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface PageThumbnailProps {
  pageNumber: number;
  previewUrl: string | null;
  rotation?: number;
  isSelected?: boolean;
  isDeleted?: boolean;
  showRotateButtons?: boolean;
  showDeleteButton?: boolean;
  showCheckbox?: boolean;
  showDragHandle?: boolean;
  sourceLabel?: string;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
  dragHandleProps?: Record<string, unknown>;
}

const PageThumbnail = ({
  pageNumber,
  previewUrl,
  rotation = 0,
  isSelected = false,
  isDeleted = false,
  showRotateButtons = false,
  showDeleteButton = false,
  showCheckbox = false,
  showDragHandle = false,
  sourceLabel,
  onRotateLeft,
  onRotateRight,
  onDelete,
  onToggle,
  dragHandleProps
}: PageThumbnailProps) => {
  return (
    <div
      className={cn(
        "relative group rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] bg-card",
        isDeleted && "border-destructive bg-destructive/10 opacity-60",
        isSelected && !isDeleted && "border-primary ring-2 ring-primary/20",
        !isSelected && !isDeleted && "border-border hover:border-primary/50"
      )}
      onClick={onToggle}
    >
      {/* Drag Handle */}
      {showDragHandle && (
        <div
          {...dragHandleProps}
          className="absolute top-1 left-1 z-10 p-1 rounded bg-secondary/80 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-3 h-3 text-secondary-foreground" />
        </div>
      )}

      {/* Checkbox */}
      {showCheckbox && (
        <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle?.()}
            className="bg-card border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      )}

      {/* Source Label */}
      {sourceLabel && (
        <div className="absolute top-1 right-1 z-10 px-1.5 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground truncate max-w-[80%]">
          {sourceLabel}
        </div>
      )}

      {/* Preview Image */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt={`Page ${pageNumber}`}
          className={cn(
            "w-full h-full object-contain transition-transform",
            isDeleted && "grayscale"
          )}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      )}

      {/* Rotation Indicator */}
      {rotation !== 0 && (
        <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded z-10">
          {rotation}°
        </div>
      )}

      {/* Deleted Overlay */}
      {isDeleted && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/20 z-10">
          <Trash2 className="w-8 h-8 text-destructive" />
        </div>
      )}

      {/* Control Buttons */}
      {(showRotateButtons || showDeleteButton) && !isDeleted && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {showRotateButtons && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onRotateLeft?.();
                }}
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onRotateRight?.();
                }}
              >
                <RotateCw className="w-3 h-3" />
              </Button>
            </>
          )}
          {showDeleteButton && (
            <Button
              variant="destructive"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}

      {/* Page Number */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t p-2",
        isDeleted ? "from-destructive/80 to-transparent" : "from-secondary/80 to-transparent"
      )}>
        <span className={cn(
          "text-xs font-medium",
          isDeleted ? "text-destructive-foreground" : "text-secondary-foreground"
        )}>
          Page {pageNumber}
        </span>
      </div>
    </div>
  );
};

export default PageThumbnail;
