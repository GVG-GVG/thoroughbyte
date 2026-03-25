import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/favorites?sale=obs-march-2026
 * Returns array of hip numbers the logged-in user has favorited for that sale.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const saleId = request.nextUrl.searchParams.get('sale') || 'obs-march-2026';

  const { data, error } = await supabase
    .from('favorites')
    .select('hip')
    .eq('user_id', user.id)
    .eq('sale_id', saleId);

  if (error) {
    console.error('Favorites fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }

  return NextResponse.json({ hips: (data || []).map((r: { hip: number }) => r.hip) });
}

/**
 * POST /api/favorites  { hip, sale_id }
 * Toggles favorite: if already favorited, removes it. Otherwise adds it.
 * Returns { favorited: boolean }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const hip = parseInt(body.hip, 10);
  const saleId = body.sale_id || 'obs-march-2026';

  if (isNaN(hip)) {
    return NextResponse.json({ error: 'Invalid hip number' }, { status: 400 });
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('hip', hip)
    .eq('sale_id', saleId)
    .single();

  if (existing) {
    // Unfavorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);

    if (error) {
      console.error('Unfavorite error:', error);
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
    }
    return NextResponse.json({ favorited: false });
  } else {
    // Favorite
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, hip, sale_id: saleId });

    if (error) {
      console.error('Favorite error:', error);
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }
    return NextResponse.json({ favorited: true });
  }
}
