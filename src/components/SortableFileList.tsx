import { useMemo } from 'react';
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
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileText, X, GripVertical } from 'lucide-react';
import { PDFFile } from '@/types/pdf';
import { Button } from '@/components/ui/button';

interface SortableFileListProps {
  files: PDFFile[];
  onRemove: (id: string) => void;
  onReorder: (files: PDFFile[]) => void;
}

interface SortableItemProps {
  file: PDFFile;
  index: number;
  onRemove: (id: string) => void;
}

const SortableItem = ({ file, index, onRemove }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border group hover:border-primary/30 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      
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
  );
};

const SortableFileList = ({ files, onRemove, onReorder }: SortableFileListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const fileIds = useMemo(() => files.map(f => f.id), [files]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = files.findIndex(f => f.id === active.id);
      const newIndex = files.findIndex(f => f.id === over.id);
      onReorder(arrayMove(files, oldIndex, newIndex));
    }
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground mb-3">
        Selected Files ({files.length}) — Drag to reorder
      </h3>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fileIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {files.map((file, index) => (
              <SortableItem
                key={file.id}
                file={file}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SortableFileList;
