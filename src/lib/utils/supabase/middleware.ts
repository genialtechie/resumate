import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const user = await supabase.auth.getUser();

  // protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Allow /dashboard/[id] routes if user is authenticated
    if (!user.error && user.data.user) {
      return response;
    }
    // Only redirect to home if user is not authenticated
    if (user.error) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect all API routes
  if (request.nextUrl.pathname.startsWith('/api/') && user.error) {
    // For API routes, redirect to home page if it's a browser request
    // This prevents infinite loops in components trying to fetch data
    const accept = request.headers.get('accept') || '';
    if (accept.includes('text/html')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // For fetch/axios requests, return a 401 response with JSON
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  }

  // Redirect authenticated users from home to dashboard
  if (request.nextUrl.pathname === '/' && !user.error && user.data.user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }


  return response;
};
