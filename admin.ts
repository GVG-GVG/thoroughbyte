import { createClient } from './server';

/**
 * Verify the current user is an admin. Returns the admin profile or null.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') return null;

  return { supabase, user, profile };
}
