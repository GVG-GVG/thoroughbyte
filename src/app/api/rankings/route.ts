import { NextRequest, NextResponse } from 'next/server';
import march2026 from '@/lib/horse-data.json';
import march2025 from '@/lib/horse-data-obs-march-2025.json';
import april2025 from '@/lib/horse-data-obs-april-2025.json';
import march2024 from '@/lib/horse-data-obs-march-2024.json';
import april2024 from '@/lib/horse-data-obs-april-2024.json';

interface RawHorse {
  rank: string;
  hip: string;
  st: string;
  sire: string;
  dam: string;
  consigner: string;
  day: string;
  set: string;
  time: string;
  stride: string;
  eighth_out: string;
  quarter_out: string;
  decel: string;
  rating: string;
  tier: string;
  sex: string;
  section: string;
  sale_status: string;
  sale_price: string;
}

const SALE_MAP: Record<string, RawHorse[]> = {
  'obs-march-2026': march2026 as RawHorse[],
  'obs-april-2025': april2025 as RawHorse[],
  'obs-march-2025': march2025 as RawHorse[],
  'obs-april-2024': april2024 as RawHorse[],
  'obs-march-2024': march2024 as RawHorse[],
};

function parsePrice(s: string): number {
  if (!s) return 0;
  return parseInt(s.replace(/[$,]/g, ''), 10) || 0;
}

function transform(rawData: RawHorse[]) {
  return rawData.map(h => ({
    hip: parseInt(h.hip, 10),
    rank: parseInt(h.rank, 10),
    state: h.st || '',
    sire: h.sire,
    dam: h.dam,
    consigner: h.consigner || '',
    sex: h.sex,
    section: h.section,
    tier: h.tier,
    rating: parseFloat(h.rating),
    time: parseFloat(h.time),
    stride: parseFloat(h.stride),
    decel: parseFloat(h.decel),
    eighthOut: parseFloat(h.eighth_out),
    quarterOut: parseFloat(h.quarter_out),
    day: parseInt(h.day, 10) || 0,
    saleStatus: h.sale_status,
    salePrice: parsePrice(h.sale_price),
  }));
}

export async function GET(request: NextRequest) {
  const sale = request.nextUrl.searchParams.get('sale') || 'obs-march-2026';
  const rawData = SALE_MAP[sale];

  if (!rawData) {
    return NextResponse.json(
      { error: 'Unknown sale', available: Object.keys(SALE_MAP) },
      { status: 400 }
    );
  }

  const horses = transform(rawData);
  return NextResponse.json({ horses, sale });
}
