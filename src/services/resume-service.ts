import { ResumeContentObject, ResumeMetadata } from '@/types';

// Resume API service
export const resumeService = {
  // Fetch resume metadata
  async fetchResume(id: string): Promise<ResumeMetadata> {
    const response = await fetch(`/api/resume/${id}`);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please sign in to access this resume');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch resume');
    }

    return response.json();
  },

  // Update resume with new file
  async updateResume(id: string, file: File): Promise<ResumeMetadata> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/resume/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please sign in to update this resume');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to update resume');
    }

    return response.json();
  },

  // Save editor changes
  async saveEditorChanges(id: string, updates: ResumeContentObject): Promise<ResumeMetadata> {
    const response = await fetch(`/api/resume/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please sign in to save changes');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to save changes');
    }

    return response.json();
  },

  // Generate cover letter
  async generateCoverLetter(id: string, jobDescription: string, resumeObject: ResumeContentObject) {
    const response = await fetch(`/api/resume/${id}/cover-letter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription,
        tone: 'professional',
        resumeObject,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate cover letter');
    }

    return response.json();
  },

  // Generate PDF
  async generatePDF(id: string, content: ResumeContentObject): Promise<Blob> {
    const response = await fetch(`/api/resume/${id}/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    return response.blob();
  },

  // Generate cover letter PDF
  async generateCoverLetterPDF(
    id: string,
    content: string,
    name: string,
    contact: Record<string, unknown>
  ): Promise<Blob> {
    const response = await fetch(`/api/resume/${id}/cover-letter/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, name, contact }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate cover letter PDF');
    }

    return response.blob();
  },

  // Get tailoring analysis
  async getTailoringAnalysis(
    id: string,
    jobDescription: string,
    resumeObject: ResumeContentObject
  ) {
    const response = await fetch(`/api/resume/${id}/tailor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription,
        resumeObject,
        options: {
          focusAreas: ['summary', 'skills', 'experience'],
          maxSuggestedSkills: 10,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze resume');
    }

    return response.json();
  },
}; 