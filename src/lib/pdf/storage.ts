import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ResumeMetadata } from '@/types/resume';
import { PDFProcessor } from '@/lib/pdf/processor';

export class PDFStorage {
  private pdfProcessor: PDFProcessor;
  private supabase: SupabaseClient;

  constructor() {
    this.pdfProcessor = new PDFProcessor();
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  async saveResume(
    file: ArrayBuffer,
    fileName: string
  ): Promise<ResumeMetadata> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const textContent = await this.pdfProcessor.extractText(file);

    const { error: dbError } = await this.supabase.from('resumes').insert({
      id,
      file_name: fileName,
      created_at: now,
      updated_at: now,
      title: fileName.replace('.pdf', ''),
      parsed_content: textContent,
    });

    if (dbError) throw dbError;

    return {
      id,
      fileName,
      createdAt: now,
      updatedAt: now,
      title: fileName.replace('.pdf', ''),
      parsedContent: textContent,
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
    };
  }

  async deleteResume(id: string): Promise<void> {
    const { error } = await this.supabase.from('resumes').delete().eq('id', id);
    if (error) throw error;
  }
}
