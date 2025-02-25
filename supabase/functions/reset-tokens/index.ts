// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Hello from Functions!")

serve(async (req: Request) => {
  // Verify secret key for security
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('FUNCTION_SECRET')}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Connect to Supabase
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  // Call the function to reset tokens
  const { error } = await supabaseClient.rpc('reset_tokens_weekly');
  
  if (error) {
    console.error('Error resetting tokens:', error);
    return new Response(JSON.stringify({ error: 'Failed to reset tokens' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

/* To invoke locally:

  1. Run `supabase start`
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reset-tokens' \
    --header 'Authorization: Bearer YOUR_FUNCTION_SECRET' \
    --header 'Content-Type: application/json'

  To deploy:
  1. Run `supabase functions deploy reset-tokens`
  2. Set up environment variables on Supabase:
     - SUPABASE_URL: Your Supabase project URL
     - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key
     - FUNCTION_SECRET: A secure random string to authenticate requests
*/
