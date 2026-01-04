export interface PDFFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  pageCount: number;
}

export interface PageSelection {
  fileId: string;
  pageNumber: number;
  selected: boolean;
}

export type ToolType = 'merge' | 'split' | 'add-image' | 'pdf-to-word' | 'rotate' | 'compress' | 'delete-pages';
