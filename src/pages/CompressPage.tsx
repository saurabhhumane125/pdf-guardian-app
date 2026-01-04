import ToolPageLayout from '@/components/ToolPageLayout';
import CompressTool from '@/components/CompressTool';

const CompressPage = () => {
  return (
    <ToolPageLayout
      title="Compress PDF"
      description="Reduce file size while maintaining quality"
    >
      <CompressTool />
    </ToolPageLayout>
  );
};

export default CompressPage;
