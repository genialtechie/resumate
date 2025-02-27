import { redirect } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/server';
import DashboardFallback from '@/app/dashboard/dashboard-fallback';

export default async function DashboardPage() {
  const supabase = await createClient();
  let latestResumeId: string | null = null;

  // Get the current session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  try {
    // Check if user has any resumes
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!error && resumes && resumes.length > 0) {
      latestResumeId = resumes[0].id;
    }
  } catch (err) {
    console.error('Error in resume fetch:', err);
  } finally {
    // Redirect to most recent resume if we found one
    if (latestResumeId) {
      redirect(`/dashboard/${latestResumeId}`);
    }
    // Otherwise, show the upload page
    return <DashboardFallback />;
  }
}
