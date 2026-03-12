import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { supabase } = admin;

  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch card counts per user
  const { data: cardCounts } = await supabase
    .from('generated_profiles')
    .select('user_id');

  const countMap: Record<string, number> = {};
  if (cardCounts) {
    for (const row of cardCounts) {
      countMap[row.user_id] = (countMap[row.user_id] || 0) + 1;
    }
  }

  const users = (profiles || []).map((p) => ({
    ...p,
    cards_generated: countMap[p.id] || 0,
  }));

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { supabase, user: adminUser } = admin;
  const body = await request.json();
  const { user_id, plan, credits_remaining, role } = body;

  if (!user_id) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }

  // Get current state for audit
  const { data: before } = await supabase
    .from('profiles')
    .select('plan, credits_remaining, role')
    .eq('id', user_id)
    .single();

  // Build update object
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (plan !== undefined) updates.plan = plan;
  if (credits_remaining !== undefined) updates.credits_remaining = credits_remaining;
  if (role !== undefined) updates.role = role;

  const { data: updated, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminUser.id,
    target_user_id: user_id,
    action: 'update_user',
    details: { before, after: updates },
  });

  return NextResponse.json({ user: updated });
}
