'use client';

import type { Horse } from './RankedList';

interface Props {
  horses: [Horse, Horse];
  onClose: () => void;
}

const TIER_COLORS: Record<string, string> = {
  'ELITE': '#2d8659',
  'STRONG': '#3a9e6e',
  'ABOVE AVG': '#3a8abf',
  'AVERAGE': '#b0a030',
  'BELOW AVG': '#c07840',
  'WEAK': '#c04040',
};

function fmt(v: number | undefined, suffix = '', decimals = 1): string {
  if (!v || v === 0) return '\u2014';
  return v.toFixed(decimals) + suffix;
}

function delta(a: number, b: number, invert = false): { val: string; cls: string } {
  if (!a || !b || a === 0 || b === 0) return { val: '\u2014', cls: 'cmp-delta-neutral' };
  const d = a - b;
  if (Math.abs(d) < 0.01) return { val: '=', cls: 'cmp-delta-neutral' };
  const better = invert ? d < 0 : d > 0;
  return {
    val: (d > 0 ? '+' : '') + d.toFixed(2),
    cls: better ? 'cmp-delta-better' : 'cmp-delta-worse',
  };
}

export default function ComparePanel({ horses, onClose }: Props) {
  const [a, b] = horses;

  const metrics: { label: string; key: keyof Horse; suffix: string; decimals: number; invert: boolean }[] = [
    { label: 'Score', key: 'rating', suffix: '', decimals: 1, invert: false },
    { label: 'Time', key: 'time', suffix: 's', decimals: 1, invert: true },
    { label: '1/8 Out', key: 'eighthOut', suffix: 's', decimals: 2, invert: true },
    { label: '1/4 Out', key: 'quarterOut', suffix: 's', decimals: 2, invert: true },
    { label: 'Stride', key: 'stride', suffix: '\u2032', decimals: 1, invert: false },
    { label: 'Decel', key: 'decel', suffix: 's', decimals: 2, invert: true },
  ];

  return (
    <div className="cmp-overlay" onClick={onClose}>
      <div className="cmp-panel" onClick={e => e.stopPropagation()}>
        <div className="cmp-panel-header">
          <h3>Compare Horses</h3>
          <button className="cmp-close" onClick={onClose}>&times;</button>
        </div>

        <div className="cmp-content">
          {/* Horse identity headers */}
          <div className="cmp-grid cmp-identity">
            <div className="cmp-col">
              <div className="cmp-hip">HIP {a.hip}</div>
              <div className="cmp-breeding">{a.sire} &mdash; {a.dam}</div>
              <div className="cmp-meta">{a.sex === 'C' ? 'Colt' : 'Filly'} &bull; {a.section} mi &bull; {a.state}-bred</div>
              <div className="cmp-consigner">{a.consigner}</div>
            </div>
            <div className="cmp-vs">VS</div>
            <div className="cmp-col">
              <div className="cmp-hip">HIP {b.hip}</div>
              <div className="cmp-breeding">{b.sire} &mdash; {b.dam}</div>
              <div className="cmp-meta">{b.sex === 'C' ? 'Colt' : 'Filly'} &bull; {b.section} mi &bull; {b.state}-bred</div>
              <div className="cmp-consigner">{b.consigner}</div>
            </div>
          </div>

          {/* Tier + Rank row */}
          <div className="cmp-grid cmp-tier-row">
            <div className="cmp-col">
              {a.tier ? (
                <span className="cmp-tier-badge" style={{ background: TIER_COLORS[a.tier] || '#888' }}>{a.tier}</span>
              ) : <span className="cmp-no-data">\u2014</span>}
              {a.rank ? <span className="cmp-rank">#{a.rank}</span> : null}
            </div>
            <div className="cmp-label-center">Tier / Rank</div>
            <div className="cmp-col">
              {b.tier ? (
                <span className="cmp-tier-badge" style={{ background: TIER_COLORS[b.tier] || '#888' }}>{b.tier}</span>
              ) : <span className="cmp-no-data">\u2014</span>}
              {b.rank ? <span className="cmp-rank">#{b.rank}</span> : null}
            </div>
          </div>

          {/* Metric rows */}
          {metrics.map(m => {
            const aVal = a[m.key] as number;
            const bVal = b[m.key] as number;
            const d = delta(aVal, bVal, m.invert);

            return (
              <div className="cmp-grid cmp-metric-row" key={m.key}>
                <div className="cmp-col cmp-val">{fmt(aVal, m.suffix, m.decimals)}</div>
                <div className="cmp-label-center">
                  <div className="cmp-metric-label">{m.label}</div>
                  <div className={`cmp-delta ${d.cls}`}>{d.val}</div>
                </div>
                <div className="cmp-col cmp-val">{fmt(bVal, m.suffix, m.decimals)}</div>
              </div>
            );
          })}

          {/* Dam BT badges */}
          <div className="cmp-grid cmp-bt-row">
            <div className="cmp-col cmp-badges">
              {a.btw && <span className="rl-bt-tag rl-bt-btw">BTW</span>}
              {a.btp && <span className="rl-bt-tag rl-bt-btp">BTP</span>}
              {a.btprod && <span className="rl-bt-tag rl-bt-btprod">BTProd</span>}
              {!a.btw && !a.btp && !a.btprod && <span className="cmp-no-data">\u2014</span>}
            </div>
            <div className="cmp-label-center">Dam Black-Type</div>
            <div className="cmp-col cmp-badges">
              {b.btw && <span className="rl-bt-tag rl-bt-btw">BTW</span>}
              {b.btp && <span className="rl-bt-tag rl-bt-btp">BTP</span>}
              {b.btprod && <span className="rl-bt-tag rl-bt-btprod">BTProd</span>}
              {!b.btw && !b.btp && !b.btprod && <span className="cmp-no-data">\u2014</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
