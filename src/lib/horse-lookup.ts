/**
 * Horse data lookup and percentile computation.
 * Sale-aware: loads all sale datasets and looks up by sale + hip.
 */

import march2026Data from './horse-data.json';
import march2025Data from './horse-data-obs-march-2025.json';
import april2025Data from './horse-data-obs-april-2025.json';
import march2024Data from './horse-data-obs-march-2024.json';
import april2024Data from './horse-data-obs-april-2024.json';

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
  saleId: string;
  saleLabel: string;
  pctl: Percentiles;
  peer: PeerStats;
}

// ── Sale metadata ──

interface SaleMeta {
  label: string;
  year: string;
  photoUrlPrefix: string | null; // null = no photos available
}

const SALE_META: Record<string, SaleMeta> = {
  'obs-march-2026': { label: 'OBS March 2026', year: '2026', photoUrlPrefix: 'https://obscatalog.com/2026/149/' },
  'obs-april-2025': { label: 'OBS April 2025', year: '2025', photoUrlPrefix: null },
  'obs-march-2025': { label: 'OBS March 2025', year: '2025', photoUrlPrefix: null },
  'obs-april-2024': { label: 'OBS April 2024', year: '2024', photoUrlPrefix: null },
  'obs-march-2024': { label: 'OBS March 2024', year: '2024', photoUrlPrefix: null },
};

const SALE_DATA: Record<string, RawHorse[]> = {
  'obs-march-2026': march2026Data as RawHorse[],
  'obs-april-2025': april2025Data as RawHorse[],
  'obs-march-2025': march2025Data as RawHorse[],
  'obs-april-2024': april2024Data as RawHorse[],
  'obs-march-2024': march2024Data as RawHorse[],
};

// ── Parse helpers ──

function parsePrice(s: string): number {
  if (!s) return 0;
  return parseInt(s.replace(/[$,]/g, ''), 10) || 0;
}

function avg(arr: number[]): number {
  return Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 100) / 100;
}

function percentileDesc(arr: number[], val: number): number {
  const beaten = arr.filter(v => v > val).length;
  return Math.round((beaten / arr.length) * 100);
}

function percentileAsc(arr: number[], val: number): number {
  const beaten = arr.filter(v => v < val).length;
  return Math.round((beaten / arr.length) * 100);
}

// ── Per-sale precomputed indexes ──

interface SaleIndex {
  hipMap: Map<number, RawHorse>;
  peerGroups: Map<string, {
    horses: RawHorse[];
    time: number[];
    stride: number[];
    eighth: number[];
    quarter: number[];
    decel: number[];
    rating: number[];
  }>;
  totalRanked: number;
}

const saleIndexes = new Map<string, SaleIndex>();

function getOrBuildIndex(saleId: string): SaleIndex | null {
  if (saleIndexes.has(saleId)) return saleIndexes.get(saleId)!;

  const horses = SALE_DATA[saleId];
  if (!horses) return null;

  const hipMap = new Map<number, RawHorse>();
  const peerGroups = new Map<string, {
    horses: RawHorse[];
    time: number[];
    stride: number[];
    eighth: number[];
    quarter: number[];
    decel: number[];
    rating: number[];
  }>();

  for (const h of horses) {
    hipMap.set(parseInt(h.hip, 10), h);

    const key = `${h.sex}|${h.section}`;
    if (!peerGroups.has(key)) {
      peerGroups.set(key, {
        horses: [], time: [], stride: [], eighth: [], quarter: [], decel: [], rating: []
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

  for (const g of peerGroups.values()) {
    g.time.sort((a, b) => a - b);
    g.stride.sort((a, b) => a - b);
    g.eighth.sort((a, b) => a - b);
    g.quarter.sort((a, b) => a - b);
    g.decel.sort((a, b) => a - b);
    g.rating.sort((a, b) => a - b);
  }

  const index: SaleIndex = { hipMap, peerGroups, totalRanked: horses.length };
  saleIndexes.set(saleId, index);
  return index;
}

// ── Lookup ──

export function lookupHip(hip: number, saleId: string = 'obs-march-2026'): EnrichedHorse | null {
  const idx = getOrBuildIndex(saleId);
  if (!idx) return null;

  const raw = idx.hipMap.get(hip);
  if (!raw) return null;

  const key = `${raw.sex}|${raw.section}`;
  const g = idx.peerGroups.get(key);
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

  const sexWord = raw.sex === 'C' ? 'colts' : 'fillies';
  const meta = SALE_META[saleId] || SALE_META['obs-march-2026'];

  const peer: PeerStats = {
    n: g.horses.length,
    time: avg(g.time),
    stride: avg(g.stride),
    eighth: avg(g.eighth),
    quarter: avg(g.quarter),
    decel: avg(g.decel),
    label: `${sexWord} breezing ${raw.section} mile`,
  };

  return {
    hip: parseInt(raw.hip, 10),
    sex: raw.sex,
    sire: raw.sire,
    dam: raw.dam,
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
    totalRanked: idx.totalRanked,
    saleStatus: raw.sale_status,
    salePrice: parsePrice(raw.sale_price),
    saleId,
    saleLabel: meta.label,
    pctl,
    peer,
  };
}

/** Return all hip numbers for a given sale */
export function allHips(saleId: string = 'obs-march-2026'): number[] {
  const idx = getOrBuildIndex(saleId);
  if (!idx) return [];
  return Array.from(idx.hipMap.keys()).sort((a, b) => a - b);
}

/** Quick search by hip prefix (for autocomplete) */
export function searchHips(query: string, saleId: string = 'obs-march-2026'): number[] {
  const q = query.trim();
  if (!q) return [];
  return allHips(saleId).filter(h => h.toString().startsWith(q)).slice(0, 20);
}

/** Get photo URL for a horse in a given sale */
export function getPhotoUrl(hip: number, saleId: string = 'obs-march-2026'): string | null {
  const meta = SALE_META[saleId];
  if (!meta?.photoUrlPrefix) return null;
  return `${meta.photoUrlPrefix}${hip}p.jpg`;
}

/** Get sale label */
export function getSaleLabel(saleId: string): string {
  return SALE_META[saleId]?.label || saleId;
}
