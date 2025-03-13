'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { TokenInfo } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';
import {
  subscribeToTokenUpdates,
  publishTokenUpdate,
} from '@/lib/utils/token-updates';

/**
 * Fetch token information
 * @returns The token information
 */
async function fetchTokens(): Promise<TokenInfo> {
  const response = await fetch('/api/user/tokens');
  if (!response.ok) {
    throw new Error('Failed to fetch token information');
  }
  return response.json();
}

/**
 * Token Display component
 * @description This component displays the user's token information.
 */
export function TokenDisplay() {
  const queryClient = useQueryClient();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-tokens'],
    queryFn: fetchTokens,
    refetchInterval: 60000, // Refetch every minute
  });

  // Set up listener for token updates
  useEffect(() => {
    // Register the listener
    const unsubscribe = subscribeToTokenUpdates(() => {
      // Invalidate and refetch when tokens are updated
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
    });

    // Set up event listener for the custom event
    publishTokenUpdate();

    // Clean up the listener when component unmounts
    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  // Handler for mobile clicks
  const handleClick = () => {
    setTooltipOpen((prev) => !prev);
  };

  if (isLoading)
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-slate-800/60 border border-slate-700/50 animate-pulse flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-slate-700/80"></div>
        </div>
        <span className="text-sm font-medium text-slate-600 animate-pulse hidden md:inline">
          tokens
        </span>
      </div>
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
    <TooltipProvider>
      <Tooltip
        delayDuration={300}
        open={tooltipOpen}
        onOpenChange={setTooltipOpen}
      >
        <TooltipTrigger
          asChild
          onClick={handleClick}
        >
          <div className="flex items-center space-x-2 cursor-pointer">
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
                  textColor: '#fff',
                })}
              />
            </div>
            <span className="text-sm font-medium hidden md:inline">tokens</span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          className="p-3 max-w-xs z-50 bg-slate-900 border border-slate-800 text-slate-100"
        >
          <div className="space-y-2">
            <p className="font-medium">AI Token Usage</p>
            <p>
              <span className="font-semibold">{data.tokensRemaining}</span>{' '}
              tokens remaining of <span className="font-semibold">{total}</span>{' '}
              total
            </p>
            <p className="text-xs text-slate-400">
              Resets in {formatDistanceToNow(nextReset, { addSuffix: false })}
            </p>
            <div className="pt-1 text-xs">
              Each AI operation costs tokens:
              <ul className="list-disc pl-4 pt-1">
                <li>Resume parse: 1 token</li>
                <li>Cover letter: 2 tokens</li>
                <li>Resume tailoring: 3 tokens</li>
              </ul>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
