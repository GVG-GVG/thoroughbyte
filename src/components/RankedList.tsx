'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ComparePanel from './ComparePanel';

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
  btw: boolean;
  btp: boolean;
  btprod: boolean;
  valueFlag: boolean;
}

type SortField = 'hip' | 'rank' | 'rating' | 'tier' | 'time' | 'stride' | 'decel' | 'eighthOut' | 'quarterOut' | 'sex' | 'sire' | 'dam' | 'consigner' | 'state' | 'valueFlag';
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
  sale?: string;
  saleLabel?: string;
  onSelectHip?: (hip: number, horse: Horse) => void;
}

export default function RankedList({ sale = 'obs-march-2026', saleLabel, onSelectHip }: Props) {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [tierFilter, setTierFilter] = useState<string[]>([]);
  const [sexFilter, setSexFilter] = useState<string>('');
  const [sectionFilter, setSectionFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [sireFilter, setSireFilter] = useState<string>('');
  const [damSearch, setDamSearch] = useState<string>('');
  const [hipSearch, setHipSearch] = useState<string>('');
  const [valueOnly, setValueOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [togglingFav, setTogglingFav] = useState<number | null>(null);
  const [compareHips, setCompareHips] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleCompare = useCallback((hip: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareHips(prev => {
      if (prev.includes(hip)) return prev.filter(h => h !== hip);
      if (prev.length >= 2) return [prev[1], hip]; // rotate: drop oldest
      return [...prev, hip];
    });
  }, []);

  const compareHorses = useMemo(() => {
    if (compareHips.length !== 2) return null;
    const a = horses.find(h => h.hip === compareHips[0]);
    const b = horses.find(h => h.hip === compareHips[1]);
    if (!a || !b) return null;
    return [a, b] as [Horse, Horse];
  }, [compareHips, horses]);

  useEffect(() => {
    setLoading(true);
    setHorses([]);
    setTierFilter([]);
    setSexFilter('');
    setSectionFilter('');
    setStateFilter('');
    setSireFilter('');
    setDamSearch('');
    setHipSearch('');
    setValueOnly(false);
    setFavoritesOnly(false);
    setSortField('rank');
    setSortDir('asc');
    fetch(`/api/rankings?sale=${encodeURIComponent(sale)}`)
      .then(res => res.json())
      .then(data => {
        setHorses(data.horses);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // Load favorites for this sale
    fetch(`/api/favorites?sale=${encodeURIComponent(sale)}`)
      .then(res => res.json())
      .then(data => {
        if (data.hips) setFavorites(new Set(data.hips));
      })
      .catch(() => {});
  }, [sale]);

  const toggleFavorite = useCallback(async (hip: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTogglingFav(hip);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hip, sale_id: sale }),
      });
      const data = await res.json();
      if (res.ok) {
        setFavorites(prev => {
          const next = new Set(prev);
          if (data.favorited) next.add(hip);
          else next.delete(hip);
          return next;
        });
      }
    } catch {}
    setTogglingFav(null);
  }, [sale]);

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
    if (damSearch) {
      const q = damSearch.toLowerCase();
      result = result.filter(h => h.dam.toLowerCase().includes(q));
    }
    if (hipSearch) {
      result = result.filter(h => h.hip.toString().includes(hipSearch));
    }
    if (valueOnly) {
      result = result.filter(h => h.valueFlag);
    }
    if (favoritesOnly) {
      result = result.filter(h => favorites.has(h.hip));
    }

    // Sort — always push horses without breeze data (0 values) to the bottom
    const NUMERIC_FIELDS = new Set<SortField>(['rank', 'rating', 'time', 'stride', 'decel', 'eighthOut', 'quarterOut']);
    result = [...result].sort((a, b) => {
      let av: number | string, bv: number | string;
      if (sortField === 'valueFlag') {
        av = a.valueFlag ? 0 : 1;
        bv = b.valueFlag ? 0 : 1;
      } else if (sortField === 'tier') {
        av = TIER_ORDER[a.tier] ?? 99;
        bv = TIER_ORDER[b.tier] ?? 99;
      } else if (sortField === 'sire' || sortField === 'dam' || sortField === 'state' || sortField === 'sex' || sortField === 'consigner') {
        av = a[sortField].toLowerCase();
        bv = b[sortField].toLowerCase();
      } else {
        av = a[sortField];
        bv = b[sortField];
      }
      // Push empty/zero numeric values to bottom regardless of sort direction
      if (NUMERIC_FIELDS.has(sortField)) {
        const aEmpty = !av || av === 0;
        const bEmpty = !bv || bv === 0;
        if (aEmpty && !bEmpty) return 1;
        if (!aEmpty && bEmpty) return -1;
        if (aEmpty && bEmpty) return 0;
      }
      if (sortField === 'tier') {
        const aEmpty = !a.tier;
        const bEmpty = !b.tier;
        if (aEmpty && !bEmpty) return 1;
        if (!aEmpty && bEmpty) return -1;
        if (aEmpty && bEmpty) return 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [horses, tierFilter, sexFilter, sectionFilter, stateFilter, sireFilter, damSearch, hipSearch, valueOnly, favoritesOnly, favorites, sortField, sortDir]);

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

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
    const rows = useFiltered ? filtered : horses;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
    const title = saleLabel ? `${saleLabel} Breeze Analytics` : 'Horse Ratings';
    const subtitle = useFiltered && filtered.length !== horses.length
      ? `Filtered: ${rows.length} of ${horses.length} horses`
      : `${rows.length} horses`;

    doc.setFontSize(14);
    doc.text(title, 40, 30);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(subtitle, 40, 44);
    doc.setTextColor(0);

    const TIER_PDF_COLORS: Record<string, [number, number, number]> = {
      'ELITE':     [210, 235, 220],
      'STRONG':    [220, 240, 225],
      'ABOVE AVG': [240, 238, 215],
      'AVERAGE':   [238, 238, 238],
      'BELOW AVG': [245, 228, 220],
      'WEAK':      [242, 215, 215],
    };

    autoTable(doc, {
      startY: 54,
      head: [['Hip', 'Rank', 'Tier', 'Score', 'Sex', 'Sire', 'Dam', 'Time', '1/8 Out', '1/4 Out', 'Stride', 'Decel', 'State', 'Consigner', 'Value']],
      body: rows.map(h => [
        h.hip, h.rank ? `#${h.rank}` : '\u2014', h.tier || '\u2014', h.rating ? h.rating.toFixed(1) : '\u2014',
        h.sex === 'C' ? 'Colt' : 'Filly', h.sire,
        h.dam,
        h.time ? `${h.time.toFixed(1)}s` : '\u2014', h.eighthOut ? `${h.eighthOut.toFixed(1)}s` : '\u2014',
        h.quarterOut ? `${h.quarterOut.toFixed(1)}s` : '\u2014',
        h.stride ? `${h.stride.toFixed(1)}'` : '\u2014', h.decel ? `${h.decel.toFixed(2)}s` : '\u2014',
        h.state, h.consigner, h.valueFlag ? 'VALUE' : '',
      ]),
      styles: { fontSize: 7, cellPadding: 3 },
      headStyles: { fillColor: [18, 30, 50], fontSize: 7, fontStyle: 'bold' },
      margin: { left: 40, right: 40 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      didParseCell: (data: any) => {
        if (data.section === 'body') {
          const horse = rows[data.row.index];
          if (horse?.tier && TIER_PDF_COLORS[horse.tier]) {
            data.cell.styles.fillColor = TIER_PDF_COLORS[horse.tier];
          }
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      didDrawCell: (data: any) => {
        if (data.section !== 'body' || data.column.index !== 6) return; // 6 = Dam column
        const horse = rows[data.row.index];
        if (!horse) return;
        const badges: { label: string; bg: [number, number, number]; text: [number, number, number] }[] = [];
        // Match dashboard CSS colors exactly: BTW=gold, BTP=silver, BTProd=purple
        if (horse.btw)    badges.push({ label: 'BTW',    bg: [255, 215, 0],   text: [74, 56, 0] });
        if (horse.btp)    badges.push({ label: 'BTP',    bg: [192, 192, 192], text: [51, 51, 51] });
        if (horse.btprod) badges.push({ label: 'BTProd', bg: [212, 168, 255], text: [58, 26, 94] });
        if (badges.length === 0) return;
        const cellX = data.cell.x;
        const cellY = data.cell.y;
        const cellH = data.cell.height;
        const textWidth = doc.getTextWidth(String(data.cell.raw || ''));
        let bx = cellX + data.cell.padding('left') + textWidth + 2;
        const by = cellY + cellH / 2 - 3;
        doc.setFontSize(5);
        for (const b of badges) {
          const tw = doc.getTextWidth(b.label) + 3;
          const bw = tw + 1;
          doc.setFillColor(b.bg[0], b.bg[1], b.bg[2]);
          doc.roundedRect(bx, by, bw, 6, 1, 1, 'F');
          doc.setTextColor(b.text[0], b.text[1], b.text[2]);
          doc.text(b.label, bx + bw / 2, by + 4.2, { align: 'center' });
          bx += bw + 1.5;
        }
        // Reset text color for subsequent cells
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
      },
    });

    doc.save(`${(saleLabel || 'horse-ratings').replace(/\s+/g, '-').toLowerCase()}.pdf`);
  }, [filtered, horses, saleLabel]);

  if (loading) {
    return <div className="rl-loading">Loading ranked list...</div>;
  }

  return (
    <div className="rl-wrap">
      <div className="rl-header">
        <h2>{saleLabel ? `${saleLabel} Breeze Analytics` : 'Ranked Sale List'}</h2>
        <span className="rl-count">{filtered.length} of {horses.length} horses</span>
      </div>

      {/* Filters */}
      <div className="rl-filters">
        <div className="rl-filter-group rl-tier-row">
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
          <button
            className={`rl-chip rl-chip-value ${valueOnly ? 'rl-chip-active' : ''}`}
            onClick={() => setValueOnly(v => !v)}
          >
            VALUE
          </button>
          <button
            className={`rl-chip rl-chip-fav ${favoritesOnly ? 'rl-chip-active' : ''}`}
            onClick={() => setFavoritesOnly(v => !v)}
            title="Show only favorited horses"
          >
            &#9733; FAVORITES{favorites.size > 0 ? ` (${favorites.size})` : ''}
          </button>
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
            <label className="rl-filter-label">Dam</label>
            <input
              type="text"
              className="rl-input"
              placeholder="Search dam..."
              value={damSearch}
              onChange={e => setDamSearch(e.target.value)}
            />
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
          <div className="rl-filter-group rl-export-group" ref={exportRef}>
            <label className="rl-filter-label">&nbsp;</label>
            <button className="rl-export-btn" onClick={() => setExportOpen(o => !o)}>
              Export PDF
            </button>
            {exportOpen && (
              <div className="rl-export-menu">
                <button onClick={() => exportPdf(true)}>Filtered ({filtered.length})</button>
                <button onClick={() => exportPdf(false)}>All ({horses.length})</button>
              </div>
            )}
          </div>
        </div>
        {(tierFilter.length > 0 || sexFilter || sectionFilter || stateFilter || sireFilter || damSearch || hipSearch || valueOnly || favoritesOnly) && (
          <button
            className="rl-clear-btn"
            onClick={() => { setTierFilter([]); setSexFilter(''); setSectionFilter(''); setStateFilter(''); setSireFilter(''); setDamSearch(''); setHipSearch(''); setValueOnly(false); setFavoritesOnly(false); }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* BT Legend */}
      <div className="rl-bt-legend">
        <span className="rl-bt-legend-label">Dam Black-Type:</span>
        <span className="rl-bt-tag rl-bt-btw">BTW</span><span className="rl-bt-legend-desc">Black-Type Winner</span>
        <span className="rl-bt-tag rl-bt-btp">BTP</span><span className="rl-bt-legend-desc">Black-Type Placed</span>
        <span className="rl-bt-tag rl-bt-btprod">BTProd</span><span className="rl-bt-legend-desc">Black-Type Producer</span>
      </div>

      {/* Table */}
      <div className="rl-table-wrap">
        <table className="rl-table">
          <thead>
            <tr>
              <th className="rl-cmp-col" title="Compare">CMP</th>
              <th className="rl-fav-col" title="Favorites">&#9733;</th>
              <th onClick={() => handleSort('hip')} className="rl-sortable">Hip{sortIcon('hip')}</th>
              <th onClick={() => handleSort('rank')} className="rl-sortable">Rank{sortIcon('rank')}</th>
              <th onClick={() => handleSort('tier')} className="rl-sortable">Tier{sortIcon('tier')}</th>
              <th onClick={() => handleSort('rating')} className="rl-sortable">Score{sortIcon('rating')}</th>
              <th onClick={() => handleSort('sex')} className="rl-sortable">Sex{sortIcon('sex')}</th>
              <th onClick={() => handleSort('sire')} className="rl-sortable">Sire{sortIcon('sire')}</th>
              <th onClick={() => handleSort('dam')} className="rl-sortable">Dam{sortIcon('dam')}</th>
              <th onClick={() => handleSort('time')} className="rl-sortable">Time{sortIcon('time')}</th>
              <th onClick={() => handleSort('eighthOut')} className="rl-sortable">1/8 Out{sortIcon('eighthOut')}</th>
              <th onClick={() => handleSort('quarterOut')} className="rl-sortable">1/4 Out{sortIcon('quarterOut')}</th>
              <th onClick={() => handleSort('stride')} className="rl-sortable">Stride{sortIcon('stride')}</th>
              <th onClick={() => handleSort('decel')} className="rl-sortable">Decel{sortIcon('decel')}</th>
              <th onClick={() => handleSort('state')} className="rl-sortable">State{sortIcon('state')}</th>
              <th onClick={() => handleSort('consigner')} className="rl-sortable">Consigner{sortIcon('consigner')}</th>
              <th onClick={() => handleSort('valueFlag')} className="rl-sortable">Value{sortIcon('valueFlag')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={17} className="rl-empty">No horses match your filters.</td></tr>
            ) : (
              filtered.map(h => (
                <tr
                  key={h.hip}
                  className={`rl-row ${TIER_ROW_CLASSES[h.tier] ?? ''}`}
                  onClick={() => onSelectHip?.(h.hip, h)}
                >
                  <td className="rl-cmp-cell">
                    <input
                      type="checkbox"
                      className="rl-cmp-check"
                      checked={compareHips.includes(h.hip)}
                      onChange={() => {}}
                      onClick={(e) => toggleCompare(h.hip, e)}
                      title="Select to compare"
                    />
                  </td>
                  <td className="rl-fav-cell">
                    <button
                      className={`rl-fav-btn ${favorites.has(h.hip) ? 'rl-fav-active' : ''}`}
                      onClick={(e) => toggleFavorite(h.hip, e)}
                      disabled={togglingFav === h.hip}
                      title={favorites.has(h.hip) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.has(h.hip) ? '\u2605' : '\u2606'}
                    </button>
                  </td>
                  <td className="rl-hip">{h.hip}</td>
                  <td className="rl-rank">{h.rank ? `#${h.rank}` : '\u2014'}</td>
                  <td className="rl-tier-cell">{h.tier ? <span className={`rl-tier-tag ${TIER_CLASSES[h.tier]}`}>{h.tier}</span> : '\u2014'}</td>
                  <td className="rl-score">{h.rating ? h.rating.toFixed(1) : '\u2014'}</td>
                  <td>{h.sex === 'C' ? 'Colt' : 'Filly'}</td>
                  <td className="rl-sire">{h.sire}</td>
                  <td className={`rl-dam${(h.btw || h.btp || h.btprod) ? ' rl-dam-bt' : ''}`}>
                    {h.dam}
                    {h.btw && <span className="rl-bt-tag rl-bt-btw" title="Black-Type Winner">BTW</span>}
                    {h.btp && <span className="rl-bt-tag rl-bt-btp" title="Black-Type Placed">BTP</span>}
                    {h.btprod && <span className="rl-bt-tag rl-bt-btprod" title="Black-Type Producer">BTProd</span>}
                  </td>
                  <td>{h.time ? `${h.time.toFixed(1)}s` : '\u2014'}</td>
                  <td>{h.eighthOut ? `${h.eighthOut.toFixed(1)}s` : '\u2014'}</td>
                  <td>{h.quarterOut ? `${h.quarterOut.toFixed(1)}s` : '\u2014'}</td>
                  <td>{h.stride ? `${h.stride.toFixed(1)}\u2032` : '\u2014'}</td>
                  <td>{h.decel ? `${h.decel.toFixed(2)}s` : '\u2014'}</td>
                  <td>{h.state}</td>
                  <td className="rl-consigner">{h.consigner}</td>
                  <td>{h.valueFlag && <span className="rl-value-tag">VALUE</span>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sticky compare bar */}
      {compareHips.length > 0 && (
        <div className="cmp-bar">
          <div className="cmp-bar-inner">
            <div className="cmp-bar-selected">
              {compareHips.map(hip => {
                const h = horses.find(x => x.hip === hip);
                return (
                  <span key={hip} className="cmp-bar-chip">
                    Hip {hip}{h ? ` \u2014 ${h.sire}` : ''}
                    <button className="cmp-bar-chip-x" onClick={() => setCompareHips(prev => prev.filter(x => x !== hip))}>&times;</button>
                  </span>
                );
              })}
              {compareHips.length === 1 && <span className="cmp-bar-hint">Select 1 more horse to compare</span>}
            </div>
            <div className="cmp-bar-actions">
              {compareHips.length === 2 && (
                <button className="cmp-bar-btn cmp-bar-go" onClick={() => setShowCompare(true)}>Compare</button>
              )}
              <button className="cmp-bar-btn cmp-bar-clear" onClick={() => { setCompareHips([]); setShowCompare(false); }}>Clear</button>
            </div>
          </div>
        </div>
      )}

      {/* Compare panel overlay */}
      {showCompare && compareHorses && (
        <ComparePanel horses={compareHorses} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
}
