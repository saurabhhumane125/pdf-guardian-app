import ToolPageLayout from '@/components/ToolPageLayout';
import RotateTool from '@/components/RotateTool';

const RotatePage = () => {
  return (
    <ToolPageLayout
      title="Rotate Pages"
      description="Rotate individual or multiple pages in your PDF"
    >
      <RotateTool />
    </ToolPageLayout>
  );
};

export default RotatePage;
