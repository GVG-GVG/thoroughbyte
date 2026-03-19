import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lookupHip } from '@/lib/horse-lookup';
import { renderProfileCard } from '@/lib/card-renderer';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse request
  const body = await request.json();
  const hip = parseInt(body.hip, 10);
  if (isNaN(hip)) {
    return NextResponse.json({ error: 'Invalid hip number' }, { status: 400 });
  }

  // Parse sale from request
  const saleId = body.sale || 'obs-march-2026';

  // Check if already generated (no double-charge)
  const { data: existing } = await supabase
    .from('generated_profiles')
    .select('id, card_image_url')
    .eq('user_id', user.id)
    .eq('hip', hip)
    .eq('sale_id', saleId)
    .single();

  if (existing) {
    return NextResponse.json({
      card_image_url: existing.card_image_url,
      already_generated: true,
    });
  }

  // Consume credit (atomic)
  const { data: creditOk, error: creditError } = await supabase
    .rpc('consume_credit', { p_user_id: user.id });

  if (creditError || !creditOk) {
    return NextResponse.json(
      { error: 'No credits remaining. Upgrade to Pro for unlimited access.' },
      { status: 402 }
    );
  }

  // Look up horse data (sale-aware)
  const horse = lookupHip(hip, saleId);
  if (!horse) {
    // Refund the consumed credit since generation cannot proceed.
    // Try atomic RPC first, fall back to read+write if RPC doesn't exist.
    const { error: refundErr } = await supabase.rpc('refund_credit', { p_user_id: user.id });
    if (refundErr) {
      const { data: prof } = await supabase.from('profiles').select('credits_remaining, plan').eq('id', user.id).single();
      if (prof && prof.plan !== 'pro') {
        await supabase.from('profiles').update({ credits_remaining: prof.credits_remaining + 1 }).eq('id', user.id);
      }
    }
    return NextResponse.json({ error: `Hip ${hip} not found in ${saleId}` }, { status: 404 });
  }

  // Generate PNG
  let pngBuffer: Buffer;
  try {
    pngBuffer = await renderProfileCard(horse);
  } catch (err) {
    console.error('Card render failed:', err);
    return NextResponse.json({ error: 'Card generation failed' }, { status: 500 });
  }

  // Upload to Supabase Storage
  const filename = `${user.id}/${saleId}_hip_${hip}.png`;
  const { error: uploadError } = await supabase.storage
    .from('profile-cards')
    .upload(filename, pngBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload failed:', uploadError);
    return NextResponse.json({ error: 'Failed to store card image' }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('profile-cards')
    .getPublicUrl(filename);

  const cardImageUrl = urlData.publicUrl;

  // Record in generated_profiles
  await supabase.from('generated_profiles').insert({
    user_id: user.id,
    hip,
    sale_id: saleId,
    card_data: horse,
    card_image_url: cardImageUrl,
  });

  return NextResponse.json({
    card_image_url: cardImageUrl,
    already_generated: false,
  });
}
