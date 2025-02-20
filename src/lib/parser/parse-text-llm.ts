import { ResumeContentObject, OpenRouterResponse } from '@/types';
import { resumeSchema } from '@/lib/parser/schemas';
import { response_format } from '@/lib/parser/schemas';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

class ParsingError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ParsingError';
  }
}

export class LLMResumeParser {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    this.apiKey = apiKey;
  }

  private buildPrompt(content: string): string {
    return `Parse the following resume text into a structured JSON object. Extract and organize all relevant information from the text into appropriate fields.

Input Resume Text:
${content}

Output: Return a valid JSON object following the schema.`;
  }

  private validateAndCleanResponse(
    parsedContent: unknown
  ): ResumeContentObject {
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

  private async callLLM(content: string): Promise<ResumeContentObject> {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer':
            process.env.NEXT_PUBLIC_GITHUB_REPO ||
            'https://github.com/yourusername/resumate',
          'X-Title': 'Resumate',
          'User-Agent': 'Resumate/1.0.0',
        },
        body: JSON.stringify({
          model: 'google/gemini-exp-1206:free',
          messages: [
            {
              role: 'user',
              content: this.buildPrompt(content),
            },
          ],
          temperature: 0.1,
          max_tokens: 1500,
          response_format: response_format,
        }),
      });

      let responseData: string;
      try {
        responseData = await response.text();
      } catch (error) {
        throw new ParsingError('Failed to read API response', error);
      }

      if (!response.ok) {
        throw new ParsingError(`OpenRouter API error: ${response.statusText}`, {
          status: response.status,
          body: responseData,
        });
      }

      let data: OpenRouterResponse;
      try {
        data = JSON.parse(responseData) as OpenRouterResponse;
      } catch (error) {
        throw new ParsingError('Failed to parse API response as JSON', {
          responseData,
          error,
        });
      }

      if (data.error) {
        throw new ParsingError(
          `OpenRouter API returned an error: ${data.error.message}`,
          data.error
        );
      }

      if (!data.choices?.[0]?.message?.content) {
        throw new ParsingError('Invalid response format from OpenRouter API', {
          response: data,
        });
      }

      let parsedContent: unknown;
      try {
        parsedContent = JSON.parse(data.choices[0].message.content);
      } catch (error) {
        throw new ParsingError('Failed to parse LLM response as JSON', {
          content: data.choices[0].message.content,
          error,
        });
      }

      return this.validateAndCleanResponse(parsedContent);
    } catch (error) {
      if (error instanceof ParsingError) {
        throw error;
      }
      throw new ParsingError('Unexpected error during LLM parsing', error);
    }
  }

  public async parse(content: string): Promise<ResumeContentObject> {
    if (!content.trim()) {
      throw new ParsingError('Empty content provided');
    }
    return this.callLLM(content);
  }
}

export async function parseResume(
  content: string,
  apiKey: string
): Promise<ResumeContentObject> {
  const parser = new LLMResumeParser(apiKey);
  return parser.parse(content);
}
