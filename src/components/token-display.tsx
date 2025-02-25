'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { TokenInfo } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEffect } from 'react';
import { TokenService } from '@/lib/utils/token-service';

async function fetchTokens(): Promise<TokenInfo> {
  const response = await fetch('/api/user/tokens');
  if (!response.ok) {
    throw new Error('Failed to fetch token information');
  }
  return response.json();
}

export function TokenDisplay() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-tokens'],
    queryFn: fetchTokens,
    refetchInterval: 60000, // Refetch every minute
  });

  // Set up listener for token updates
  useEffect(() => {
    // Register the listener
    const unsubscribe = TokenService.onTokenUpdate(() => {
      // Invalidate and refetch when tokens are updated
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
    });

    // Clean up the listener when component unmounts
    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  if (isLoading)
    return (
      <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>
    );

  if (error || !data)
    return (
      <div className="text-red-500 text-sm">
        Failed to load token information
      </div>
    );

  const total = data.tokensRemaining + data.tokensUsed;
  const percentage = (data.tokensRemaining / total) * 100;
  const nextReset = new Date(data.nextReset);

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div className="flex items-center space-x-2 cursor-help">
          <div className="w-8 h-8">
            <CircularProgressbar
              value={percentage}
              text={`${data.tokensRemaining}`}
              styles={buildStyles({
                textSize: '35px',
                pathColor:
                  percentage > 30
                    ? '#4CAF50'
                    : percentage > 10
                    ? '#FF9800'
                    : '#F44336',
                textColor: '#333',
              })}
            />
          </div>
          <span className="text-sm font-medium">tokens</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="p-3 max-w-xs">
        <div className="space-y-2">
          <p className="font-medium">AI Token Usage</p>
          <p>
            <span className="font-semibold">{data.tokensRemaining}</span> tokens
            remaining of <span className="font-semibold">{total}</span> total
          </p>
          <p className="text-xs text-gray-500">
            Resets in {formatDistanceToNow(nextReset, { addSuffix: true })}
          </p>
          <div className="pt-1 text-xs">
            Each AI operation costs tokens:
            <ul className="list-disc pl-4 pt-1">
              <li>Resume parse: 1 token</li>
              <li>Cover letter: 2 tokens</li>
              <li>Resume tailoring: 2 tokens</li>
            </ul>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
