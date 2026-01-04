import ToolPageLayout from '@/components/ToolPageLayout';
import MergeTool from '@/components/MergeTool';

const MergePage = () => {
  return (
    <ToolPageLayout
      title="Merge PDFs"
      description="Combine multiple PDF files into a single document"
    >
      <MergeTool />
    </ToolPageLayout>
  );
};

export default MergePage;
