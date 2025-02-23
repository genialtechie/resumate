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

export interface CoverLetter {
  id: string;
  resumeId: string;
  jobDescription: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoverLetterMetadata extends CoverLetter {
  resume?: ResumeMetadata;
}
export interface CoverLetterInput {
  resume: ResumeContentObject;
  jobDescription: string;
  tone?: 'professional' | 'enthusiastic' | 'confident' | 'humble';
}

export interface GeneratedCoverLetter {
  content: string;
  sections: {
    opening: string;
    body: string[];
    closing: string;
  };
  tone: 'professional' | 'enthusiastic' | 'confident' | 'humble';
  keyPoints: string[];
}

export interface TailoredRequirements {
  keyRequirements: string[];
  missingRequirements: string[];
  missingSkills: string[];
}

export interface TailoringResponse {
  requirements: TailoredRequirements;
  suggestedUpdates: {
    summary?: string;
    skills?: string[];
    experience?: Array<{
      company: string;
      title: string;
      dates: string;
      details: string[];
    }>;
  };
}

export interface TailoringOptions {
  focusAreas?: ('summary' | 'skills' | 'experience')[];
  maxSuggestedSkills?: number;
  preserveExperience?: boolean;
}

export interface TailoringInput {
  resume: ResumeContentObject;
  jobDescription: string;
  options: TailoringOptions;
}
