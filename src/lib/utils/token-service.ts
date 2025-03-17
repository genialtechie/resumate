import { createClient } from '@/lib/utils/supabase/server';
import { TokenInfo } from '@/types';

/**
 * Custom error thrown when a user has reached their token limit.
 * Used to handle premium feature access restrictions.
 *
 * @class
 * @extends {Error}
 */
export class TokenLimitError extends Error {
  /**
   * Creates a new TokenLimitError instance
   *
   * @param {string} [message='Token limit reached'] - Error message
   */
  constructor(message = 'Token limit reached') {
    super(message);
    this.name = 'TokenLimitError';
  }
}

/**
 * Service for managing user tokens
 * Handles token consumption, tracking, and limit enforcement
 *
 * @class
 * @static
 */
export class TokenService {
  /**
   * Cost of different operations in tokens
   * Used to calculate token consumption for various application features
   *
   * @static
   * @readonly
   */
  static readonly COSTS = {
    PARSE_RESUME: 1,
    GENERATE_COVER_LETTER: 2,
    TAILOR_RESUME: 3,
  };

  /**
   * Get user's current token information
   * Retrieves token information from the database or initializes if not found
   *
   * @static
   * @async
   * @param {string} userId - The user's ID
   * @returns {Promise<TokenInfo>} The user's token information
   * @throws {Error} If token information cannot be retrieved
   */
  static async getUserTokens(userId: string): Promise<TokenInfo> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_token_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching token info:', error);

      // Check if this is the "no rows" error, which means we need to initialize tokens
      if (error.code === 'PGRST116') {
        // Create token record if it doesn't exist
        await this.initializeUserTokens(userId);

        // Try again after initialization
        return this.getUserTokens(userId);
      }

      throw new Error('Failed to retrieve token information');
    }

    return {
      tokensRemaining: data.tokens_remaining,
      tokensUsed: data.tokens_used,
      lastReset: data.last_reset,
      nextReset: data.next_reset,
    } as TokenInfo;
  }

  /**
   * Initializes token information for a new user
   * Creates a new record in the token database with default values
   *
   * @static
   * @async
   * @param {string} userId - The user's ID
   * @returns {Promise<void>}
   * @throws {Error} If initialization fails
   */
  static async initializeUserTokens(userId: string): Promise<void> {
    const supabase = await createClient();

    // First check if a record already exists to avoid duplicates
    const { data: existingRecord } = await supabase
      .from('user_tokens')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingRecord) {
      return; // Record already exists, no need to create a new one
    }

    // Insert the new token record
    const { error } = await supabase
      .from('user_tokens')
      .insert({ user_id: userId });

    if (error) {
      console.error('Error initializing tokens:', error);
      throw new Error('Failed to initialize token information');
    }
  }

  /**
   * Consumes tokens for a specified operation
   * Verifies if the user has enough tokens and updates their token count
   *
   * @static
   * @async
   * @param {string} userId - The user's ID
   * @param {keyof typeof TokenService.COSTS} operationType - Type of operation to consume tokens for
   * @returns {Promise<boolean>} True if tokens were successfully consumed
   * @throws {TokenLimitError} If the user doesn't have enough tokens
   * @throws {Error} If token consumption fails for other reasons
   */
  static async consumeTokens(
    userId: string,
    operationType: keyof typeof TokenService.COSTS
  ): Promise<boolean> {
    const tokenCost = TokenService.COSTS[operationType];
    const supabase = await createClient();

    // First check if the user has enough tokens
    const { data: tokenInfo } = await supabase
      .from('user_tokens')
      .select('tokens_remaining')
      .eq('user_id', userId)
      .single();

    if (!tokenInfo) {
      await this.initializeUserTokens(userId);
      return this.consumeTokens(userId, operationType);
    }

    if (tokenInfo.tokens_remaining < tokenCost) {
      return false;
    }

    // User has enough tokens, consume them
    const { error } = await supabase.rpc('consume_tokens', {
      user_id_param: userId,
      token_cost: tokenCost,
    });

    if (error) {
      console.error('Error consuming tokens:', error);
      throw new Error('Failed to consume tokens');
    }

    return true;
  }

  /**
   * Resets tokens for users whose token reset date has passed
   * Typically called by a scheduled job/cron
   *
   * @static
   * @async
   * @returns {Promise<void>}
   */
  static async resetExpiredTokens(): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.rpc('reset_tokens_weekly');

    if (error) {
      console.error('Error resetting tokens:', error);
      throw new Error('Failed to reset tokens');
    }
  }
}
