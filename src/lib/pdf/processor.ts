import {
  getDocument,
  type PDFDocumentProxy,
} from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

export class PDFProcessor {
  private initialized: boolean = false;

  constructor() {
    if (typeof window === 'undefined') {
      // Node.js environment - but don't await here
      this.initialized = false;
    } else {
      this.initialized = true;
    }
  }

  private async initializeWorker() {
    if (this.initialized) return;
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc =
      '../../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs';
    this.initialized = true;
  }

  async extractText(buffer: ArrayBuffer): Promise<string> {
    if (!this.initialized) {
      await this.initializeWorker();
    }
    let pdf: PDFDocumentProxy | null = null;
    try {
      const loadingTask = getDocument(new Uint8Array(buffer));
      pdf = await loadingTask.promise;
      const textContent: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        try {
          const content = await page.getTextContent();
          const pageText = content.items
            .filter((item): item is TextItem => 'str' in item)
            .map((item) => item.str)
            .join(' ');
          textContent.push(pageText);
        } finally {
          page.cleanup();
        }
      }

      return textContent.join('\n');
    } finally {
      if (pdf) {
        await pdf.destroy();
      }
    }
  }

  async render(buffer: ArrayBuffer, container: HTMLElement) {
    const pdf = await getDocument({ data: buffer }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      container.appendChild(canvas);

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
    }
  }
}
