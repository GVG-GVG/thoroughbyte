'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface Horse {
  hip: number;
  rank: number;
  state: string;
  sire: string;
  dam: string;
  consigner: string;
  sex: string;
  section: string;
  tier: string;
  rating: number;
  time: number;
  stride: number;
  decel: number;
  eighthOut: number;
  quarterOut: number;
  day: number;
  saleStatus: string;
  salePrice: number;
}

type SortField = 'hip' | 'rank' | 'rating' | 'tier' | 'time' | 'stride' | 'decel' | 'eighthOut' | 'quarterOut' | 'sex' | 'sire' | 'consigner' | 'state';
type SortDir = 'asc' | 'desc';

const TIER_ORDER: Record<string, number> = {
  'ELITE': 1,
  'STRONG': 2,
  'ABOVE AVG': 3,
  'AVERAGE': 4,
  'BELOW AVG': 5,
  'WEAK': 6,
};

const TIER_CLASSES: Record<string, string> = {
  'ELITE': 'rl-tier-elite',
  'STRONG': 'rl-tier-strong',
  'ABOVE AVG': 'rl-tier-above',
  'AVERAGE': 'rl-tier-avg',
  'BELOW AVG': 'rl-tier-below',
  'WEAK': 'rl-tier-weak',
};

const TIER_ROW_CLASSES: Record<string, string> = {
  'ELITE': 'rl-row-elite',
  'STRONG': 'rl-row-strong',
  'ABOVE AVG': 'rl-row-above',
  'AVERAGE': 'rl-row-avg',
  'BELOW AVG': 'rl-row-below',
  'WEAK': 'rl-row-weak',
};

export type { Horse };

interface Props {
  onSelectHip?: (hip: number, horse: Horse) => void;
}

export default function RankedList({ onSelectHip }: Props) {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [tierFilter, setTierFilter] = useState<string[]>([]);
  const [sexFilter, setSexFilter] = useState<string>('');
  const [sectionFilter, setSectionFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [sireFilter, setSireFilter] = useState<string>('');
  const [hipSearch, setHipSearch] = useState<string>('');

  useEffect(() => {
    fetch('/api/rankings')
      .then(res => res.json())
      .then(data => {
        setHorses(data.horses);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Get unique states for filter dropdown
  const uniqueStates = useMemo(() => {
    const states = new Set(horses.map(h => h.state).filter(Boolean));
    return Array.from(states).sort();
  }, [horses]);

  // Get unique sires for filter dropdown
  const uniqueSires = useMemo(() => {
    const sires = new Set(horses.map(h => h.sire).filter(Boolean));
    return Array.from(sires).sort();
  }, [horses]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default sort direction by field type
      setSortDir(field === 'rating' || field === 'stride' ? 'desc' : 'asc');
    }
  }, [sortField]);

  const toggleTier = useCallback((tier: string) => {
    setTierFilter(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  }, []);

  const filtered = useMemo(() => {
    let result = horses;

    if (tierFilter.length > 0) {
      result = result.filter(h => tierFilter.includes(h.tier));
    }
    if (sexFilter) {
      result = result.filter(h => h.sex === sexFilter);
    }
    if (sectionFilter) {
      result = result.filter(h => h.section === sectionFilter);
    }
    if (stateFilter) {
      result = result.filter(h => h.state === stateFilter);
    }
    if (sireFilter) {
      result = result.filter(h => h.sire === sireFilter);
    }
    if (hipSearch) {
      result = result.filter(h => h.hip.toString().includes(hipSearch));
    }

    // Sort
    result = [...result].sort((a, b) => {
      let av: number | string, bv: number | string;
      if (sortField === 'tier') {
        av = TIER_ORDER[a.tier] ?? 99;
        bv = TIER_ORDER[b.tier] ?? 99;
      } else if (sortField === 'sire' || sortField === 'state' || sortField === 'sex' || sortField === 'consigner') {
        av = a[sortField].toLowerCase();
        bv = b[sortField].toLowerCase();
      } else {
        av = a[sortField];
        bv = b[sortField];
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [horses, tierFilter, sexFilter, sectionFilter, stateFilter, sireFilter, hipSearch, sortField, sortDir]);

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  if (loading) {
    return <div className="rl-loading">Loading ranked list...</div>;
  }

  return (
    <div className="rl-wrap">
      <div className="rl-header">
        <h2>Ranked Sale List</h2>
        <span className="rl-count">{filtered.length} of {horses.length} horses</span>
      </div>

      {/* Filters */}
      <div className="rl-filters">
        <div className="rl-filter-group">
          <label className="rl-filter-label">Tier</label>
          <div className="rl-tier-chips">
            {Object.keys(TIER_ORDER).map(tier => (
              <button
                key={tier}
                className={`rl-chip ${TIER_CLASSES[tier]} ${tierFilter.includes(tier) ? 'rl-chip-active' : ''}`}
                onClick={() => toggleTier(tier)}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
        <div className="rl-filter-row">
          <div className="rl-filter-group">
            <label className="rl-filter-label">Sex</label>
            <select value={sexFilter} onChange={e => setSexFilter(e.target.value)} className="rl-select">
              <option value="">All</option>
              <option value="C">Colts</option>
              <option value="F">Fillies</option>
            </select>
          </div>
          <div className="rl-filter-group">
            <label className="rl-filter-label">Distance</label>
            <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="rl-select">
              <option value="">All</option>
              <option value="1/8">1/8 Mile</option>
              <option value="1/4">1/4 Mile</option>
            </select>
          </div>
          <div className="rl-filter-group">
            <label className="rl-filter-label">State-Bred</label>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="rl-select">
              <option value="">All</option>
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div className="rl-filter-group">
            <label className="rl-filter-label">Sire</label>
            <select value={sireFilter} onChange={e => setSireFilter(e.target.value)} className="rl-select">
              <option value="">All</option>
              {uniqueSires.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="rl-filter-group">
            <label className="rl-filter-label">Hip #</label>
            <input
              type="text"
              className="rl-input"
              placeholder="Search hip..."
              value={hipSearch}
              onChange={e => setHipSearch(e.target.value)}
            />
          </div>
        </div>
        {(tierFilter.length > 0 || sexFilter || sectionFilter || stateFilter || sireFilter || hipSearch) && (
          <button
            className="rl-clear-btn"
            onClick={() => { setTierFilter([]); setSexFilter(''); setSectionFilter(''); setStateFilter(''); setSireFilter(''); setHipSearch(''); }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rl-table-wrap">
        <table className="rl-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('hip')} className="rl-sortable">Hip{sortIcon('hip')}</th>
              <th onClick={() => handleSort('rank')} className="rl-sortable">Rank{sortIcon('rank')}</th>
              <th onClick={() => handleSort('tier')} className="rl-sortable">Tier{sortIcon('tier')}</th>
              <th onClick={() => handleSort('rating')} className="rl-sortable">Score{sortIcon('rating')}</th>
              <th onClick={() => handleSort('sex')} className="rl-sortable">Sex{sortIcon('sex')}</th>
              <th onClick={() => handleSort('sire')} className="rl-sortable">Sire{sortIcon('sire')}</th>
              <th onClick={() => handleSort('time')} className="rl-sortable">Time{sortIcon('time')}</th>
              <th onClick={() => handleSort('eighthOut')} className="rl-sortable">1/8 Out{sortIcon('eighthOut')}</th>
              <th onClick={() => handleSort('quarterOut')} className="rl-sortable">1/4 Out{sortIcon('quarterOut')}</th>
              <th onClick={() => handleSort('stride')} className="rl-sortable">Stride{sortIcon('stride')}</th>
              <th onClick={() => handleSort('decel')} className="rl-sortable">Decel{sortIcon('decel')}</th>
              <th onClick={() => handleSort('state')} className="rl-sortable">State{sortIcon('state')}</th>
              <th onClick={() => handleSort('consigner')} className="rl-sortable">Consigner{sortIcon('consigner')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={13} className="rl-empty">No horses match your filters.</td></tr>
            ) : (
              filtered.map(h => (
                <tr
                  key={h.hip}
                  className={`rl-row ${TIER_ROW_CLASSES[h.tier] ?? ''}`}
                  onClick={() => onSelectHip?.(h.hip, h)}
                >
                  <td className="rl-hip">{h.hip}</td>
                  <td>#{h.rank}</td>
                  <td><span className={`rl-tier-tag ${TIER_CLASSES[h.tier]}`}>{h.tier}</span></td>
                  <td className="rl-score">{h.rating.toFixed(1)}</td>
                  <td>{h.sex === 'C' ? 'Colt' : 'Filly'}</td>
                  <td className="rl-sire">{h.sire}</td>
                  <td>{h.time.toFixed(1)}s</td>
                  <td>{h.eighthOut.toFixed(1)}s</td>
                  <td>{h.quarterOut.toFixed(1)}s</td>
                  <td>{h.stride.toFixed(1)}&prime;</td>
                  <td>{h.decel.toFixed(2)}s</td>
                  <td>{h.state}</td>
                  <td className="rl-consigner">{h.consigner}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
