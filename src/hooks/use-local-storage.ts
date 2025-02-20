import { useState, useEffect, useCallback } from 'react';

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
