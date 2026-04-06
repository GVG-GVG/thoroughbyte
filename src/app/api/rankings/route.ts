import { NextRequest, NextResponse } from 'next/server';
import march2026 from '@/lib/horse-data.json';
import april2026 from '@/lib/horse-data-obs-april-2026.json';
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
  btw?: boolean;
  btp?: boolean;
  btprod?: boolean;
}

const SALE_MAP: Record<string, RawHorse[]> = {
  'obs-april-2026': april2026 as RawHorse[],
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

function isValueFlag(tier: string, saleStatus: string, salePrice: number): boolean {
  return (tier === 'ELITE' || tier === 'STRONG') &&
    saleStatus === 'SOLD' &&
    salePrice > 0 &&
    salePrice < 100000;
}

function transform(rawData: RawHorse[]) {
  return rawData.map(h => {
    const tier = h.tier;
    const saleStatus = h.sale_status;
    const salePrice = parsePrice(h.sale_price);
    return {
      hip: parseInt(h.hip, 10),
      rank: parseInt(h.rank, 10),
      state: h.st || '',
      sire: h.sire,
      dam: h.dam,
      consigner: h.consigner || '',
      sex: h.sex,
      section: h.section,
      tier,
      rating: parseFloat(h.rating),
      time: parseFloat(h.time),
      stride: parseFloat(h.stride),
      decel: parseFloat(h.decel),
      eighthOut: parseFloat(h.eighth_out),
      quarterOut: parseFloat(h.quarter_out),
      day: parseInt(h.day, 10) || 0,
      saleStatus,
      salePrice,
      btw: h.btw ?? false,
      btp: h.btp ?? false,
      btprod: h.btprod ?? false,
      valueFlag: isValueFlag(tier, saleStatus, salePrice),
    };
  });
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

  // Only include horses that have breeze data (non-empty time = has been worked)
  const allHorses = transform(rawData);
  const horses = allHorses.filter(h => !isNaN(h.time) && h.time > 0);
  return NextResponse.json({ horses, sale, totalCatalog: rawData.length });
}
