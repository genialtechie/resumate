import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing local storage
 * @param key - The key to store the value in
 * @param initialValue - The initial value to store
 * @param validator - A function to validate the value
 * @returns A tuple containing the state, setState function, and clearStorage function
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (value: unknown) => boolean
) {
  // Initialize state with value from localStorage or initial value
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (!validator || validator(parsed)) {
          return parsed;
        }
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      if (state === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  }, [key, state]);

  // Clear storage
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState(initialValue);
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  }, [key, initialValue]);

  return [state, setState, clearStorage] as const;
}
