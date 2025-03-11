import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Get host information - try forwarded host first for production environments
      const forwardedHost = request.headers.get('x-forwarded-host'); 
      const forwardedProto = request.headers.get('x-forwarded-proto');
      
      // Different redirect strategies based on environment
      if (process.env.NODE_ENV === 'development') {
        // Development environment - use origin directly
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // Production with load balancer/proxy - use forwarded information
        const protocol = forwardedProto || 'https';
        return NextResponse.redirect(`${protocol}://${forwardedHost}${next}`);
      } else {
        // Fallback to origin if no forwarded host
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
