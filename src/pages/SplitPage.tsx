import ToolPageLayout from '@/components/ToolPageLayout';
import SplitTool from '@/components/SplitTool';

const SplitPage = () => {
  return (
    <ToolPageLayout
      title="Split PDF"
      description="Extract specific pages from your PDF document"
    >
      <SplitTool />
    </ToolPageLayout>
  );
};

export default SplitPage;
