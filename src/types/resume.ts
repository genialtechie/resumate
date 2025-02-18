export interface ResumeMetadata {
  id: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  parsedContent?: string;
  tags?: string[];
}

export interface StorageConfig {
  baseDir: string;
  pdfDir: string;
  metadataDir: string;
}
