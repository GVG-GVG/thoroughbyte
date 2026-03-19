'use client';

import { useState, useEffect, useMemo } from 'react';

interface ConsignerRow {
  rank: number;
  consigner: string;
  tier: string;
  score: number;
  horses: number;
  sold: number;
  salePct: string | null;
  totalSales: string;
  avgPrice: string;
  pctStart: string | null;
  pctWin: string | null;
  pctSW: string | null;
  pctGSW: string | null;
  adjStart: string | null;
  adjWin: string | null;
  adjSW: string | null;
  adjGSW: string | null;
}

type SortField = keyof ConsignerRow;
type SortDir = 'asc' | 'desc';

const TIER_CLASSES: Record<string, string> = {
  'ELITE': 'ct-tier-elite',
  'STRONG': 'ct-tier-strong',
  'ABOVE AVG': 'ct-tier-above',
  'AVERAGE': 'ct-tier-avg',
  'BELOW AVG': 'ct-tier-below',
  'WEAK': 'ct-tier-weak',
};

const TIER_ROW_CLASSES: Record<string, string> = {
  'ELITE': 'ct-row-elite',
  'STRONG': 'ct-row-strong',
  'ABOVE AVG': 'ct-row-above',
  'AVERAGE': 'ct-row-avg',
  'BELOW AVG': 'ct-row-below',
  'WEAK': 'ct-row-weak',
};

function pctVal(v: string | null): number {
  if (v === null || v === undefined || v === '' || v === '-') return -1;
  return parseFloat(v);
}

function parseMoney(v: string): number {
  if (!v || v === '-' || v === '$0') return 0;
  const cleaned = v.replace(/[$,]/g, '');
  if (cleaned.endsWith('M')) return parseFloat(cleaned) * 1_000_000;
  if (cleaned.endsWith('K')) return parseFloat(cleaned) * 1_000;
  return parseFloat(cleaned) || 0;
}

function fmtPct(v: string | null): string {
  if (v === null || v === undefined || v === '' || v === '-') return '—';
  return v + '%';
}

export default function ConsignerTable() {
  const [data, setData] = useState<ConsignerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/consigner-ratings')
      .then(res => res.json())
      .then((rows: ConsignerRow[]) => {
        setData(rows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = data;
    if (tierFilter) {
      result = result.filter(c => c.tier === tierFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.consigner.toLowerCase().includes(q));
    }
    return result;
  }, [data, tierFilter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const field = sortField;
      let aVal: string | number = a[field] as string | number;
      let bVal: string | number = b[field] as string | number;

      // For percentage fields, parse as numbers
      if (['salePct', 'pctStart', 'pctWin', 'pctSW', 'pctGSW', 'adjStart', 'adjWin', 'adjSW', 'adjGSW'].includes(field)) {
        aVal = pctVal(aVal as string | null);
        bVal = pctVal(bVal as string | null);
      }

      // For currency fields, parse "$10.8M" / "$246K" / "$0" to numeric
      if (field === 'totalSales' || field === 'avgPrice') {
        aVal = parseMoney(aVal as string);
        bVal = parseMoney(bVal as string);
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      const diff = (aVal as number) - (bVal as number);
      return sortDir === 'asc' ? diff : -diff;
    });
  }, [filtered, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'consigner' ? 'asc' : field === 'rank' ? 'asc' : 'desc');
    }
  };

  const arrow = (field: SortField) => sortField === field ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : '';

  if (loading) return <div className="ct-loading">Loading consigner ratings...</div>;

  return (
    <div className="ct-wrap">
      <div className="ct-header-row">
        <div>
          <h2 className="ct-title">OBS 2024 Consigner Ratings</h2>
          <p className="ct-subtitle">March &amp; April Combined | Bayesian-Adjusted Racing Outcomes</p>
        </div>
        <div className="ct-count">{sorted.length} of {data.length} consigners</div>
      </div>

      <div className="ct-filter-row">
        <div className="ct-filter-group">
          <label className="ct-filter-label">Tier</label>
          <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="ct-select">
            <option value="">All</option>
            <option value="ELITE">Elite</option>
            <option value="STRONG">Strong</option>
            <option value="ABOVE AVG">Above Avg</option>
            <option value="AVERAGE">Average</option>
            <option value="BELOW AVG">Below Avg</option>
            <option value="WEAK">Weak</option>
          </select>
        </div>
        <div className="ct-filter-group">
          <label className="ct-filter-label">Search</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Consigner name..."
            className="ct-search"
          />
        </div>
        {(tierFilter || search) && (
          <button className="ct-clear-btn" onClick={() => { setTierFilter(''); setSearch(''); }}>
            Clear filters
          </button>
        )}
      </div>

      <div className="ct-table-scroll">
        <table className="ct-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('rank')}>#<span>{arrow('rank')}</span></th>
              <th onClick={() => handleSort('consigner')}>Consigner{arrow('consigner')}</th>
              <th onClick={() => handleSort('tier')}>Tier{arrow('tier')}</th>
              <th onClick={() => handleSort('score')}>Score{arrow('score')}</th>
              <th onClick={() => handleSort('horses')}>Horses{arrow('horses')}</th>
              <th onClick={() => handleSort('sold')}>Sold{arrow('sold')}</th>
              <th onClick={() => handleSort('salePct')}>Sale%{arrow('salePct')}</th>
              <th onClick={() => handleSort('totalSales')}>Total Sales{arrow('totalSales')}</th>
              <th onClick={() => handleSort('avgPrice')}>Avg Price{arrow('avgPrice')}</th>
              <th onClick={() => handleSort('pctStart')}>% Start{arrow('pctStart')}</th>
              <th onClick={() => handleSort('pctWin')}>% Win{arrow('pctWin')}</th>
              <th onClick={() => handleSort('pctSW')}>% SW{arrow('pctSW')}</th>
              <th onClick={() => handleSort('pctGSW')}>% GSW{arrow('pctGSW')}</th>
              <th onClick={() => handleSort('adjStart')}>Adj Start{arrow('adjStart')}</th>
              <th onClick={() => handleSort('adjWin')}>Adj Win{arrow('adjWin')}</th>
              <th onClick={() => handleSort('adjSW')}>Adj SW{arrow('adjSW')}</th>
              <th onClick={() => handleSort('adjGSW')}>Adj GSW{arrow('adjGSW')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => (
              <tr key={c.rank} className={`ct-row ${TIER_ROW_CLASSES[c.tier] ?? ''}`}>
                <td className="ct-num">{c.rank}</td>
                <td className="ct-name">{c.consigner}</td>
                <td><span className={`ct-tier-tag ${TIER_CLASSES[c.tier] ?? ''}`}>{c.tier}</span></td>
                <td className="ct-num ct-score">{c.score.toFixed(1)}</td>
                <td className="ct-num">{c.horses}</td>
                <td className="ct-num">{c.sold}</td>
                <td className="ct-num">{fmtPct(c.salePct)}</td>
                <td className="ct-num">{c.totalSales}</td>
                <td className="ct-num">{c.avgPrice}</td>
                <td className="ct-num">{fmtPct(c.pctStart)}</td>
                <td className="ct-num">{fmtPct(c.pctWin)}</td>
                <td className="ct-num">{fmtPct(c.pctSW)}</td>
                <td className="ct-num">{fmtPct(c.pctGSW)}</td>
                <td className="ct-num">{fmtPct(c.adjStart)}</td>
                <td className="ct-num">{fmtPct(c.adjWin)}</td>
                <td className="ct-num">{fmtPct(c.adjSW)}</td>
                <td className="ct-num">{fmtPct(c.adjGSW)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={17} className="ct-empty">No consigners match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="ct-scoring-note">
        Scoring: 85% Racing (40% Started + 40% Won + 15% SW + 5% GSW, Bayesian k=15) + 15% Volume (cap 30) | Zero-sold penalty: 0.5x | Pink = top 3% | Tiers by percentile
      </div>
    </div>
  );
}
