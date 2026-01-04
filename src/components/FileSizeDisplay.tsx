interface FileSizeDisplayProps {
  originalSize: number;
  compressedSize?: number | null;
  label?: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const FileSizeDisplay = ({ originalSize, compressedSize, label }: FileSizeDisplayProps) => {
  const hasCompressed = compressedSize !== null && compressedSize !== undefined;
  const savings = hasCompressed 
    ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
    : null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-card border border-border text-center">
        <p className="text-sm text-muted-foreground mb-1">
          {label || 'Original Size'}
        </p>
        <p className="text-lg font-semibold text-foreground">
          {formatFileSize(originalSize)}
        </p>
      </div>

      <div className="p-4 rounded-lg bg-card border border-border text-center">
        <p className="text-sm text-muted-foreground mb-1">Compressed Size</p>
        <p className="text-lg font-semibold text-foreground">
          {hasCompressed ? formatFileSize(compressedSize) : '—'}
        </p>
        {hasCompressed && compressedSize < originalSize && (
          <p className="text-xs text-primary mt-1">
            -{savings}% smaller
          </p>
        )}
      </div>
    </div>
  );
};

export { formatFileSize };
export default FileSizeDisplay;
