import { useEffect, useCallback } from 'react';

type KeyboardShortcut = {
  key: string;
  ctrlOrCmd?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  preventDefault?: boolean;
};

export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  callback: (e: KeyboardEvent) => void,
  enabled = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const matchesCtrlOrCmd = shortcut.ctrlOrCmd
        ? event.ctrlKey || event.metaKey
        : !event.ctrlKey && !event.metaKey;
      const matchesAlt =
        shortcut.altKey === undefined || event.altKey === shortcut.altKey;
      const matchesShift =
        shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;

      if (matchesKey && matchesCtrlOrCmd && matchesAlt && matchesShift) {
        if (shortcut.preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        callback(event);
      }
    },
    [callback, shortcut]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}
