import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing card id' }, { status: 400 });
  }

  // Fetch the row first to get storage path info (must belong to this user)
  const { data: card, error: fetchErr } = await supabase
    .from('generated_profiles')
    .select('id, hip, sale_id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchErr || !card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  // Delete the PNG from Supabase Storage
  const storagePath = `${user.id}/${card.sale_id}_hip_${card.hip}.png`;
  const { error: storageErr } = await supabase.storage
    .from('profile-cards')
    .remove([storagePath]);

  if (storageErr) {
    console.error('Storage delete failed:', storageErr);
    // Continue anyway — DB row deletion is more important
  }

  // Delete the DB row
  const { error: deleteErr } = await supabase
    .from('generated_profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteErr) {
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
