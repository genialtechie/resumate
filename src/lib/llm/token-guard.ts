import { TokenService, TokenLimitError } from '@/lib/utils/token-service';
import { getUserIdFromRequest } from '@/lib/utils/supabase/auth';
import { triggerTokenUpdate } from '@/lib/utils/token-updates';

/**
 * Higher-order function that wraps LLM operations with token checking
 * @param operationType - The type of operation to check tokens for
 * @param operation - The operation to wrap with token checking
 * @returns The result of the operation
 */
export async function withTokenCheck<T>(
  operationType: keyof typeof TokenService.COSTS,
  operation: () => Promise<T>
): Promise<T> {
  const userId = await getUserIdFromRequest();

  // Check if user has enough tokens
  const hasTokens = await TokenService.consumeTokens(userId, operationType);

  if (!hasTokens) {
    throw new TokenLimitError(
      'You have reached your weekly limit for AI operations. Tokens will reset next week.'
    );
  }

  try {
    // Execute the operation if tokens are available
    const result = await operation();
    
    // Trigger a token update on the client side
    await triggerTokenUpdate();
    
    return result;
  } catch (error) {
    // If the operation fails, still trigger the token update
    // since tokens were already consumed
    await triggerTokenUpdate();
    throw error;
  }
}
