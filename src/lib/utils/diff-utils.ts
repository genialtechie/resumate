import { diffWords } from 'diff';

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

/**
 * Checks if two text strings have any differences
 * @param oldText Original text
 * @param newText Modified text
 * @returns True if texts differ, false if they're identical
 */
export function hasTextDifferences(oldText: string, newText: string): boolean {
  if (oldText === newText) return false;
  
  const diff = diffWords(oldText || '', newText || '');
  return diff.some(part => part.added || part.removed);
}

/**
 * Creates a debounced version of a function
 * @param func The function to debounce
 * @param wait Wait time in ms
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Optimized diff generator for potentially large text blocks
 * Uses debouncing for large texts to avoid performance issues
 * @param oldText Original text
 * @param newText Modified text
 * @param callback Function to call with diff results
 * @param delay Debounce delay in ms
 */
export function generateOptimizedDiff(
  oldText: string, 
  newText: string, 
  callback: (diff: DiffPart[]) => void,
  delay = 300
): void {
  // If texts are identical or both empty, return simple diff immediately
  if (oldText === newText || (!oldText && !newText)) {
    callback([{ value: newText || '' }]);
    return;
  }

  // For longer texts, use debouncing
  if ((oldText?.length || 0) + (newText?.length || 0) > 1000) {
    const debouncedDiff = debounce(() => {
      const diff = diffWords(oldText || '', newText || '');
      callback(diff);
    }, delay);
    
    debouncedDiff();
    return;
  }
  
  // For shorter texts, calculate immediately
  const diff = diffWords(oldText || '', newText || '');
  callback(diff);
} 