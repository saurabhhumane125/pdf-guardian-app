import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const getPdfDocument = async (data: ArrayBuffer) => {
  return await pdfjsLib.getDocument({ data }).promise;
};

export { pdfjsLib };
