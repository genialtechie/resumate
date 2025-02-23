import { ResumeContentObject } from '@/types/resume';
import { BaseLLMService } from '@/lib/llm/base-llm';
import {
  TailoringOptions,
  TailoringResponse,
  TailoringInput,
} from '@/types/resume';
import {
  tailoringResponseFormat,
  tailoringResponseSchema,
} from '@/lib/schemas';

const DEFAULT_OPTIONS: TailoringOptions = {
  focusAreas: ['summary', 'skills', 'experience'],
  maxSuggestedSkills: 10,
  preserveExperience: true,
};

export class ResumeTailor extends BaseLLMService {
  constructor(apiKey: string) {
    super(apiKey, {
      temperature: 0.7,
      response_format: tailoringResponseFormat,
    });
  }

  protected validateResponse(response: unknown): TailoringResponse {
    const validationResult = tailoringResponseSchema.safeParse(response);

    if (!validationResult.success) {
      console.warn('Schema validation issues:', validationResult.error.errors);
    }

    if (!validationResult.data) {
      throw new Error('Failed to generate valid tailoring response');
    }

    return validationResult.data;
  }

  protected buildPrompt(input: unknown): string {
    const { resume, jobDescription, options } = input as TailoringInput;
    const focusAreasStr = options.focusAreas?.join(', ') || 'all sections';

    return `You are an expert resume tailoring assistant. Analyze the following job description and resume, then provide specific recommendations for optimizing the resume for this role.

Job Description:
${jobDescription}

Resume:
${JSON.stringify(resume, null, 2)}

Focus on tailoring these sections: ${focusAreasStr}

Instructions:
1. Extract key requirements from the job description
2. Identify which requirements and skills are missing from the resume
3. Suggest specific updates to better align the resume with the job requirements
4. Maintain professionalism and accuracy in all suggestions
5. Ensure suggested updates highlight relevant experience without fabricating information

${
  options.preserveExperience
    ? 'Note: Preserve the core experience details while optimizing their presentation.'
    : ''
}
${
  options.maxSuggestedSkills
    ? `Limit suggested skills to the ${options.maxSuggestedSkills} most relevant ones.`
    : ''
}

Return a valid JSON object following the specified schema.`;
  }

  public async tailorResume(
    resume: ResumeContentObject,
    jobDescription: string,
    options: TailoringOptions = DEFAULT_OPTIONS
  ): Promise<TailoringResponse> {
    if (!jobDescription.trim()) {
      throw new Error('Job description cannot be empty');
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    return this.process<TailoringResponse>({
      resume,
      jobDescription,
      options: mergedOptions,
    });
  }
}
