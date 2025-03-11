import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToTokenUpdates } from '@/lib/utils/token-updates';

/**
 * Custom hook to subscribe to token updates
 * This hook will automatically invalidate the user-tokens query when tokens are updated
 * @param options - Options for the hook
 * @returns void
 */
export function useTokenUpdates(options: {
  queryKey?: string[];
  onUpdate?: () => void;
  delay?: number;
} = {}) {
  const {
    queryKey = ['user-tokens'],
    onUpdate,
    delay = 200
  } = options;
  
  const queryClient = useQueryClient();

  useEffect(() => {
    // Register the listener
    const unsubscribe = subscribeToTokenUpdates(() => {
      // Add a small delay to ensure DB updates are complete
      setTimeout(() => {
        // Invalidate and refetch when tokens are updated
        queryClient.invalidateQueries({ queryKey });
        
        // Call the onUpdate callback if provided
        if (onUpdate) {
          onUpdate();
        }
      }, delay);
    });

    // Clean up the listener when component unmounts
    return () => {
      unsubscribe();
    };
  }, [queryClient, queryKey, onUpdate, delay]);
} 