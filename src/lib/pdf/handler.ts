import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
  ResumeMetadata,
  ResumeContentObject,
  CoverLetterMetadata,
} from '@/types';
import { PDFProcessor } from '@/lib/pdf/processor';
import { parseResume as parseLLM } from '@/lib/llm/parse-text-llm';
import { parseResume as parsePattern } from '@/lib/parser/parse-text';

export class PDFHandler {
  private pdfProcessor: PDFProcessor;
  private supabase: SupabaseClient;

  constructor() {
    this.pdfProcessor = new PDFProcessor();
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  private async parseContent(
    textContent: string
  ): Promise<ResumeContentObject> {
    const id = crypto.randomUUID();

    try {
      // Try LLM parsing first
      const parsed = await parseLLM(
        textContent,
        process.env.OPENROUTER_API_KEY!
      );
      return { ...parsed, id };
    } catch (error) {
      console.error(
        'LLM parsing failed, falling back to pattern parsing:',
        error
      );
      // Fallback to pattern-based parsing
      const parsed = parsePattern(textContent);
      return { ...parsed, id };
    }
  }

  async saveResume(
    file: ArrayBuffer,
    fileName: string,
    userId: string
  ): Promise<ResumeMetadata> {
    if (!userId) {
      throw new Error('User ID is required to save a resume');
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const textContent = await this.pdfProcessor.extractText(file);
    const parsedObject = await this.parseContent(textContent);

    const { error: dbError } = await this.supabase.from('resumes').insert({
      id,
      file_name: fileName,
      created_at: now,
      updated_at: now,
      title: fileName.replace('.pdf', ''),
      parsed_content: textContent,
      parsed_object: parsedObject,
      user_id: userId,
    });

    if (dbError) throw dbError;

    return {
      id,
      fileName,
      createdAt: now,
      updatedAt: now,
      title: fileName.replace('.pdf', ''),
      parsedContent: textContent,
      parsedObject,
      userId,
    };
  }

  async getResume(id: string, userId: string): Promise<ResumeMetadata> {
    if (!userId) {
      throw new Error('User ID is required to get a resume');
    }

    const { data: metadata, error } = await this.supabase
      .from('resumes')
      .select()
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !metadata) {
      throw new Error('Resume not found');
    }

    return {
      id: metadata.id,
      fileName: metadata.file_name,
      createdAt: metadata.created_at,
      updatedAt: metadata.updated_at,
      title: metadata.title,
      parsedContent: metadata.parsed_content,
      parsedObject: metadata.parsed_object,
      userId: metadata.user_id,
    };
  }

  async deleteResume(id: string, userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required to delete a resume');
    }

    const { error } = await this.supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async updateResume(
    id: string,
    file: ArrayBuffer,
    fileName: string,
    userId: string
  ): Promise<ResumeMetadata> {
    if (!userId) {
      throw new Error('User ID is required to update a resume');
    }

    const now = new Date().toISOString();
    const textContent = await this.pdfProcessor.extractText(file);
    const parsedObject = await this.parseContent(textContent);

    const { error: dbError } = await this.supabase
      .from('resumes')
      .update({
        file_name: fileName,
        updated_at: now,
        title: fileName.replace('.pdf', ''),
        parsed_content: textContent,
        parsed_object: parsedObject,
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (dbError) throw dbError;

    // Get the existing record to maintain the correct createdAt time
    const { data: existing } = await this.supabase
      .from('resumes')
      .select('created_at')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    return {
      id,
      fileName,
      createdAt: existing?.created_at || now,
      updatedAt: now,
      title: fileName.replace('.pdf', ''),
      parsedContent: textContent,
      parsedObject,
      userId,
    };
  }

  async updateParsedObject(
    id: string,
    parsedObject: ResumeContentObject,
    userId: string
  ): Promise<ResumeMetadata> {
    if (!userId) {
      throw new Error('User ID is required to update a resume');
    }

    const now = new Date().toISOString();

    const { error: dbError } = await this.supabase
      .from('resumes')
      .update({
        updated_at: now,
        parsed_object: parsedObject,
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (dbError) throw dbError;

    // Get the full record to return
    const { data: metadata, error } = await this.supabase
      .from('resumes')
      .select()
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !metadata) {
      throw new Error('Resume not found after update');
    }

    return {
      id: metadata.id,
      fileName: metadata.file_name,
      createdAt: metadata.created_at,
      updatedAt: metadata.updated_at,
      title: metadata.title,
      parsedContent: metadata.parsed_content,
      parsedObject: metadata.parsed_object,
      userId: metadata.user_id,
    };
  }

  async saveCoverLetter(
    resumeId: string,
    jobDescription: string,
    content: string,
    userId: string
  ): Promise<CoverLetterMetadata> {
    if (!userId) {
      throw new Error('User ID is required to save a cover letter');
    }

    // Check if a cover letter already exists for this resume
    const { data: existing } = await this.supabase
      .from('cover_letters')
      .select()
      .eq('resume_id', resumeId)
      .eq('user_id', userId)
      .single();

    const now = new Date().toISOString();

    if (existing) {
      // Update existing cover letter
      const { error: dbError } = await this.supabase
        .from('cover_letters')
        .update({
          job_description: jobDescription,
          content,
          updated_at: now,
        })
        .eq('id', existing.id)
        .eq('user_id', userId);

      if (dbError) throw dbError;

      return this.getCoverLetter(existing.id, userId);
    }

    // Create new cover letter
    const id = crypto.randomUUID();
    const { error: dbError } = await this.supabase
      .from('cover_letters')
      .insert({
        id,
        resume_id: resumeId,
        job_description: jobDescription,
        content,
        created_at: now,
        updated_at: now,
        user_id: userId,
      });

    if (dbError) throw dbError;

    // Get the resume data to include in the response
    const { data: resume } = await this.supabase
      .from('resumes')
      .select()
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    return {
      id,
      resumeId,
      jobDescription,
      content,
      createdAt: now,
      updatedAt: now,
      userId,
      resume: resume
        ? {
            id: resume.id,
            fileName: resume.file_name,
            createdAt: resume.created_at,
            updatedAt: resume.updated_at,
            title: resume.title,
            parsedContent: resume.parsed_content,
            parsedObject: resume.parsed_object,
            userId: resume.user_id,
          }
        : undefined,
    };
  }

  async getCoverLetter(
    id: string,
    userId: string
  ): Promise<CoverLetterMetadata> {
    if (!userId) {
      throw new Error('User ID is required to get a cover letter');
    }

    const { data: coverLetter, error } = await this.supabase
      .from('cover_letters')
      .select(
        `
        *,
        resume:resumes (
          id,
          file_name,
          created_at,
          updated_at,
          title,
          parsed_content,
          parsed_object,
          user_id
        )
      `
      )
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !coverLetter) {
      throw new Error('Cover letter not found');
    }

    return {
      id: coverLetter.id,
      resumeId: coverLetter.resume_id,
      jobDescription: coverLetter.job_description,
      content: coverLetter.content,
      createdAt: coverLetter.created_at,
      updatedAt: coverLetter.updated_at,
      userId: coverLetter.user_id,
      resume: coverLetter.resume
        ? {
            id: coverLetter.resume.id,
            fileName: coverLetter.resume.file_name,
            createdAt: coverLetter.resume.created_at,
            updatedAt: coverLetter.resume.updated_at,
            title: coverLetter.resume.title,
            parsedContent: coverLetter.resume.parsed_content,
            parsedObject: coverLetter.resume.parsed_object,
            userId: coverLetter.resume.user_id,
          }
        : undefined,
    };
  }

  async updateCoverLetter(
    id: string,
    updates: {
      jobDescription?: string;
      content?: string;
    },
    userId: string
  ): Promise<CoverLetterMetadata> {
    if (!userId) {
      throw new Error('User ID is required to update a cover letter');
    }

    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      updated_at: now,
    };

    if (updates.jobDescription !== undefined) {
      updateData.job_description = updates.jobDescription;
    }
    if (updates.content !== undefined) {
      updateData.content = updates.content;
    }

    const { error: dbError } = await this.supabase
      .from('cover_letters')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);

    if (dbError) throw dbError;

    return this.getCoverLetter(id, userId);
  }

  async deleteCoverLetter(id: string, userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required to delete a cover letter');
    }

    const { error } = await this.supabase
      .from('cover_letters')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getCoverLetterForResume(
    resumeId: string,
    userId: string
  ): Promise<CoverLetterMetadata | null> {
    if (!userId) {
      throw new Error('User ID is required to get a cover letter');
    }

    const { data: coverLetter, error } = await this.supabase
      .from('cover_letters')
      .select(
        `
        *,
        resume:resumes (
          id,
          file_name,
          created_at,
          updated_at,
          title,
          parsed_content,
          parsed_object,
          user_id
        )
      `
      )
      .eq('resume_id', resumeId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // no rows returned
        return null;
      }
      throw error;
    }

    if (!coverLetter) return null;

    return {
      id: coverLetter.id,
      resumeId: coverLetter.resume_id,
      jobDescription: coverLetter.job_description,
      content: coverLetter.content,
      createdAt: coverLetter.created_at,
      updatedAt: coverLetter.updated_at,
      userId: coverLetter.user_id,
      resume: coverLetter.resume
        ? {
            id: coverLetter.resume.id,
            fileName: coverLetter.resume.file_name,
            createdAt: coverLetter.resume.created_at,
            updatedAt: coverLetter.resume.updated_at,
            title: coverLetter.resume.title,
            parsedContent: coverLetter.resume.parsed_content,
            parsedObject: coverLetter.resume.parsed_object,
            userId: coverLetter.resume.user_id,
          }
        : undefined,
    };
  }
}
