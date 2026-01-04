import ToolPageLayout from '@/components/ToolPageLayout';
import AddImageTool from '@/components/AddImageTool';

const AddImagesPage = () => {
  return (
    <ToolPageLayout
      title="Add Images to PDF"
      description="Insert images as new pages in your PDF document"
    >
      <AddImageTool />
    </ToolPageLayout>
  );
};

export default AddImagesPage;
