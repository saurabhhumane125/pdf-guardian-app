import { Shield } from 'lucide-react';

interface PrivacyNoteProps {
  compact?: boolean;
}

const PrivacyNote = ({ compact = false }: PrivacyNoteProps) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4 text-primary" />
        <span>100% Local Processing — Files never leave your device</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <Shield className="w-4 h-4 text-primary flex-shrink-0" />
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">100% Local Processing</span> — Files never leave your device
      </p>
    </div>
  );
};

export default PrivacyNote;
