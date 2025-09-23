/**
 * Client-safe token update mechanism
 * This file provides a simple pub/sub system for token updates that works in client components
 */

// Define the type for token update listeners
type TokenUpdateListener = () => void;

// Store listeners in a client-safe way
const listeners: TokenUpdateListener[] = [];

/**
 * Subscribe to token updates
 * @param callback - The callback to call when a token update occurs
 * @returns A function to unsubscribe
 */
export function subscribeToTokenUpdates(
  callback: TokenUpdateListener
): () => void {
  listeners.push(callback);

  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

/**
 * Publish a token update event
 * This should be called by API routes after token operations
 * @returns void
 */
export function publishTokenUpdate(): void {
  // Use setTimeout to ensure this runs after the current call stack
  setTimeout(() => {
    listeners.forEach((listener) => listener());
  }, 0);
}

/**
 * Trigger a token update
 * @returns void
 */
export async function triggerTokenUpdate(): Promise<void> {
  try {
    // Make a call to a simple API endpoint that will publish the update
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const url = new URL('/api/user/tokens/update', baseUrl);
    await fetch(url.toString(), { method: 'POST' });
  } catch (error) {
    console.error('Failed to trigger token update:', error);
  }
}
