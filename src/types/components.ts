import { ResumeContentObject } from '@/types';

export interface UploadZoneProps {
  onFileChange: (file: File | null) => void;
}

export interface JobDescriptionInputProps {
  jobDescription: string;
  setJobDescription: (jobDescription: string) => void;
}

export interface PDFEditorProps {
  resume: ResumeContentObject;
  onSave: (resume: ResumeContentObject) => void;
}
