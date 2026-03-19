'use client';

import { useState, useEffect, useMemo } from 'react';

interface ConsignerStats {
  name: string;
  count: number;
  avgRating: number;
  medianRating: number;
  eliteCount: number;
  strongCount: number;
  topTierPct: number;   // (elite + strong) / count
  bestHip: number;
  bestRating: number;
  avgTime: number;
}

type SortField = keyof ConsignerStats;
type SortDir = 'asc' | 'desc';

interface RawHorse {
  consigner: string;
  rating: string;
  tier: string;
  hip: string;
  time: string;
}

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export default function ConsignerTable() {
  const [data, setData] = useState<ConsignerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('avgRating');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [minCount, setMinCount] = useState<number>(3);

  useEffect(() => {
    fetch('/api/rankings')
      .then(res => res.json())
      .then((horses: RawHorse[]) => {
        const byConsigner: Record<string, RawHorse[]> = {};
        horses.forEach(h => {
          const c = h.consigner || 'Unknown';
          if (!byConsigner[c]) byConsigner[c] = [];
          byConsigner[c].push(h);
        });

        const stats: ConsignerStats[] = Object.entries(byConsigner).map(([name, group]) => {
          const ratings = group.map(h => parseFloat(h.rating)).filter(n => !isNaN(n));
          const times = group.map(h => parseFloat(h.time)).filter(n => !isNaN(n));
          const eliteCount = group.filter(h => h.tier === 'ELITE').length;
          const strongCount = group.filter(h => h.tier === 'STRONG').length;
          const best = ratings.length > 0 ? Math.max(...ratings) : 0;
          const bestHorse = group.find(h => parseFloat(h.rating) === best);

          return {
            name,
            count: group.length,
            avgRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
            medianRating: ratings.length > 0 ? median(ratings) : 0,
            eliteCount,
            strongCount,
            topTierPct: (eliteCount + strongCount) / group.length,
            bestHip: bestHorse ? parseInt(bestHorse.hip) : 0,
            bestRating: best,
            avgTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
          };
        });

        setData(stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return data.filter(c => c.count >= minCount);
  }, [data, minCount]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
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
      setSortDir(field === 'name' ? 'asc' : 'desc');
    }
  };

  const arrow = (field: SortField) => sortField === field ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : '';

  if (loading) return <div className="ct-loading">Loading consigner data...</div>;

  return (
    <div className="ct-wrap">
      <div className="ct-header-row">
        <h2 className="ct-title">Consigner Ratings</h2>
        <div className="ct-min-filter">
          <label>Min. horses:</label>
          <select value={minCount} onChange={e => setMinCount(Number(e.target.value))}>
            <option value={1}>1+</option>
            <option value={3}>3+</option>
            <option value={5}>5+</option>
            <option value={10}>10+</option>
            <option value={15}>15+</option>
          </select>
        </div>
      </div>
      <div className="ct-count">{sorted.length} consigners</div>
      <div className="ct-table-scroll">
        <table className="ct-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Consigner{arrow('name')}</th>
              <th onClick={() => handleSort('count')}>#Horses{arrow('count')}</th>
              <th onClick={() => handleSort('avgRating')}>Avg Score{arrow('avgRating')}</th>
              <th onClick={() => handleSort('medianRating')}>Med Score{arrow('medianRating')}</th>
              <th onClick={() => handleSort('eliteCount')}>Elite{arrow('eliteCount')}</th>
              <th onClick={() => handleSort('strongCount')}>Strong{arrow('strongCount')}</th>
              <th onClick={() => handleSort('topTierPct')}>Top Tier %{arrow('topTierPct')}</th>
              <th onClick={() => handleSort('bestRating')}>Best Score{arrow('bestRating')}</th>
              <th onClick={() => handleSort('bestHip')}>Best Hip{arrow('bestHip')}</th>
              <th onClick={() => handleSort('avgTime')}>Avg Time{arrow('avgTime')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => (
              <tr key={c.name} className="ct-row">
                <td className="ct-name">{c.name}</td>
                <td>{c.count}</td>
                <td className="ct-num">{c.avgRating.toFixed(1)}</td>
                <td className="ct-num">{c.medianRating.toFixed(1)}</td>
                <td className="ct-num">{c.eliteCount || '—'}</td>
                <td className="ct-num">{c.strongCount || '—'}</td>
                <td className="ct-num">{(c.topTierPct * 100).toFixed(0)}%</td>
                <td className="ct-num">{c.bestRating.toFixed(1)}</td>
                <td className="ct-num">{c.bestHip}</td>
                <td className="ct-num">{c.avgTime.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
