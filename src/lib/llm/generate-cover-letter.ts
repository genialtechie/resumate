import { BaseLLMService } from '@/lib/llm/base-llm';
import {
  ResumeContentObject,
  CoverLetterInput,
  GeneratedCoverLetter,
} from '@/types';
import {
  coverLetterSchema,
  coverLetterResponseFormat,
} from '@/lib/parser/schemas';

export class CoverLetterGenerator extends BaseLLMService {
  constructor(apiKey: string) {
    super(apiKey, {
      temperature: 0.7,
      max_tokens: 2000,
      response_format: coverLetterResponseFormat,
    });
  }

  protected buildPrompt(input: CoverLetterInput): string {
    const { resume, jobDescription, tone = 'professional' } = input;

    return `Generate a personalized cover letter based on the following resume and job description. 
The cover letter should highlight relevant experience and skills that match the job requirements.
Use a ${tone} tone and maintain a natural, engaging writing style.

Resume Information:
Name: ${resume.name}
Summary: ${resume.summary}
Experience: ${resume.experience
      .map(
        (exp) =>
          `\n- ${exp.title} at ${exp.company} (${
            exp.dates
          })\n  ${exp.details.join('\n  ')}`
      )
      .join('\n')}
Skills: ${resume.skills.join(', ')}
Education: ${resume.education
      .map((edu) => `${edu.degree} from ${edu.institution} (${edu.dates})`)
      .join('\n')}

Job Description:
${jobDescription}

Instructions:
1. Create a well-structured cover letter with clear opening, body paragraphs, and closing
2. Focus on matching the candidate's experience and skills to the job requirements
3. Use specific examples from the resume to demonstrate qualifications
4. Maintain a ${tone} tone throughout
5. Include a strong call to action in the closing

Output: Generate a cover letter following the specified schema.`;
  }

  protected validateResponse(response: unknown): GeneratedCoverLetter {
    const validationResult = coverLetterSchema.safeParse(response);

    if (!validationResult.success) {
      console.warn('Schema validation issues:', validationResult.error.errors);
      throw new Error('Failed to generate valid cover letter');
    }

    return validationResult.data;
  }

  public async generate(
    input: CoverLetterInput
  ): Promise<GeneratedCoverLetter> {
    return this.process<GeneratedCoverLetter>(input);
  }
}

export async function generateCoverLetter(
  resume: ResumeContentObject,
  jobDescription: string,
  apiKey: string,
  tone?: 'professional' | 'enthusiastic' | 'confident' | 'humble'
): Promise<GeneratedCoverLetter> {
  const generator = new CoverLetterGenerator(apiKey);
  return generator.generate({ resume, jobDescription, tone });
}
