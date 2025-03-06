import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a client for the Supabase browser
 * @returns The Supabase client
 */
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
