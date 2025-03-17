import { diffWords } from 'diff';

/**
 * Represents a part of a text diff comparison
 * Used to show added, removed, or unchanged text in diff visualizations
 *
 * @interface
 */
export interface DiffPart {
  /** The text content of this diff part */
  value: string;
  /** Indicates if this part was added in the new text */
  added?: boolean;
  /** Indicates if this part was removed from the original text */
  removed?: boolean;
}

/**
 * Checks if two text strings have any differences
 * Uses word-level diff to determine if texts differ in content
 *
 * @param {string} oldText - Original text
 * @param {string} newText - Modified text
 * @returns {boolean} True if texts differ, false if they're identical
 */
export function hasTextDifferences(oldText: string, newText: string): boolean {
  if (oldText === newText) return false;

  const diff = diffWords(oldText || '', newText || '');
  return diff.some((part) => part.added || part.removed);
}

/**
 * Creates a debounced version of a function
 * The debounced function will delay execution until after wait milliseconds have elapsed
 * since the last time it was invoked
 *
 * @template T - Function type
 * @param {T} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {(...args: Parameters<T>) => void} Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    // Clear previous timeout if it exists
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    // Set a new timeout
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };
}

/**
 * Generates an optimized word-level diff between two texts with debouncing
 * Useful for UI updates that need to show differences without excessive re-rendering
 *
 * @param {string} oldText - Original text
 * @param {string} newText - Modified text
 * @param {function} callback - Function to call with the diff result
 * @param {number} [delay=300] - Debounce delay in milliseconds
 * @returns {void}
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
