import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ToolPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ToolPageLayout = ({ title, description, children }: ToolPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            
            <div>
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
        {/* Privacy Note */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-8">
          <Shield className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">100% Local Processing</span> — Files never leave your device
          </p>
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default ToolPageLayout;
