import { createClient } from '@/lib/utils/supabase/server';

// Efficient way to get the user ID
export async function getUserIdFromRequest(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    throw new Error('Unauthorized: User ID not found');
  }

  return user.id;
}

export const getRedirectURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? `${url}dashboard` : `${url}/dashboard`;
  return url;
};
