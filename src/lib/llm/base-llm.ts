/**
 * Base URL for OpenRouter API requests
 */
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * Custom error class for LLM-related errors
 * Provides better error handling and context for LLM operation failures
 *
 * @class
 * @extends {Error}
 */
export class LLMError extends Error {
  /**
   * Creates a new LLMError instance
   *
   * @param {string} message - Error message
   * @param {unknown} [cause] - Original error that caused this error
   */
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'LLMError';
  }
}

/**
 * Configuration options for LLM API calls
 *
 * @interface
 */
interface LLMConfig {
  /** Model identifier to use for generation */
  model?: string;

  /** Temperature controlling randomness (0-1) */
  temperature?: number;

  /** Maximum number of tokens to generate */
  max_tokens?: number;

  /** Response format specification */
  response_format?: unknown;
}

/**
 * Base LLM service
 * @abstract
 * @description This is the base class for all LLM services. It provides a common interface for all LLM services.
 */
export abstract class BaseLLMService {
  /**
   * API key for authentication with the LLM provider
   * @protected
   */
  protected apiKey: string;

  /**
   * Configuration settings for the LLM API calls
   * @protected
   */
  protected config: LLMConfig;

  /**
   * Creates a new BaseLLMService instance
   *
   * @param {string} apiKey - API key for authentication
   * @param {LLMConfig} [config] - Optional configuration settings
   * @throws {Error} If API key is not provided
   */
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

  /**
   * Builds a prompt for the LLM based on the input
   * Must be implemented by child classes
   *
   * @abstract
   * @protected
   * @param {unknown} input - Input data to build the prompt from
   * @returns {string} Formatted prompt string
   */
  protected abstract buildPrompt(input: unknown): string;

  /**
   * Validates and processes the response from the LLM
   * Must be implemented by child classes
   *
   * @abstract
   * @protected
   * @param {unknown} response - Raw response from the LLM
   * @returns {unknown} Validated and processed response
   */
  protected abstract validateResponse(response: unknown): unknown;

  /**
   * Makes an API call to the LLM service
   *
   * @protected
   * @template T - Type of the processed response
   * @param {unknown} input - Input data for the LLM
   * @returns {Promise<T>} Processed response from the LLM
   * @throws {LLMError} If the API call fails
   */
  protected async callLLM<T>(input: unknown): Promise<T> {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer':
            process.env.NEXT_PUBLIC_APP_URL || 'https://qualifies.me',
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
        error?: { message: string; metadata?: { raw?: string } };
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
        // Include raw error message from provider if available
        const errorMessage = data.error.metadata?.raw || data.error.message;
        throw new LLMError(
          `OpenRouter API returned an error: ${errorMessage}`,
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

  /**
   * Processes input data through the LLM pipeline
   * This is the main method to be called by clients
   *
   * @public
   * @template T - Type of the processed response
   * @param {unknown} input - Input data to process
   * @returns {Promise<T>} Processed response
   * @throws {LLMError} If processing fails
   */
  public async process<T>(input: unknown): Promise<T> {
    return this.callLLM<T>(input);
  }
}
