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

  // Check if already generated (no double-charge)
  const { data: existing } = await supabase
    .from('generated_profiles')
    .select('id, card_image_url')
    .eq('user_id', user.id)
    .eq('hip', hip)
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

  // Look up horse data
  const horse = lookupHip(hip);
  if (!horse) {
    // Refund credit since we can't generate
    await supabase.rpc('consume_credit', { p_user_id: user.id }); // TODO: add a refund_credit function
    return NextResponse.json({ error: `Hip ${hip} not found` }, { status: 404 });
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
  const filename = `${user.id}/hip_${hip}.png`;
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
    sale_id: 'obs-march-2026',
    card_data: horse,
    card_image_url: cardImageUrl,
  });

  return NextResponse.json({
    card_image_url: cardImageUrl,
    already_generated: false,
  });
}
