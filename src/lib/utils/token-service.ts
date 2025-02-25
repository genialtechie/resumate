import { createClient } from '@/lib/utils/supabase/server';
import { TokenInfo } from '@/types';

export class TokenLimitError extends Error {
  constructor(message = 'Token limit reached') {
    super(message);
    this.name = 'TokenLimitError';
  }
}

export class TokenService {
  // Cost of different operations in tokens
  static readonly COSTS = {
    PARSE_RESUME: 1,
    GENERATE_COVER_LETTER: 2,
    TAILOR_RESUME: 3,
  };

  /**
   * Get user's current token information
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
      throw new Error('Failed to retrieve token information');
    }

    if (!data) {
      // Create token record if it doesn't exist
      await this.initializeUserTokens(userId);
      return this.getUserTokens(userId);
    }

    return {
      tokensRemaining: data.tokens_remaining,
      tokensUsed: data.tokens_used,
      lastReset: data.last_reset,
      nextReset: data.next_reset,
    };
  }

  /**
   * Initialize tokens for a new user
   */
  static async initializeUserTokens(userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('user_tokens')
      .insert({ user_id: userId });

    if (error) {
      console.error('Error initializing tokens:', error);
      throw new Error('Failed to initialize token information');
    }
  }

  /**
   * Check if user has enough tokens and consume them if available
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
   * Reset tokens for all users whose tokens are due for reset
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
