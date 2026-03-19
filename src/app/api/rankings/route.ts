import { NextResponse } from 'next/server';
import rawData from '@/lib/horse-data.json';

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

function parsePrice(s: string): number {
  if (!s) return 0;
  return parseInt(s.replace(/[$,]/g, ''), 10) || 0;
}

export async function GET() {
  const horses = (rawData as RawHorse[]).map(h => ({
    hip: parseInt(h.hip, 10),
    rank: parseInt(h.rank, 10),
    state: h.st,
    sire: h.sire,
    dam: h.dam,
    consigner: h.consigner,
    sex: h.sex,
    section: h.section,
    tier: h.tier,
    rating: parseFloat(h.rating),
    time: parseFloat(h.time),
    stride: parseFloat(h.stride),
    decel: parseFloat(h.decel),
    eighthOut: parseFloat(h.eighth_out),
    quarterOut: parseFloat(h.quarter_out),
    day: parseInt(h.day, 10),
    saleStatus: h.sale_status,
    salePrice: parsePrice(h.sale_price),
  }));

  return NextResponse.json({ horses });
}
