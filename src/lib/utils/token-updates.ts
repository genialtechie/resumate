import { TokenInfo } from '@/types';

/**
 * Client-safe token update mechanism
 * This file provides a simple pub/sub system for token updates that works in client components
 */

// Define the type for token update listeners
type TokenUpdateListener = () => void;

// Store listeners in a client-safe way
const listeners: TokenUpdateListener[] = [];

// Custom event name for token updates
const TOKEN_UPDATE_EVENT = 'resumate-token-update';

/**
 * Subscribe to token updates
 * @param callback - The callback to call when a token update occurs
 * @returns A function to unsubscribe
 */
export function subscribeToTokenUpdates(callback: TokenUpdateListener): () => void {
  // Add to local listeners for backward compatibility
  listeners.push(callback);
  
  // Create the event listener function
  const eventListener = () => callback();
  
  // Add global event listener if in browser
  if (typeof window !== 'undefined') {
    window.addEventListener(TOKEN_UPDATE_EVENT, eventListener);
  }
  
  // Return unsubscribe function
  return () => {
    // Remove from local listeners
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    
    // Remove global event listener if in browser
    if (typeof window !== 'undefined') {
      window.removeEventListener(TOKEN_UPDATE_EVENT, eventListener);
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
    // Call local listeners for backward compatibility
    listeners.forEach(listener => listener());
    
    // Dispatch global event if in browser
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(TOKEN_UPDATE_EVENT));
    }
  }, 0);
}

/**
 * Trigger a token update
 * @returns Promise<TokenInfo | null> - The updated token info or null if the update failed
 */
export async function triggerTokenUpdate(): Promise<TokenInfo | null> {
  try {
    if (typeof window === 'undefined') {
      // Server-side: skip fetch request and just publish the update directly
      publishTokenUpdate();
      return null;
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
        const data = await response.json();
        
        // Publish the update
        publishTokenUpdate();
        
        // Return the token data for components that want to use it directly
        return data.tokens;
      } else {
        console.error('Token update failed:', await response.text());
        return null;
      }
    }
  } catch (error) {
    console.error('Failed to trigger token update:', error);
    return null;
  }
} 