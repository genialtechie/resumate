import {
  ResumeContentObject,
  TailoringOptions,
  TailoringResponse,
  TailoringInput,
} from '@/types';
import { BaseLLMService } from '@/lib/llm/base-llm';
import {
  tailoringResponseFormat,
  tailoringResponseSchema,
} from '@/lib/utils/schemas';

const DEFAULT_OPTIONS: TailoringOptions = {
  focusAreas: ['summary', 'skills', 'experience'],
  maxSuggestedSkills: 10,
  preserveExperience: true,
};

/**
 * Resume Tailor class
 * @extends BaseLLMService
 * @description This class is responsible for tailoring the resume based on the job description.
 */
export class ResumeTailor extends BaseLLMService {
  constructor(apiKey: string) {
    super(apiKey, {
      temperature: 0.2,
      model: 'google/gemini-flash-1.5-8b-exp',
      response_format: tailoringResponseFormat,
    });
  }

  protected validateResponse(response: unknown): TailoringResponse {
    const validationResult = tailoringResponseSchema.safeParse(response);

    if (!validationResult.success) {
      console.warn('Schema validation issues:', validationResult.error.errors);

      // Try to salvage what we can from the response
      const content = response as Partial<TailoringResponse>;

      // Create a default response structure
      const defaultResponse: TailoringResponse = {
        requirements: {
          keyRequirements: [],
          missingRequirements: [],
          missingSkills: [],
        },
        suggestedUpdates: {
          summary: content?.suggestedUpdates?.summary || '',
          skills: content?.suggestedUpdates?.skills || [],
          experience: content?.suggestedUpdates?.experience || [],
        },
      };

      // Merge with any valid data from the response
      const mergedResponse = {
        requirements: {
          keyRequirements: content?.requirements?.keyRequirements || [],
          missingRequirements: content?.requirements?.missingRequirements || [],
          missingSkills: content?.requirements?.missingSkills || [],
        },
        suggestedUpdates: {
          ...defaultResponse.suggestedUpdates,
          ...content?.suggestedUpdates,
        },
      };

      // Only throw if keyRequirements is empty
      if (mergedResponse.requirements.keyRequirements.length === 0) {
        throw new Error(
          'Failed to extract key requirements from job description'
        );
      }

      return mergedResponse;
    }

    return validationResult.data;
  }

  protected buildPrompt(input: unknown): string {
    const { resume, jobDescription, options } = input as TailoringInput;
    const focusAreasStr = options.focusAreas?.join(', ') || 'all sections';

    return `You are an expert resume tailoring assistant. 
    Your task is to analyze the job description and resume provided below and then give specific recommendations for optimizing the resume for the given role.

    Job Description:
    ${jobDescription}

    Resume:
    ${JSON.stringify(resume, null, 2)}

    Focus on tailoring these sections: ${focusAreasStr}

    Instructions:
    1. Extract Key Requirements:

    - Identify and extract qualification criteria directly related to skills and experience from the job description.
    - Exclude criteria that are less relevant for resume tailoring, such as citizenship, availability, or other general administrative details.

    2. Identify Gaps:

    - Determine which of these requirements and skills are missing from the resume.

    3. Suggest Specific Updates:

    - Recommend concrete changes to better align the resume with the job requirements.
    - Ensure suggestions are professional, accurate, and do not fabricate information.
    - Focus on highlighting relevant experience.

    4. Maintain Clarity:

    - Present requirements as concise, unrepetitive sentences.
    - List skills as single words or short phrases.

    Additional Guidelines:
    - Consistency: All missing requirements should directly match the extracted key requirements (i.e., the same string should appear in both keyRequirements and missingRequirements).
    - ${options.preserveExperience ? 'Preserve the core experience details while optimizing their presentation.' : ''}
    - ${options.maxSuggestedSkills ? `Limit suggested skills to the ${options.maxSuggestedSkills} most relevant ones.` : ''}

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
