import { Lock, HardDrive, Trash2 } from 'lucide-react';

const HowPrivacyWorks = () => {
  return (
    <section className="py-12 px-4 rounded-2xl bg-card border border-border">
      <h2 className="text-2xl font-bold text-foreground text-center mb-8">
        How Privacy Works
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <HardDrive className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Local Processing</h3>
          <p className="text-sm text-muted-foreground">
            All PDF processing happens directly inside your browser using local processing.
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Zero Upload</h3>
          <p className="text-sm text-muted-foreground">
            Your files are never uploaded, stored, or tracked. They stay on your device.
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Trash2 className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Auto-Cleanup</h3>
          <p className="text-sm text-muted-foreground">
            Once you close the tab, your data is gone. Nothing is saved anywhere.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowPrivacyWorks;
