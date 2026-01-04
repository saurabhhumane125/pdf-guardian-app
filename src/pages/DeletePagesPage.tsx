import ToolPageLayout from '@/components/ToolPageLayout';
import DeletePagesTool from '@/components/DeletePagesTool';

const DeletePagesPage = () => {
  return (
    <ToolPageLayout
      title="Delete Pages"
      description="Remove unwanted pages from your PDF"
    >
      <DeletePagesTool />
    </ToolPageLayout>
  );
};

export default DeletePagesPage;
