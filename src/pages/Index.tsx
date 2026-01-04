import { FileText } from 'lucide-react';
import { Layers, Scissors, Minimize2, RotateCw, Trash2, ImagePlus, FileType } from 'lucide-react';
import PrivacyBadge from '@/components/PrivacyBadge';
import HowPrivacyWorks from '@/components/HowPrivacyWorks';
import ToolCard from '@/components/ToolCard';
import Footer from '@/components/Footer';

const primaryTools = [
  {
    name: 'Merge PDFs',
    description: 'Combine multiple PDFs into one document',
    icon: Layers,
    href: '/merge'
  },
  {
    name: 'Split PDF',
    description: 'Extract specific pages from a PDF',
    icon: Scissors,
    href: '/split'
  },
  {
    name: 'Compress PDF',
    description: 'Reduce file size while maintaining quality',
    icon: Minimize2,
    href: '/compress'
  }
];

const secondaryTools = [
  {
    name: 'Rotate Pages',
    description: 'Rotate individual pages in your PDF',
    icon: RotateCw,
    href: '/rotate'
  },
  {
    name: 'Delete Pages',
    description: 'Remove unwanted pages from a PDF',
    icon: Trash2,
    href: '/delete-pages'
  },
  {
    name: 'Add Images',
    description: 'Insert images as new pages in your PDF',
    icon: ImagePlus,
    href: '/add-images'
  },
  {
    name: 'PDF to Word',
    description: 'Convert PDF text to editable Word document',
    icon: FileType,
    href: '/pdf-to-word'
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">PDF Utils</h1>
            </div>
            
            <PrivacyBadge />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy-First PDF Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Merge, split, and manipulate your PDFs directly in your browser. 
            Your files never leave your device.
          </p>
        </section>

        {/* How Privacy Works */}
        <HowPrivacyWorks />

        {/* Primary Tools */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Most Popular Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {primaryTools.map((tool) => (
              <ToolCard
                key={tool.href}
                name={tool.name}
                description={tool.description}
                icon={tool.icon}
                href={tool.href}
                isPrimary
              />
            ))}
          </div>
        </section>

        {/* Secondary Tools */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            More Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {secondaryTools.map((tool) => (
              <ToolCard
                key={tool.href}
                name={tool.name}
                description={tool.description}
                icon={tool.icon}
                href={tool.href}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
