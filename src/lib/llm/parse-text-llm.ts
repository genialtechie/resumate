import { ResumeContentObject } from '@/types';
import { resumeSchema, response_format } from '@/lib/parser/schemas';
import { BaseLLMService } from '@/lib/llm/base-llm';

export class LLMResumeParser extends BaseLLMService {
  constructor(apiKey: string) {
    super(apiKey, { response_format });
  }

  protected buildPrompt(content: string): string {
    return `Parse the following resume text into a structured JSON object. Extract and organize all relevant information from the text into appropriate fields.

Input Resume Text:
${content}

Output: Return a valid JSON object following the schema.`;
  }

  protected validateResponse(parsedContent: unknown): ResumeContentObject {
    const validationResult = resumeSchema.safeParse(parsedContent);

    if (!validationResult.success) {
      console.warn('Schema validation issues:', validationResult.error.errors);

      // Try to salvage what we can from the response
      const content = parsedContent as Partial<ResumeContentObject>;

      // Ensure required fields exist with defaults if missing
      const cleanedContent: ResumeContentObject = {
        id: content.id || 'N/A',
        name: content.name || 'Unknown',
        location: content.location || 'N/A',
        summary: content.summary || '',
        skills: Array.isArray(content.skills) ? content.skills : [],
        contact: {
          email: content.contact?.email || 'N/A',
          phone: content.contact?.phone || 'N/A',
          ...(content.contact?.linkedin && {
            linkedin: content.contact.linkedin,
          }),
          ...(content.contact?.website && { website: content.contact.website }),
        },
        experience: Array.isArray(content.experience)
          ? content.experience.map((exp) => ({
              company: exp.company || 'N/A',
              title: exp.title || 'N/A',
              dates: exp.dates || 'N/A',
              details: Array.isArray(exp.details) ? exp.details : [],
            }))
          : [],
        education: Array.isArray(content.education)
          ? content.education.map((edu) => ({
              institution: edu.institution || 'N/A',
              degree: edu.degree || 'N/A',
              dates: edu.dates || 'N/A',
              location: edu.location || 'N/A',
            }))
          : [],
      };

      return cleanedContent;
    }

    return validationResult.data;
  }

  public async parse(content: string): Promise<ResumeContentObject> {
    if (!content.trim()) {
      throw new Error('Empty content provided');
    }
    return this.process<ResumeContentObject>(content);
  }
}

export async function parseResume(
  content: string,
  apiKey: string
): Promise<ResumeContentObject> {
  const parser = new LLMResumeParser(apiKey);
  return parser.parse(content);
}
