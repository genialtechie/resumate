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
