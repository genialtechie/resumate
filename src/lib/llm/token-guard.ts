import { TokenService, TokenLimitError } from '@/lib/utils/token-service';
import { getUserIdFromRequest } from '@/lib/utils/supabase/auth';

/**
 * Higher-order function that wraps LLM operations with token checking
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

  // Execute the operation if tokens are available
  return operation();
}
