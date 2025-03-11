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
export function subscribeToTokenUpdates(callback: TokenUpdateListener): () => void {
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
    listeners.forEach(listener => listener());
  }, 0);
}

/**
 * Trigger a token update
 * @returns void
 */
export async function triggerTokenUpdate(): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      // Server-side: skip fetch request and just publish the update directly
      publishTokenUpdate();
    } else {
      // Client-side: make API call with credentials
      const response = await fetch('/api/user/tokens/update', { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Check response and call publishTokenUpdate only if successful
      if (response.ok) {
        publishTokenUpdate();
      } else {
        console.error('Token update failed:', await response.text());
      }
    }
  } catch (error) {
    console.error('Failed to trigger token update:', error);
  }
} 