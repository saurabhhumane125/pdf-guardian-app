import { Shield, Lock } from 'lucide-react';

const PrivacyBadge = () => {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
      <Shield className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-foreground">
        Files never leave your device
      </span>
      <Lock className="w-4 h-4 text-muted-foreground" />
    </div>
  );
};

export default PrivacyBadge;
