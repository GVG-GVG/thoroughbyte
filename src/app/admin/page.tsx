import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminDashboard from './AdminDashboard';
import './admin.css';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/signin?redirect=/admin');

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') redirect('/dashboard');

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch all generated profiles for card counts
  const { data: allCards } = await supabase
    .from('generated_profiles')
    .select('user_id, created_at');

  // Fetch recent admin actions
  const { data: recentActions } = await supabase
    .from('admin_actions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  // Aggregate stats
  const users = profiles || [];
  const cards = allCards || [];
  const cardCountMap: Record<string, number> = {};
  for (const c of cards) {
    cardCountMap[c.user_id] = (cardCountMap[c.user_id] || 0) + 1;
  }

  const stats = {
    totalUsers: users.length,
    freeUsers: users.filter(u => u.plan === 'free').length,
    proUsers: users.filter(u => u.plan === 'pro').length,
    totalCards: cards.length,
    totalCreditsRemaining: users.reduce((sum, u) => sum + (u.credits_remaining || 0), 0),
    usersWithCards: Object.keys(cardCountMap).length,
  };

  const usersWithCounts = users.map(u => ({
    ...u,
    cards_generated: cardCountMap[u.id] || 0,
  }));

  return (
    <AdminDashboard
      stats={stats}
      users={usersWithCounts}
      adminEmail={user.email || ''}
      recentActions={recentActions || []}
    />
  );
}
