import { Layers, Scissors, ImagePlus, FileText, RotateCw, Minimize2, Trash2 } from 'lucide-react';
import { ToolType } from '@/types/pdf';
import { cn } from '@/lib/utils';

interface ToolSelectorProps {
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

const tools = [
  {
    id: 'merge' as ToolType,
    name: 'Merge PDFs',
    description: 'Combine multiple PDFs into one',
    icon: Layers
  },
  {
    id: 'split' as ToolType,
    name: 'Split PDF',
    description: 'Extract specific pages',
    icon: Scissors
  },
  {
    id: 'rotate' as ToolType,
    name: 'Rotate Pages',
    description: 'Rotate individual pages',
    icon: RotateCw
  },
  {
    id: 'delete-pages' as ToolType,
    name: 'Delete Pages',
    description: 'Remove unwanted pages',
    icon: Trash2
  },
  {
    id: 'compress' as ToolType,
    name: 'Compress PDF',
    description: 'Reduce file size',
    icon: Minimize2
  },
  {
    id: 'add-image' as ToolType,
    name: 'Add Images',
    description: 'Insert images into PDF',
    icon: ImagePlus
  },
  {
    id: 'pdf-to-word' as ToolType,
    name: 'PDF to Word',
    description: 'Convert PDF to DOCX',
    icon: FileText
  }
];

const ToolSelector = ({ selectedTool, onSelectTool }: ToolSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
          className={cn(
            "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
            selectedTool === tool.id
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
          )}
        >
          <div className={cn(
            "p-3 rounded-full transition-colors",
            selectedTool === tool.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground"
          )}>
            <tool.icon className="w-6 h-6" />
          </div>
          
          <div className="text-center">
            <p className={cn(
              "font-semibold transition-colors",
              selectedTool === tool.id ? "text-primary" : "text-foreground"
            )}>
              {tool.name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {tool.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ToolSelector;
