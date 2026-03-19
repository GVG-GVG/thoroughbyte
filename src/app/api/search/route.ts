import { NextRequest, NextResponse } from 'next/server';
import { lookupHip, searchHips } from '@/lib/horse-lookup';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hip = searchParams.get('hip');
  const q = searchParams.get('q'); // autocomplete prefix
  const sale = searchParams.get('sale') || 'obs-march-2026';

  // Autocomplete mode
  if (q) {
    const matches = searchHips(q, sale);
    return NextResponse.json({ results: matches });
  }

  // Full lookup mode
  if (!hip) {
    return NextResponse.json({ error: 'Missing hip parameter' }, { status: 400 });
  }

  const hipNum = parseInt(hip, 10);
  if (isNaN(hipNum)) {
    return NextResponse.json({ error: 'Invalid hip number' }, { status: 400 });
  }

  const horse = lookupHip(hipNum, sale);
  if (!horse) {
    return NextResponse.json({ error: `Hip ${hipNum} not found in dataset` }, { status: 404 });
  }

  return NextResponse.json({ horse });
}
