import ToolPageLayout from '@/components/ToolPageLayout';
import PdfToWordTool from '@/components/PdfToWordTool';

const PdfToWordPage = () => {
  return (
    <ToolPageLayout
      title="PDF to Word"
      description="Convert PDF text content to editable Word document"
    >
      <PdfToWordTool />
    </ToolPageLayout>
  );
};

export default PdfToWordPage;
