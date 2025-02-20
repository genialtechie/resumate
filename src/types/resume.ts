export interface ResumeMetadata {
  id: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  parsedContent?: string;
  parsedObject?: ResumeContentObject;
  tags?: string[];
}

export interface StorageConfig {
  baseDir: string;
  pdfDir: string;
  metadataDir: string;
}

export interface PDFEditorProps {
  parsedContent: string; // Parsed text content
  resumeId: string;
}

export interface Section {
  id: string;
  type: 'experience' | 'education' | 'skills';
  content: string;
}

export interface EditSuggestion {
  original: string;
  suggestion: string;
  reason: string;
  position: { start: number; end: number };
}

export interface ResumeContentObject {
  id: string;
  name: string;
  location: string;
  summary: string;
  skills: string[];
  contact: {
    email: string;
    phone: string;
    linkedin?: string;
    website?: string;
  };
  experience: Array<{
    company: string;
    title: string;
    dates: string;
    details: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    dates: string;
    location: string;
  }>;
}
