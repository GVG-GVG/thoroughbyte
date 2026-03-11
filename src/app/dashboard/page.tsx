import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';
import './dashboard.css';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin?redirect=/dashboard');
  }

  // Fetch user profile (credits, plan)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch generated profiles
  const { data: generatedProfiles } = await supabase
    .from('generated_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <DashboardClient
      user={user}
      profile={profile}
      generatedProfiles={generatedProfiles || []}
    />
  );
}
