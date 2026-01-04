import { FileText, X, GripVertical } from 'lucide-react';
import { PDFFile } from '@/types/pdf';
import { Button } from '@/components/ui/button';

interface FileListProps {
  files: PDFFile[];
  onRemove: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  showReorder?: boolean;
}

const FileList = ({ files, onRemove, showReorder = false }: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground mb-3">
        Selected Files ({files.length})
      </h3>
      
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={file.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border group hover:border-primary/30 transition-colors"
          >
            {showReorder && (
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            )}
            
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {file.pageCount} page{file.pageCount !== 1 ? 's' : ''}
              </p>
            </div>
            
            <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted/30">
              #{index + 1}
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(file.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
