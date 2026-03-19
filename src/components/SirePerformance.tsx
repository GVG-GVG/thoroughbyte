'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Horse {
  hip: number;
  rank: number;
  sire: string;
  dam: string;
  sex: string;
  tier: string;
  rating: number;
  time: number;
  stride: number;
  decel: number;
  eighthOut: number;
  quarterOut: number;
  btw: boolean;
  btp: boolean;
  btprod: boolean;
}

interface SireRow {
  rank: number;
  sire: string;
  runners: number;
  avgRating: number;
  bestRating: number;
  bestHip: number;
  eliteCount: number;
  strongCount: number;
  avgStride: number;
}

type SortField = 'rank' | 'sire' | 'runners' | 'avgRating' | 'bestRating' | 'eliteCount' | 'avgStride';
type SortDir = 'asc' | 'desc';

interface Props {
  sale?: string;
  saleLabel?: string;
}

export default function SirePerformance({ sale = 'obs-march-2026', saleLabel }: Props) {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [minRunners, setMinRunners] = useState(1);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setHorses([]);
    setSearch('');
    setSortField('rank');
    setSortDir('asc');
    fetch(`/api/rankings?sale=${encodeURIComponent(sale)}`)
      .then(res => res.json())
      .then(data => {
        setHorses(data.horses);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sale]);

  const sireRows = useMemo(() => {
    const grouped: Record<string, Horse[]> = {};
    for (const h of horses) {
      if (!h.sire) continue;
      if (!grouped[h.sire]) grouped[h.sire] = [];
      grouped[h.sire].push(h);
    }

    const rows: SireRow[] = [];
    for (const [sire, group] of Object.entries(grouped)) {
      if (group.length < minRunners) continue;
      const ratings = group.map(h => h.rating);
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      const bestIdx = ratings.indexOf(Math.max(...ratings));
      const best = group[bestIdx];
      rows.push({
        rank: 0,
        sire,
        runners: group.length,
        avgRating: Math.round(avgRating * 10) / 10,
        bestRating: best.rating,
        bestHip: best.hip,
        eliteCount: group.filter(h => h.tier === 'ELITE').length,
        strongCount: group.filter(h => h.tier === 'ELITE' || h.tier === 'STRONG').length,
        avgStride: Math.round((group.reduce((a, h) => a + h.stride, 0) / group.length) * 10) / 10,
      });
    }

    rows.sort((a, b) => b.avgRating - a.avgRating);
    rows.forEach((r, i) => r.rank = i + 1);
    return rows;
  }, [horses, minRunners]);

  const filtered = useMemo(() => {
    let result = [...sireRows];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => r.sire.toLowerCase().includes(q));
    }

    if (sortField !== 'rank' || sortDir !== 'asc') {
      result.sort((a, b) => {
        if (sortField === 'sire') {
          return sortDir === 'asc' ? a.sire.localeCompare(b.sire) : b.sire.localeCompare(a.sire);
        }
        const diff = (a[sortField] as number) - (b[sortField] as number);
        return sortDir === 'asc' ? diff : -diff;
      });
    }

    return result;
  }, [sireRows, search, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'sire' ? 'asc' : field === 'rank' ? 'asc' : 'desc');
    }
  };

  const sortIcon = (field: SortField) =>
    sortField === field ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : '';

  // Export PDF
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const exportPdf = useCallback((useFiltered: boolean) => {
    setExportOpen(false);
    const rows = useFiltered ? filtered : sireRows;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
    const title = saleLabel ? `${saleLabel} Sire Performance` : 'Sire Performance';
    const subtitle = `${rows.length} sires (min ${minRunners} runner${minRunners > 1 ? 's' : ''})`;

    doc.setFontSize(14);
    doc.text(title, 40, 30);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(subtitle, 40, 44);
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 54,
      head: [['Rank', 'Sire', 'Runners', 'Avg Rating', 'Best Rating', 'Best Hip', 'Elite', 'Elite+Strong', 'Avg Stride']],
      body: rows.map(r => [
        r.rank, r.sire, r.runners, r.avgRating.toFixed(1), r.bestRating.toFixed(1),
        r.bestHip, r.eliteCount, r.strongCount,
        `${r.avgStride.toFixed(1)}'`,
      ]),
      styles: { fontSize: 7, cellPadding: 3 },
      headStyles: { fillColor: [18, 30, 50], fontSize: 7, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 40, right: 40 },
    });

    doc.save(`${(saleLabel || 'sire-performance').replace(/\s+/g, '-').toLowerCase()}-sires.pdf`);
  }, [filtered, sireRows, saleLabel, minRunners]);

  if (loading) return <div className="rl-loading">Loading sire data...</div>;

  return (
    <div className="rl-wrap">
      <div className="rl-header">
        <h2>{saleLabel ? `${saleLabel} Sire Performance` : 'Sire Performance'}</h2>
        <span className="rl-count">{filtered.length} of {sireRows.length} sires</span>
      </div>

      <div className="rl-filters">
        <div className="rl-filter-row">
          <div className="rl-filter-group">
            <label className="rl-filter-label">Min Runners</label>
            <select value={minRunners} onChange={e => setMinRunners(parseInt(e.target.value))} className="rl-select">
              <option value={1}>All Sires</option>
              <option value={2}>2+ Runners</option>
              <option value={3}>3+ Runners</option>
              <option value={5}>5+ Runners</option>
            </select>
          </div>
          <div className="rl-filter-group">
            <label className="rl-filter-label">Search Sire</label>
            <input
              type="text"
              className="rl-input"
              placeholder="Sire name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="rl-filter-group rl-export-group" ref={exportRef}>
            <label className="rl-filter-label">&nbsp;</label>
            <button className="rl-export-btn" onClick={() => setExportOpen(o => !o)}>
              Export PDF
            </button>
            {exportOpen && (
              <div className="rl-export-menu">
                <button onClick={() => exportPdf(true)}>Filtered ({filtered.length})</button>
                <button onClick={() => exportPdf(false)}>All ({sireRows.length})</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rl-table-wrap">
        <table className="rl-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('rank')} className="rl-sortable">Rank{sortIcon('rank')}</th>
              <th onClick={() => handleSort('sire')} className="rl-sortable">Sire{sortIcon('sire')}</th>
              <th onClick={() => handleSort('runners')} className="rl-sortable">Runners{sortIcon('runners')}</th>
              <th onClick={() => handleSort('avgRating')} className="rl-sortable">Avg Rating{sortIcon('avgRating')}</th>
              <th onClick={() => handleSort('bestRating')} className="rl-sortable">Best Rating{sortIcon('bestRating')}</th>
              <th className="rl-sortable">Best Hip</th>
              <th onClick={() => handleSort('eliteCount')} className="rl-sortable">Elite{sortIcon('eliteCount')}</th>
              <th onClick={() => handleSort('avgStride')} className="rl-sortable">Avg Stride{sortIcon('avgStride')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="rl-empty">No sires match your filters.</td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.sire} className="rl-row">
                  <td className="rl-rank">#{r.rank}</td>
                  <td className="rl-sire" style={{ fontWeight: 600 }}>{r.sire}</td>
                  <td className="rl-score">{r.runners}</td>
                  <td className="rl-score">{r.avgRating.toFixed(1)}</td>
                  <td className="rl-score">{r.bestRating.toFixed(1)}</td>
                  <td className="rl-hip">{r.bestHip}</td>
                  <td>{r.eliteCount > 0 ? r.eliteCount : '—'}</td>
                  <td>{r.avgStride.toFixed(1)}&prime;</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
