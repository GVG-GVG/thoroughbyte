'use client';

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

const TIER_COLORS: Record<string, { bg: string; fg: string }> = {
  'ELITE':     { bg: 'rgba(45,106,79,0.12)',  fg: '#2d6a4f' },
  'STRONG':    { bg: 'rgba(106,174,120,0.12)', fg: '#5a9e68' },
  'ABOVE AVG': { bg: 'rgba(191,179,80,0.12)',  fg: '#a89e40' },
  'AVERAGE':   { bg: 'rgba(160,160,160,0.12)', fg: '#808080' },
  'BELOW AVG': { bg: 'rgba(200,122,90,0.12)',  fg: '#c87a5a' },
  'WEAK':      { bg: 'rgba(184,60,60,0.12)',   fg: '#b83c3c' },
};

function StatBlock({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="hc-stat">
      <div className="hc-stat-value">{value}{unit && <span className="hc-stat-unit">{unit}</span>}</div>
      <div className="hc-stat-label">{label}</div>
    </div>
  );
}

export default function HorseCard({ horse, onClose }: { horse: Horse; onClose: () => void }) {
  const tc = TIER_COLORS[horse.tier] ?? { bg: '#eee', fg: '#666' };
  const sexLabel = horse.sex === 'C' ? 'Colt' : horse.sex === 'F' ? 'Filly' : horse.sex;
  const distance = horse.section?.includes('1/4') ? '1/4 mile' : '1/8 mile';

  return (
    <div className="hc-overlay" onClick={onClose}>
      <div className="hc-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="hc-header">
          <div className="hc-header-left">
            <div className="hc-hip">Hip {horse.hip}</div>
            <div className="hc-pedigree">{horse.sire} &mdash; {horse.dam}</div>
            <div className="hc-meta">
              {sexLabel} &middot; {distance} &middot; Day {horse.day}
              {horse.consigner && <> &middot; {horse.consigner}</>}
              {horse.state && <> &middot; {horse.state}-bred</>}
            </div>
          </div>
          <button className="hc-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        {/* Score + Tier banner */}
        <div className="hc-score-row">
          <div className="hc-rating">
            <span className="hc-rating-num">{horse.rating.toFixed(1)}</span>
            <span className="hc-rating-label">Score</span>
          </div>
          <div className="hc-tier-badge" style={{ background: tc.bg, color: tc.fg }}>
            {horse.tier}
          </div>
          <div className="hc-rank">
            <span className="hc-rank-num">#{horse.rank}</span>
            <span className="hc-rank-label">Overall Rank</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="hc-stats-grid">
          <StatBlock label="Time" value={horse.time.toFixed(3)} unit="s" />
          <StatBlock label="Stride Length" value={horse.stride.toFixed(2)} unit="ft" />
          <StatBlock label="Deceleration" value={horse.decel.toFixed(3)} />
          <StatBlock label="1/8 Out" value={horse.eighthOut > 0 ? horse.eighthOut.toFixed(3) : '—'} unit={horse.eighthOut > 0 ? 's' : ''} />
          <StatBlock label="1/4 Out" value={horse.quarterOut > 0 ? horse.quarterOut.toFixed(3) : '—'} unit={horse.quarterOut > 0 ? 's' : ''} />
        </div>

        {/* Sale info */}
        {horse.saleStatus && (
          <div className="hc-sale-row">
            <span className="hc-sale-status">{horse.saleStatus}</span>
            {horse.salePrice > 0 && (
              <span className="hc-sale-price">${horse.salePrice.toLocaleString()}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
