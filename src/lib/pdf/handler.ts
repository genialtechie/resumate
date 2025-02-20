import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ResumeMetadata, ResumeContentObject } from '@/types';
import { PDFProcessor } from '@/lib/pdf/processor';
import { parseResume as parseLLM } from '@/lib/parser/parse-text-llm';
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
    fileName: string
  ): Promise<ResumeMetadata> {
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
    };
  }

  async getResume(id: string): Promise<ResumeMetadata> {
    const { data: metadata, error } = await this.supabase
      .from('resumes')
      .select()
      .eq('id', id)
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
    };
  }

  async deleteResume(id: string): Promise<void> {
    const { error } = await this.supabase.from('resumes').delete().eq('id', id);
    if (error) throw error;
  }

  async updateResume(
    id: string,
    file: ArrayBuffer,
    fileName: string
  ): Promise<ResumeMetadata> {
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
      .eq('id', id);

    if (dbError) throw dbError;

    // Get the existing record to maintain the correct createdAt time
    const { data: existing } = await this.supabase
      .from('resumes')
      .select('created_at')
      .eq('id', id)
      .single();

    return {
      id,
      fileName,
      createdAt: existing?.created_at || now,
      updatedAt: now,
      title: fileName.replace('.pdf', ''),
      parsedContent: textContent,
      parsedObject,
    };
  }

  async updateParsedObject(
    id: string,
    parsedObject: ResumeContentObject
  ): Promise<ResumeMetadata> {
    const now = new Date().toISOString();

    const { error: dbError } = await this.supabase
      .from('resumes')
      .update({
        updated_at: now,
        parsed_object: parsedObject,
      })
      .eq('id', id);

    if (dbError) throw dbError;

    // Get the full record to return
    const { data: metadata, error } = await this.supabase
      .from('resumes')
      .select()
      .eq('id', id)
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
    };
  }
}
