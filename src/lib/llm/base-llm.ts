const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export class LLMError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'LLMError';
  }
}

interface LLMConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: unknown;
}

/**
 * Base LLM service
 * @abstract
 * @description This is the base class for all LLM services. It provides a common interface for all LLM services.
 */
export abstract class BaseLLMService {
  protected apiKey: string;
  protected config: LLMConfig;

  constructor(apiKey: string, config: LLMConfig = {}) {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    this.apiKey = apiKey;
    this.config = {
      model: 'google/gemini-exp-1206:free',
      temperature: 0.1,
      max_tokens: 1500,
      ...config,
    };
  }

  protected abstract buildPrompt(input: unknown): string;
  protected abstract validateResponse(response: unknown): unknown;

  protected async callLLM<T>(input: unknown): Promise<T> {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer':
            process.env.NEXT_PUBLIC_GITHUB_REPO ||
            'https://github.com/yourusername/resumate',
          'X-Title': 'qualifies',
          'User-Agent': 'qualifies/1.0.0',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: this.buildPrompt(input),
            },
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.max_tokens,
          response_format: this.config.response_format,
        }),
      });

      let responseData: string;
      try {
        responseData = await response.text();
      } catch (error) {
        throw new LLMError('Failed to read API response', error);
      }

      if (!response.ok) {
        throw new LLMError(`OpenRouter API error: ${response.statusText}`, {
          status: response.status,
          body: responseData,
        });
      }

      let data: {
        choices?: Array<{
          message: { content: string };
          finish_reason?: string;
          native_finish_reason?: string;
        }>;
        error?: { message: string };
      };
      try {
        data = JSON.parse(responseData);
      } catch (error) {
        throw new LLMError('Failed to parse API response as JSON', {
          responseData,
          error,
        });
      }

      if (data.error) {
        throw new LLMError(
          `OpenRouter API returned an error: ${data.error.message}`,
          data.error
        );
      }

      const choice = data.choices?.[0];
      if (!choice?.message?.content) {
        throw new LLMError('Invalid response format from OpenRouter API', {
          response: data,
        });
      }

      // Check finish reason
      const finishReason = choice.finish_reason || choice.native_finish_reason;
      if (finishReason && finishReason !== 'stop' && finishReason !== 'STOP') {
        throw new LLMError(`Response incomplete: ${finishReason}`, {
          finish_reason: finishReason,
          response: data,
        });
      }

      let parsedContent: unknown;
      try {
        parsedContent = JSON.parse(choice.message.content);
      } catch (error) {
        throw new LLMError('Failed to parse LLM response as JSON', {
          content: choice.message.content,
          error,
        });
      }

      return this.validateResponse(parsedContent) as T;
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      throw new LLMError('Unexpected error during LLM processing', error);
    }
  }

  public async process<T>(input: unknown): Promise<T> {
    return this.callLLM<T>(input);
  }
}
