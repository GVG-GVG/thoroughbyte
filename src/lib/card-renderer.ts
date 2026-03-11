/**
 * Server-side profile card PNG renderer.
 * Uses puppeteer-core + @sparticuz/chromium for Vercel compatibility.
 * Generates a self-contained HTML card and screenshots it.
 */

import type { EnrichedHorse, PeerStats } from './horse-lookup';

// ── Scouting report generator (mirrors client-side prototype) ──

function generateBlurb(h: EnrichedHorse): string {
  const peer = h.peer;
  const sexWord = h.sex === 'C' ? 'colt' : 'filly';
  const sexPlural = h.sex === 'C' ? 'colts' : 'fillies';
  const n = peer.n;
  const parts: string[] = [];

  const topPct = Math.round((1 - (h.rank - 1) / h.totalRanked) * 100);

  if (h.pctl.rating >= 95) {
    parts.push(`This ${h.sire} ${sexWord} delivered one of the most complete breeze performances at the sale, ranking in the <span class="highlight">top ${100 - h.pctl.rating}%</span> of all ${n} ${sexPlural} who breezed ${h.dist} mile.`);
  } else if (h.pctl.rating >= 75) {
    parts.push(`This ${h.sire} ${sexWord} posted a well-above-average breeze, placing in the <span class="highlight">top ${100 - h.pctl.rating}%</span> among the ${n} ${sexPlural} who breezed ${h.dist} mile at this sale.`);
  } else if (h.pctl.rating >= 50) {
    parts.push(`This ${h.sire} ${sexWord} turned in a solid breeze, ranking ahead of ${h.pctl.rating}% of the ${n} ${sexPlural} who breezed ${h.dist} mile at this sale.`);
  } else if (h.pctl.rating >= 25) {
    parts.push(`This ${h.sire} ${sexWord} posted a below-average breeze relative to the ${n} ${sexPlural} who worked ${h.dist} mile, ranking in the <span class="caution">bottom ${100 - h.pctl.rating}%</span> of the group.`);
  } else {
    parts.push(`This ${h.sire} ${sexWord} breezed in the <span class="caution">bottom ${100 - h.pctl.rating}%</span> among ${n} ${sexPlural} working ${h.dist} mile at this sale.`);
  }

  const timeDelta = (h.time - peer.time).toFixed(1);
  if (h.pctl.time >= 85) {
    parts.push(`The raw time of <strong>${h.time}s</strong> was ${Math.abs(parseFloat(timeDelta))}s faster than the peer average of ${peer.time}s — elite speed for this group.`);
  } else if (h.pctl.time >= 60) {
    parts.push(`At <strong>${h.time}s</strong>, the breeze time came in ${Math.abs(parseFloat(timeDelta))}s quicker than the ${peer.time}s average for ${sexPlural} at this distance.`);
  } else if (h.pctl.time >= 40) {
    parts.push(`The <strong>${h.time}s</strong> breeze time was right around the ${peer.time}s average for the group.`);
  } else {
    parts.push(`The <strong>${h.time}s</strong> time was ${Math.abs(parseFloat(timeDelta))}s slower than the ${peer.time}s group average — below the pace you'd want to see.`);
  }

  if (h.pctl.stride >= 85) {
    parts.push(`A standout feature: the <strong>${h.stride}-foot stride</strong> was among the longest in the group (avg ${peer.stride}'), suggesting an efficient mover who covers ground with less effort.`);
  } else if (h.pctl.stride >= 60) {
    parts.push(`Stride length measured <strong>${h.stride}'</strong>, above the ${peer.stride}' average — a positive indicator of efficient ground coverage.`);
  } else if (h.pctl.stride >= 40) {
    parts.push(`Stride length was <strong>${h.stride}'</strong>, near the group average of ${peer.stride}'.`);
  } else {
    parts.push(`Stride length was <strong>${h.stride}'</strong>, shorter than the ${peer.stride}' average, which may indicate a choppier action.`);
  }

  if (h.pctl.decel >= 90) {
    parts.push(`What separates this horse is the <strong>${h.decel}s deceleration</strong> through the gallop-out — far better than the ${peer.decel}s average. Deceleration measures how well a horse sustains speed after crossing the wire. Lower numbers mean the horse was still carrying its speed rather than stopping quickly, which often translates to the ability to finish races strongly.`);
  } else if (h.pctl.decel >= 70) {
    parts.push(`Deceleration through the gallop-out clocked at <strong>${h.decel}s</strong>, better than the ${peer.decel}s peer average. This measures how well the horse maintained speed past the wire — a lower number indicates the horse was still running hard rather than gearing down.`);
  } else if (h.pctl.decel >= 45) {
    parts.push(`Gallop-out deceleration was <strong>${h.decel}s</strong>, close to the ${peer.decel}s average. This metric captures whether the horse was still carrying speed past the wire or shutting down quickly.`);
  } else {
    parts.push(`The <strong>${h.decel}s deceleration</strong> was slower than the ${peer.decel}s group average, meaning the horse lost more speed through the gallop-out than most of its peers.`);
  }

  const peerNote = ` <span class="peer-note">Compared against ${n} ${sexPlural} who breezed ${h.dist} mile at OBS March 2026.</span>`;
  return parts.join(' ') + peerNote;
}

// ── HTML template ──

function barColor(pct: number): string {
  if (pct >= 80) return '#2d6a4f';
  if (pct >= 60) return '#5a9e68';
  if (pct >= 40) return '#3a8abf';
  if (pct >= 25) return '#c8963e';
  return '#c07840';
}

function money(v: number): string {
  return v ? '$' + v.toLocaleString() : '—';
}

const TIER_COLORS: Record<string, { bg: string; ring: string }> = {
  'ELITE':     { bg: '#2d6a4f', ring: '#2d6a4f' },
  'STRONG':    { bg: '#5a9e68', ring: '#5a9e68' },
  'ABOVE AVG': { bg: '#3a8abf', ring: '#3a8abf' },
  'AVERAGE':   { bg: '#b0a030', ring: '#b0a030' },
  'BELOW AVG': { bg: '#c07840', ring: '#c07840' },
  'WEAK':      { bg: '#c04040', ring: '#c04040' },
};

function buildCardHtml(h: EnrichedHorse): string {
  const tc = TIER_COLORS[h.tier] || TIER_COLORS['AVERAGE'];
  const circ = 2 * Math.PI * 34;
  const dashOff = circ * (1 - h.rating / 100);
  const photoUrl = `https://obscatalog.com/2026/149/${h.hip}p.jpg`;
  const sexLabel = h.sex === 'C' ? 'Colt' : 'Filly';
  const topPct = 100 - Math.round((1 - (h.rank - 1) / h.totalRanked) * 100);
  const peer = h.peer;
  const blurb = generateBlurb(h);

  let saleVal = '';
  let saleLbl = '';
  if (h.saleStatus === 'SOLD') { saleVal = money(h.salePrice); saleLbl = 'Sale Price'; }
  else if (h.saleStatus === 'RNA') { saleVal = money(h.salePrice); saleLbl = 'RNA Bid'; }
  else if (h.saleStatus === 'OUT') { saleVal = 'W/D'; saleLbl = 'Withdrawn'; }
  else { saleVal = 'Upcoming'; saleLbl = 'Sale Status'; }

  const saleColor = h.saleStatus === 'SOLD' ? '#5eb66e' : h.saleStatus === 'RNA' ? '#d85555' : '#5a6a7e';

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
:root{--navy:#1a2332;--navy-light:#243044;--gold:#c8963e;--gold-light:#d4a84f;--slate:#8a9bae;--light-bg:#f5f7fa;--white:#fff;--text:#1a2332;--text-muted:#5a6a7e;--border:#dfe4ea;--green:#5eb66e;--blue:#4da6d8;--red:#d85555}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',-apple-system,sans-serif;background:transparent;display:flex;justify-content:center;padding:0}
.card{width:440px;background:var(--white);border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,35,50,.10),0 1px 4px rgba(26,35,50,.06)}
.card-header{background:linear-gradient(135deg,var(--navy),var(--navy-light));padding:20px 24px 16px;display:flex;justify-content:space-between;align-items:flex-start}
.brand{font-size:11px;font-weight:600;letter-spacing:1.5px;color:var(--gold);text-transform:uppercase}
.hip-badge{background:var(--gold);color:var(--navy);font-size:14px;font-weight:800;padding:4px 14px;border-radius:20px;letter-spacing:.5px}
.horse-name-row{padding:0 24px 18px;background:linear-gradient(135deg,var(--navy),var(--navy-light))}
.horse-name{color:#fff;font-size:22px;font-weight:700;line-height:1.2;margin-bottom:4px}
.horse-sub{color:var(--slate);font-size:12px;font-weight:500}
.horse-sub span{color:var(--gold-light)}
.card-photo{width:100%;height:auto;max-height:300px;object-fit:contain;background:var(--navy);display:block}
.tier-banner{text-align:center;padding:10px 24px;font-size:13px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#fff;display:flex;align-items:center;gap:12px;justify-content:center;background:${tc.bg}}
.tier-line{flex:1;height:1px;background:rgba(255,255,255,.3)}
.rating-section{display:flex;align-items:center;gap:20px;padding:18px 24px 14px}
.rating-ring-container{position:relative;width:80px;height:80px;flex-shrink:0}
.rating-ring-bg,.rating-ring-fill{position:absolute;top:0;left:0;width:80px;height:80px}
.rating-ring-bg circle{fill:none;stroke:#eef1f5;stroke-width:6}
.rating-ring-fill{transform:rotate(-90deg);transform-origin:center}
.rating-ring-fill circle{fill:none;stroke-width:6;stroke-linecap:round;transition:stroke-dashoffset .8s ease}
.rating-value{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:22px;font-weight:800;color:var(--text)}
.rating-meta{flex:1}
.rating-meta .label{font-size:11px;font-weight:600;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px}
.rank-row{display:flex;gap:16px}
.rank-item .num{font-size:16px;font-weight:700;color:var(--text)}
.rank-item .lbl{font-size:10px;color:var(--text-muted);font-weight:500;margin-top:1px}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);margin:0 24px;border-radius:10px;overflow:hidden}
.stat-cell{background:var(--white);padding:12px 10px;text-align:center}
.stat-cell .val{font-size:15px;font-weight:700;color:var(--text)}
.stat-cell .lbl{font-size:10px;color:var(--text-muted);font-weight:500;margin-top:2px}
.breeze-section{padding:18px 24px 14px}
.section-title{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--navy);margin-bottom:12px}
.bar-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.bar-label{width:50px;font-size:11px;font-weight:600;color:var(--text-muted);text-align:right}
.bar-track{flex:1;height:8px;background:#eef1f5;border-radius:4px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;transition:width .6s ease}
.bar-value{width:42px;font-size:11px;font-weight:700;color:var(--text)}
.bar-peer{width:65px;font-size:10px;color:var(--text-muted)}
.scouting-section{padding:4px 24px 18px}
.scouting-text{font-size:12px;line-height:1.65;color:var(--text);text-align:justify}
.scouting-text .highlight{color:#2d6a4f;font-weight:700}
.scouting-text .caution{color:#c07840;font-weight:700}
.scouting-text .peer-note{display:block;margin-top:8px;font-size:11px;color:var(--text-muted);font-style:italic}
.card-footer{padding:14px 24px;display:flex;justify-content:space-between;align-items:center;background:var(--light-bg)}
.footer-info{font-size:10px;color:var(--text-muted);font-weight:500}
.footer-logo{font-size:11px;font-weight:700;color:var(--navy);letter-spacing:.5px}
.footer-logo span{color:var(--gold)}
</style></head><body>
<div class="card">
  <div class="card-header">
    <div class="brand">ThoroughByte</div>
    <div class="hip-badge">HIP ${h.hip}</div>
  </div>
  <div class="horse-name-row">
    <div class="horse-name">${h.sire} &mdash; ${h.dam}</div>
    <div class="horse-sub">${sexLabel} &bull; ${h.state}-bred &bull; <span>${h.consigner}</span></div>
  </div>
  <img class="card-photo" src="${photoUrl}" alt="Hip ${h.hip}" onerror="this.style.display='none'" />
  <div class="tier-banner">
    <div class="tier-line"></div>
    ${h.tier}
    <div class="tier-line"></div>
  </div>
  <div class="rating-section">
    <div class="rating-ring-container">
      <svg class="rating-ring-bg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34"/></svg>
      <svg class="rating-ring-fill" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" stroke="${tc.ring}" stroke-dasharray="${circ}" stroke-dashoffset="${dashOff}" />
      </svg>
      <div class="rating-value">${h.rating}</div>
    </div>
    <div class="rating-meta">
      <div class="label">ThoroughByte Rating</div>
      <div class="rank-row">
        <div class="rank-item"><div class="num">#${h.rank}</div><div class="lbl">Overall Rank</div></div>
        <div class="rank-item"><div class="num">Top ${topPct < 1 ? '1' : topPct}%</div><div class="lbl">Percentile</div></div>
        <div class="rank-item"><div class="num">${h.dist} mi</div><div class="lbl">Breeze Dist</div></div>
      </div>
    </div>
  </div>
  <div class="stats-grid">
    <div class="stat-cell"><div class="val">${h.time}s</div><div class="lbl">Breeze Time</div></div>
    <div class="stat-cell"><div class="val">${h.eighth}s</div><div class="lbl">1/8 Out</div></div>
    <div class="stat-cell"><div class="val">${h.quarter}s</div><div class="lbl">1/4 Out</div></div>
    <div class="stat-cell"><div class="val">${h.stride}'</div><div class="lbl">Stride</div></div>
    <div class="stat-cell"><div class="val">${h.decel}s</div><div class="lbl">Decel</div></div>
    <div class="stat-cell"><div class="val" style="color:${saleColor}">${saleVal}</div><div class="lbl">${saleLbl}</div></div>
  </div>
  <div class="breeze-section">
    <div class="section-title">Performance vs. Peer Group</div>
    <div class="breeze-bars">
      <div class="bar-row"><div class="bar-label">Time</div><div class="bar-track"><div class="bar-fill" style="width:${h.pctl.time}%;background:${barColor(h.pctl.time)}"></div></div><div class="bar-value">${h.time}s</div><div class="bar-peer">avg ${peer.time}s</div></div>
      <div class="bar-row"><div class="bar-label">Stride</div><div class="bar-track"><div class="bar-fill" style="width:${h.pctl.stride}%;background:${barColor(h.pctl.stride)}"></div></div><div class="bar-value">${h.stride}'</div><div class="bar-peer">avg ${peer.stride}'</div></div>
      <div class="bar-row"><div class="bar-label">1/8 Out</div><div class="bar-track"><div class="bar-fill" style="width:${h.pctl.eighth}%;background:${barColor(h.pctl.eighth)}"></div></div><div class="bar-value">${h.eighth}s</div><div class="bar-peer">avg ${peer.eighth}s</div></div>
      <div class="bar-row"><div class="bar-label">1/4 Out</div><div class="bar-track"><div class="bar-fill" style="width:${h.pctl.quarter}%;background:${barColor(h.pctl.quarter)}"></div></div><div class="bar-value">${h.quarter}s</div><div class="bar-peer">avg ${peer.quarter}s</div></div>
      <div class="bar-row"><div class="bar-label">Decel</div><div class="bar-track"><div class="bar-fill" style="width:${h.pctl.decel}%;background:${barColor(h.pctl.decel)}"></div></div><div class="bar-value">${h.decel}s</div><div class="bar-peer">avg ${peer.decel}s</div></div>
    </div>
  </div>
  <div class="scouting-section">
    <div class="section-title">Scouting Report</div>
    <div class="scouting-text">${blurb}</div>
  </div>
  <div class="card-footer">
    <div class="footer-info">OBS March 2026 &bull; ${h.dist} Mile Breeze</div>
    <div class="footer-logo">Thorough<span>Byte</span></div>
  </div>
</div>
</body></html>`;
}

// ── Renderer ──

export async function renderProfileCard(horse: EnrichedHorse): Promise<Buffer> {
  const html = buildCardHtml(horse);

  // Dynamic import to avoid bundling chromium in client code
  const chromium = await import('@sparticuz/chromium');
  const puppeteer = await import('puppeteer-core');

  const browser = await puppeteer.default.launch({
    args: chromium.default.args,
    defaultViewport: { width: 480, height: 1200, deviceScaleFactor: 2 },
    executablePath: await chromium.default.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Get the card element dimensions
    const cardEl = await page.$('.card');
    if (!cardEl) throw new Error('Card element not found');

    const png = await cardEl.screenshot({ type: 'png' }) as Buffer;
    return Buffer.from(png);
  } finally {
    await browser.close();
  }
}

// Export for testing
export { buildCardHtml };
