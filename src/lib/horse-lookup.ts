/**
 * Horse data lookup and percentile computation.
 * Mirrors the logic from the profile card prototype.
 */

import rawData from './horse-data.json';

// ── Types ──

export interface RawHorse {
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

export interface PeerStats {
  n: number;
  time: number;
  stride: number;
  eighth: number;
  quarter: number;
  decel: number;
  label: string;
}

export interface Percentiles {
  time: number;
  stride: number;
  eighth: number;
  quarter: number;
  decel: number;
  rating: number;
}

export interface EnrichedHorse {
  hip: number;
  sex: string;
  sire: string;
  dam: string;
  state: string;
  consigner: string;
  day: number;
  set: number;
  dist: string;
  time: number;
  stride: number;
  eighth: number;
  quarter: number;
  decel: number;
  rating: number;
  tier: string;
  rank: number;
  totalRanked: number;
  saleStatus: string;
  salePrice: number;
  pctl: Percentiles;
  peer: PeerStats;
}

// ── Parse raw data ──

const horses: RawHorse[] = rawData as RawHorse[];
const totalRanked = horses.length;

function parsePrice(s: string): number {
  if (!s) return 0;
  return parseInt(s.replace(/[$,]/g, ''), 10) || 0;
}

// ── Build peer groups ──

interface PeerGroup {
  key: string;
  horses: RawHorse[];
  time: number[];
  stride: number[];
  eighth: number[];
  quarter: number[];
  decel: number[];
  rating: number[];
}

const peerGroups = new Map<string, PeerGroup>();

for (const h of horses) {
  const key = `${h.sex}|${h.section}`;
  if (!peerGroups.has(key)) {
    peerGroups.set(key, {
      key,
      horses: [],
      time: [], stride: [], eighth: [], quarter: [], decel: [], rating: []
    });
  }
  const g = peerGroups.get(key)!;
  g.horses.push(h);
  g.time.push(parseFloat(h.time));
  g.stride.push(parseFloat(h.stride));
  g.eighth.push(parseFloat(h.eighth_out));
  g.quarter.push(parseFloat(h.quarter_out));
  g.decel.push(parseFloat(h.decel));
  g.rating.push(parseFloat(h.rating));
}

// Sort each metric array for percentile computation
for (const g of peerGroups.values()) {
  g.time.sort((a, b) => a - b);
  g.stride.sort((a, b) => a - b);
  g.eighth.sort((a, b) => a - b);
  g.quarter.sort((a, b) => a - b);
  g.decel.sort((a, b) => a - b);
  g.rating.sort((a, b) => a - b);
}

function avg(arr: number[]): number {
  return Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 100) / 100;
}

// For time, eighth, quarter, decel: LOWER is better (percentile = % of peers you beat)
// For stride, rating: HIGHER is better
function percentileDesc(arr: number[], val: number): number {
  // Lower is better: what % of peers are WORSE (higher) than you
  const beaten = arr.filter(v => v > val).length;
  return Math.round((beaten / arr.length) * 100);
}

function percentileAsc(arr: number[], val: number): number {
  // Higher is better: what % of peers are WORSE (lower) than you
  const beaten = arr.filter(v => v < val).length;
  return Math.round((beaten / arr.length) * 100);
}

// ── Precomputed peer averages ──

function getPeerStats(sex: string, section: string): PeerStats {
  const key = `${sex}|${section}`;
  const g = peerGroups.get(key);
  if (!g) {
    return { n: 0, time: 0, stride: 0, eighth: 0, quarter: 0, decel: 0, label: '' };
  }
  const sexWord = sex === 'C' ? 'colts' : 'fillies';
  return {
    n: g.horses.length,
    time: avg(g.time),
    stride: avg(g.stride),
    eighth: avg(g.eighth),
    quarter: avg(g.quarter),
    decel: avg(g.decel),
    label: `${sexWord} breezing ${section} mile`
  };
}

// ── Lookup ──

const hipIndex = new Map<number, RawHorse>();
for (const h of horses) {
  hipIndex.set(parseInt(h.hip, 10), h);
}

export function lookupHip(hip: number): EnrichedHorse | null {
  const raw = hipIndex.get(hip);
  if (!raw) return null;

  const key = `${raw.sex}|${raw.section}`;
  const g = peerGroups.get(key);
  if (!g) return null;

  const time = parseFloat(raw.time);
  const stride = parseFloat(raw.stride);
  const eighth = parseFloat(raw.eighth_out);
  const quarter = parseFloat(raw.quarter_out);
  const decel = parseFloat(raw.decel);
  const rating = parseFloat(raw.rating);

  const pctl: Percentiles = {
    time: percentileDesc(g.time, time),
    stride: percentileAsc(g.stride, stride),
    eighth: percentileDesc(g.eighth, eighth),
    quarter: percentileDesc(g.quarter, quarter),
    decel: percentileDesc(g.decel, decel),
    rating: percentileAsc(g.rating, rating),
  };

  return {
    hip: parseInt(raw.hip, 10),
    sex: raw.sex,
    sire: raw.sire,
    dam: raw.dam.replace(/\s*-\s*BTProd\.?$/, ''),
    state: raw.st,
    consigner: raw.consigner,
    day: parseInt(raw.day, 10),
    set: parseInt(raw.set, 10),
    dist: raw.section,
    time,
    stride,
    eighth,
    quarter,
    decel,
    rating,
    tier: raw.tier,
    rank: parseInt(raw.rank, 10),
    totalRanked,
    saleStatus: raw.sale_status,
    salePrice: parsePrice(raw.sale_price),
    pctl,
    peer: getPeerStats(raw.sex, raw.section),
  };
}

/** Return all hip numbers in dataset */
export function allHips(): number[] {
  return Array.from(hipIndex.keys()).sort((a, b) => a - b);
}

/** Quick search by hip prefix (for autocomplete) */
export function searchHips(query: string): number[] {
  const q = query.trim();
  if (!q) return [];
  return allHips().filter(h => h.toString().startsWith(q)).slice(0, 20);
}
