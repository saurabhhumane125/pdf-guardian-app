import { Shield, Server, Wifi } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              100% Client-side PDF processing
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              No uploads. No tracking. No servers.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <Wifi className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Works offline after first load
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            PDF Utils — Your files, your privacy
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
