import { redirect } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/server';
import DashboardFallback from '@/app/dashboard/dashboard-fallback';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get the current session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Handle unauthenticated case (though middleware should catch this)
    redirect('/');
  }

  // Check if user has any resumes
  const { data: resumes, error } = await supabase
    .from('resumes')
    .select('id')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1);

  // Redirect to most recent resume if available
  if (!error && resumes && resumes.length > 0) {
    redirect(`/dashboard/${resumes[0].id}`);
  }

  // Render the dashboard normally if no resumes found
  return <DashboardFallback />;
}
