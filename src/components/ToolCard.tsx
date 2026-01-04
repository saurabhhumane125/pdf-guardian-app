import { Link } from 'react-router-dom';
import { LucideIcon, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  isPrimary?: boolean;
}

const ToolCard = ({ name, description, icon: Icon, href, isPrimary = false }: ToolCardProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all hover:scale-[1.02]",
        isPrimary
          ? "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
      )}
    >
      <div className={cn(
        "p-4 rounded-full transition-colors",
        isPrimary
          ? "bg-primary text-primary-foreground"
          : "bg-primary/10 text-primary"
      )}>
        <Icon className="w-7 h-7" />
      </div>
      
      <div className="text-center">
        <h3 className="font-semibold text-foreground text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
        <Shield className="w-3 h-3" />
        <span>100% Local Processing</span>
      </div>
    </Link>
  );
};

export default ToolCard;
