import {
  getDocument,
  type PDFDocumentProxy,
} from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import path from 'path';
import mammoth from 'mammoth';

/**
 * Supported document types that can be processed by the DocumentProcessor.
 * @typedef {'pdf' | 'docx' | 'txt'} DocumentType
 */
export type DocumentType = 'pdf' | 'docx' | 'txt';

/**
 * DocumentProcessor handles extraction of text from various document formats.
 * Supports PDF, DOCX, and TXT files with automatic format detection.
 *
 * @class
 * @example
 * ```typescript
 * const processor = new DocumentProcessor();
 * const text = await processor.extractText(fileBuffer, 'resume.pdf', 'application/pdf');
 * ```
 */
export class DocumentProcessor {
  /** Flag to track if the PDF worker has been initialized */
  private initialized: boolean = false;

  /**
   * Creates a new instance of DocumentProcessor.
   * Initialization behavior differs between browser and Node.js environments.
   */
  constructor() {
    if (typeof window === 'undefined') {
      // Node.js environment - but don't await here
      this.initialized = false;
    } else {
      this.initialized = true;
    }
  }

  /**
   * Initializes the PDF.js worker for PDF processing.
   * Only needed in Node.js environments.
   *
   * @private
   * @returns {Promise<void>}
   */
  private async initializeWorker(): Promise<void> {
    if (this.initialized) return;
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    if (process.env.NODE_ENV === 'development') {
      pdfjs.GlobalWorkerOptions.workerSrc = path.join(
        process.cwd(),
        'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
      );
    } else {
      pdfjs.GlobalWorkerOptions.workerSrc = path.join(
        process.cwd(),
        'public/pdf.worker.min.mjs'
      );
    }
    this.initialized = true;
  }

  /**
   * Detects document type from file name or MIME type.
   * If MIME type is provided, it takes precedence over file extension.
   *
   * @param {string} fileName - The name of the file including extension
   * @param {string} [mimeType] - Optional MIME type of the file
   * @returns {DocumentType} The detected document type ('pdf', 'docx', or 'txt')
   */
  detectDocumentType(fileName: string, mimeType?: string): DocumentType {
    if (mimeType) {
      // PDF detection
      if (mimeType === 'application/pdf') return 'pdf';

      // DOCX detection - handle variant spellings
      const docxTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Handle variant spellings that browsers might send
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (docxTypes.some((type) => mimeType === type)) return 'docx';

      // TXT detection
      if (mimeType === 'text/plain') return 'txt';
    }

    // Fallback to extension-based detection
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') return 'pdf';
    if (extension === 'docx') return 'docx';
    if (extension === 'txt') return 'txt';

    // Default to PDF if we can't determine
    return 'pdf';
  }

  /**
   * Extracts text content from any supported document type.
   * Automatically detects the document type and calls the appropriate extraction method.
   *
   * @param {ArrayBuffer} buffer - The file content as an ArrayBuffer
   * @param {string} fileName - The name of the file including extension
   * @param {string} [mimeType] - Optional MIME type of the file
   * @returns {Promise<string>} The extracted text content
   * @throws {Error} If extraction fails or document type is unsupported
   */
  async extractText(
    buffer: ArrayBuffer,
    fileName: string,
    mimeType?: string
  ): Promise<string> {
    const documentType = this.detectDocumentType(fileName, mimeType);

    try {
      switch (documentType) {
        case 'pdf':
          return this.extractTextFromPDF(buffer);
        case 'docx':
          return this.extractTextFromDOCX(buffer);
        case 'txt':
          return this.extractTextFromTXT(buffer);
        default:
          throw new Error(`Unsupported document type: ${documentType}`);
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  }

  /**
   * Extracts text content from a PDF document.
   * Uses pdf.js to parse and extract text from all pages.
   *
   * @private
   * @param {ArrayBuffer} buffer - The PDF file content as an ArrayBuffer
   * @returns {Promise<string>} The extracted text content
   * @throws {Error} If PDF extraction fails
   */
  private async extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
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

  /**
   * Extracts text content from a DOCX document.
   * Uses mammoth.js for DOCX parsing with environment-specific handling.
   *
   * @private
   * @param {ArrayBuffer} buffer - The DOCX file content as an ArrayBuffer
   * @returns {Promise<string>} The extracted text content
   * @throws {Error} If DOCX extraction fails
   */
  private async extractTextFromDOCX(buffer: ArrayBuffer): Promise<string> {
    try {
      // Convert ArrayBuffer to Buffer if in Node.js environment
      if (typeof window === 'undefined') {
        // Node.js - need to convert ArrayBuffer to Buffer
        const nodeBuffer = Buffer.from(buffer);
        const result = await mammoth.extractRawText({ buffer: nodeBuffer });
        return result.value;
      } else {
        // Browser environment - use arrayBuffer directly
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        return result.value;
      }
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  /**
   * Extracts text content from a plain text (TXT) file.
   * Uses TextDecoder to convert the buffer to a string.
   *
   * @private
   * @param {ArrayBuffer} buffer - The TXT file content as an ArrayBuffer
   * @returns {Promise<string>} The extracted text content
   * @throws {Error} If TXT extraction fails
   */
  private async extractTextFromTXT(buffer: ArrayBuffer): Promise<string> {
    try {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(buffer);
    } catch (error) {
      console.error('Error extracting text from TXT:', error);
      throw new Error('Failed to extract text from TXT');
    }
  }
}

/**
 * TextProcessor is an alias for DocumentProcessor maintained for backward compatibility.
 * New code should use DocumentProcessor directly.
 *
 * @class
 * @extends {DocumentProcessor}
 * @deprecated Use DocumentProcessor instead
 */
export class TextProcessor extends DocumentProcessor {}
