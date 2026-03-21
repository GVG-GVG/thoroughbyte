import Image from 'next/image';
import Nav from '@/components/Nav';
import Charts from '@/components/Charts';
import BackToTop from '@/components/BackToTop';
import ContactForm from '@/components/ContactForm';

export default function Home() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-tag">BREEZE INTELLIGENCE</p>
            <h1>A proprietary algorithmic model that predicts racehorse performance before the starting gate opens.</h1>
            <p className="hero-sub">
              Every buyer at the under-tack show sees the same clock. ThoroughByte
              goes deeper &mdash; our model synthesizes <em>20+ data points</em> from
              each breeze into a single 0&ndash;100 score, normalizing for
              environmental variables and isolating the true athletic signal
              &mdash; delivered <em>before</em> sale day.
            </p>
            <div className="hero-actions">
              <a href="#performance" className="btn btn-primary">See the Proof</a>
              <a href="#pricing" className="btn btn-outline">View Pricing</a>
            </div>
          </div>
          <div className="hero-proof">
            <div className="proof-header">
              <span className="proof-badge">2024 OBS RESULTS</span>
              <span className="proof-sample">1,474 horses &middot; $89M in earnings &middot; 18 months post-sale</span>
            </div>

            {/* Visual earnings staircase */}
            <div className="staircase">
              <div className="stair-label-head">
                <span>Tier</span><span>Avg Earnings</span>
              </div>
              <div className="stair-row">
                <span className="stair-tier stair-t-elite">ELITE</span>
                <div className="stair-track"><div className="stair-bar stair-b-elite" style={{ width: '100%' }}></div></div>
                <span className="stair-val">$137,780</span>
              </div>
              <div className="stair-row">
                <span className="stair-tier stair-t-strong">STRONG</span>
                <div className="stair-track"><div className="stair-bar stair-b-strong" style={{ width: '69%' }}></div></div>
                <span className="stair-val">$94,871</span>
              </div>
              <div className="stair-row">
                <span className="stair-tier stair-t-above">ABOVE AVG</span>
                <div className="stair-track"><div className="stair-bar stair-b-above" style={{ width: '39%' }}></div></div>
                <span className="stair-val">$53,312</span>
              </div>
              <div className="stair-row">
                <span className="stair-tier stair-t-avg">AVERAGE</span>
                <div className="stair-track"><div className="stair-bar stair-b-avg" style={{ width: '34%' }}></div></div>
                <span className="stair-val">$46,631</span>
              </div>
              <div className="stair-row">
                <span className="stair-tier stair-t-below">BELOW AVG</span>
                <div className="stair-track"><div className="stair-bar stair-b-below" style={{ width: '24%' }}></div></div>
                <span className="stair-val">$32,987</span>
              </div>
              <div className="stair-row">
                <span className="stair-tier stair-t-weak">WEAK</span>
                <div className="stair-track"><div className="stair-bar stair-b-weak" style={{ width: '12%' }}></div></div>
                <span className="stair-val">$16,536</span>
              </div>
            </div>

            {/* Knockout stats */}
            <div className="proof-bottom">
              <div className="proof-ko">
                <span className="ko-num">34<span className="ko-of">/47</span></span>
                <span className="ko-label">Graded Stakes Winners from top 2 tiers</span>
              </div>
              <div className="proof-ko-divider"></div>
              <div className="proof-ko">
                <span className="ko-num">1</span>
                <span className="ko-label">Graded Stakes Winners from bottom 2 tiers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE BUILT */}
      <section className="section" id="what-we-do">
        <div className="container">
          <div className="two-col">
            <div className="col-text">
              <p className="section-tag">WHAT WE BUILT</p>
              <h2>A rating system calibrated to real outcomes.</h2>
              <p>
                Every horse that breezes at an under-tack show generates data far
                richer than the clock time posted on the board. ThoroughByte captures
                multiple performance dimensions from each breeze and runs them
                through a composite model that accounts for environmental noise,
                sex-specific baselines, and distance benchmarks.
              </p>
              <p>
                The output is a single score (0–100) and a tier classification
                &mdash; ELITE, STRONG, ABOVE AVG, AVERAGE, BELOW AVG, or WEAK &mdash;
                that tells you where a horse stands relative to the entire sale
                population. No opinions. No pedigree bias. Just the athletic signal
                extracted from the breeze itself.
              </p>
              <div className="sample-report-inline">
                <p className="sample-report-label">SAMPLE REPORT</p>
                <a href="sample-report.png" target="_blank" rel="noopener noreferrer" className="sample-report-wrap">
                  <Image
                    src="/sample-report.png"
                    alt="Sample ThoroughByte ranking report showing horses sorted by hip with color-coded tiers"
                    width={600}
                    height={400}
                    className="sample-report-img"
                    priority={false}
                  />
                </a>
              </div>
            </div>
            <div className="col-visual">
              <div className="compare-stack">
                {/* What the market saw */}
                <div className="compare-market">
                  <div className="compare-label">WHAT THE MARKET SAW</div>
                  <div className="compare-horse">Hip 951</div>
                  <div className="market-pedigree">
                    <div className="market-ped-row">
                      <span className="market-ped-label">Sire</span>
                      <span className="market-ped-val">Volatile</span>
                    </div>
                    <div className="market-ped-row">
                      <span className="market-ped-label">Dam</span>
                      <span className="market-ped-val">Athenian Beauty</span>
                    </div>
                    <div className="market-ped-row">
                      <span className="market-ped-label">Sex / Dist</span>
                      <span className="market-ped-val">Colt &middot; 1/8</span>
                    </div>
                  </div>
                  <div className="market-clock">
                    <span className="market-clock-val">:10.1</span>
                    <span className="market-clock-label">furlong time</span>
                  </div>
                  <p className="market-note">Pedigree page and a clock time. No context for track variant, session depth, stride mechanics, or environmental conditions.</p>
                </div>

                {/* Arrow */}
                <div className="compare-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                  THOROUGHBYTE ANALYSIS
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                </div>

                {/* What our model saw — actual horse card */}
                <div className="compare-card-wrap">
                  <div className="compare-label">WHAT OUR MODEL SAW</div>
                  <div className="hc">
                    <div className="hc-header">
                      <span className="hc-brand">THOROUGHBYTE</span>
                      <span className="hc-hip-badge">HIP 951</span>
                    </div>
                    <div className="hc-name-row">
                      <div className="hc-name">Volatile &mdash; Athenian Beauty</div>
                      <div className="hc-sub">Colt &bull; FL-bred &bull; <span>Wavertree Stables Inc</span></div>
                    </div>
                    <img src="https://obscatalog.com/2024/136/951p.jpg" alt="Hip 951 — Volatile colt at OBS Spring 2024" className="hc-photo" />
                    <div className="hc-tier-banner hc-tier-strong">
                      <div className="hc-tier-line"></div>
                      STRONG
                      <div className="hc-tier-line"></div>
                    </div>
                    <div className="hc-rating-section">
                      <div className="hc-ring-wrap">
                        <svg className="hc-ring-bg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke="#eef1f5" strokeWidth="6" /></svg>
                        <svg className="hc-ring-fill" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke="#5a9e68" strokeWidth="6" strokeLinecap="round" strokeDasharray="213.63" strokeDashoffset="67.09" /></svg>
                        <div className="hc-ring-val">68.6</div>
                      </div>
                      <div className="hc-rating-meta">
                        <div className="hc-meta-label">THOROUGHBYTE RATING</div>
                        <div className="hc-rank-row">
                          <div className="hc-rank-item"><div className="hc-rank-num">#106</div><div className="hc-rank-lbl">Overall Rank</div></div>
                          <div className="hc-rank-item"><div className="hc-rank-num">Top 22%</div><div className="hc-rank-lbl">Percentile</div></div>
                          <div className="hc-rank-item"><div className="hc-rank-num">1/8 mi</div><div className="hc-rank-lbl">Breeze Dist</div></div>
                        </div>
                      </div>
                    </div>
                    <div className="hc-stats-grid">
                      <div className="hc-stat"><div className="hc-stat-val">10.1s</div><div className="hc-stat-lbl">Breeze Time</div></div>
                      <div className="hc-stat"><div className="hc-stat-val">10.1s</div><div className="hc-stat-lbl">1/8 Out</div></div>
                      <div className="hc-stat"><div className="hc-stat-val">21.0s</div><div className="hc-stat-lbl">1/4 Out</div></div>
                      <div className="hc-stat"><div className="hc-stat-val">25.7&prime;</div><div className="hc-stat-lbl">Stride</div></div>
                      <div className="hc-stat"><div className="hc-stat-val">11.74s</div><div className="hc-stat-lbl">Decel</div></div>
                      <div className="hc-stat"><div className="hc-stat-val hc-val-green">$100,000</div><div className="hc-stat-lbl">Sale Price</div></div>
                    </div>
                    <div className="hc-bars-section">
                      <div className="hc-section-title">PERFORMANCE VS. PEER GROUP</div>
                      <div className="hc-bar-row"><span className="hc-bar-label">Time</span><span className="hc-bar-track"><span className="hc-bar-fill hc-fill-strong" style={{ width: '72%' }}></span></span><span className="hc-bar-val">10.1s</span><span className="hc-bar-peer">avg 10.3s</span></div>
                      <div className="hc-bar-row"><span className="hc-bar-label">Stride</span><span className="hc-bar-track"><span className="hc-bar-fill hc-fill-strong" style={{ width: '78%' }}></span></span><span className="hc-bar-val">25.7&prime;</span><span className="hc-bar-peer">avg 24.8&prime;</span></div>
                      <div className="hc-bar-row"><span className="hc-bar-label">1/8 Out</span><span className="hc-bar-track"><span className="hc-bar-fill hc-fill-strong" style={{ width: '72%' }}></span></span><span className="hc-bar-val">10.1s</span><span className="hc-bar-peer">avg 10.3s</span></div>
                      <div className="hc-bar-row"><span className="hc-bar-label">1/4 Out</span><span className="hc-bar-track"><span className="hc-bar-fill hc-fill-strong" style={{ width: '68%' }}></span></span><span className="hc-bar-val">21.0s</span><span className="hc-bar-peer">avg 21.4s</span></div>
                      <div className="hc-bar-row"><span className="hc-bar-label">Decel</span><span className="hc-bar-track"><span className="hc-bar-fill hc-fill-strong" style={{ width: '70%' }}></span></span><span className="hc-bar-val">11.74s</span><span className="hc-bar-peer">avg 12.1s</span></div>
                    </div>
                    <div className="hc-scouting">
                      <div className="hc-section-title">SCOUTING REPORT</div>
                      <p className="hc-scouting-text">This Volatile colt posted a well-above-average breeze, placing in the <strong className="hc-highlight">top 22%</strong> among the 483 colts who breezed 1/8 mile at this sale. At <strong>10.1s</strong>, the breeze time came in 0.2s quicker than the 10.3s average. A standout feature: the <strong>25.7-foot stride</strong> was among the longest in the group (avg 24.8&prime;), suggesting an efficient mover. Deceleration through the gallop-out clocked at <strong>11.74s</strong>, better than the 12.1s peer average &mdash; indicating the horse was still running hard past the wire.</p>
                      <p className="hc-peer-note">Compared against 483 colts who breezed 1/8 mile at OBS April 2024.</p>
                    </div>
                    <div className="hc-footer">
                      <span className="hc-footer-info">OBS April 2024 &bull; 1/8 Mile Breeze</span>
                      <span className="hc-footer-logo">Thorough<span>Byte</span></span>
                    </div>
                  </div>
                  <div className="sc-outcome">
                    <div className="sc-outcome-label">18 MONTHS LATER</div>
                    <div className="sc-outcome-row">
                      <div>
                        <div className="sc-outcome-name">Speed King</div>
                        <div className="sc-outcome-record">9-3-1-0 &middot; Graded Black-Type Winner</div>
                      </div>
                      <div className="sc-outcome-earn">$830,190</div>
                    </div>
                    <div className="sc-outcome-return">+730% return on a $100K purchase</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE: EARNINGS / THE PROOF */}
      <section className="section section-dark" id="performance">
        <div className="container">
          <p className="section-tag">THE PROOF</p>
          <h2>Every metric drops monotonically from ELITE to WEAK.</h2>
          <p className="section-intro">
            We tracked 1,474 horses from the 2024 OBS March and April sales through
            18 months of racing. Every rating was generated <em>before</em> any horse
            entered a starting gate. Here's what happened.
          </p>

          {/* Tier overview strip */}
          <div className="tier-strip">
            <div className="tier-item">
              <span className="tier-dot tier-c-elite"></span>
              <span className="tier-name">ELITE</span>
              <span className="tier-count">75 horses</span>
            </div>
            <div className="tier-item">
              <span className="tier-dot tier-c-strong"></span>
              <span className="tier-name">STRONG</span>
              <span className="tier-count">280 horses</span>
            </div>
            <div className="tier-item">
              <span className="tier-dot tier-c-above"></span>
              <span className="tier-name">ABOVE AVG</span>
              <span className="tier-count">516 horses</span>
            </div>
            <div className="tier-item">
              <span className="tier-dot tier-c-avg"></span>
              <span className="tier-name">AVERAGE</span>
              <span className="tier-count">412 horses</span>
            </div>
            <div className="tier-item">
              <span className="tier-dot tier-c-below"></span>
              <span className="tier-name">BELOW AVG</span>
              <span className="tier-count">137 horses</span>
            </div>
            <div className="tier-item">
              <span className="tier-dot tier-c-weak"></span>
              <span className="tier-name">WEAK</span>
              <span className="tier-count">54 horses</span>
            </div>
          </div>

          {/* Charts */}
          <Charts />
        </div>
      </section>

      {/* HOW TO USE ON SALE WEEK */}
      <section className="section" id="how-to-use">
        <div className="container">
          <p className="section-tag">YOUR EDGE ON SALE DAY</p>
          <h2>Four steps between you and the best athletes in the sale.</h2>
          <div className="steps-vertical">
            <div className="step-item">
              <span className="step-num">1</span>
              <div className="step-body">
                <h3>Scores go live the same day horses breeze.</h3>
                <p>
                  Not the night before, not the morning of the sale. As the breeze show unfolds,
                  every horse that worked is scored, tiered, and sorted within sex and distance
                  cohorts. Generate individual horse cards for the prospects you care about, or
                  explore the full ranked list with Elite access. Either way, you have data before
                  the sale ring opens.
                </p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-num">2</span>
              <div className="step-body">
                <h3>Zero in on the athletes that matter.</h3>
                <p>
                  Search by hip number to pull up any horse and generate a detailed profile card
                  with score, tier, and a written scouting summary. On the Elite plan, open the
                  full interactive ranked list &mdash; sort by any column, filter by tier or cohort,
                  isolate state-breds, and export the whole thing as a PDF.
                </p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-num">3</span>
              <div className="step-body">
                <h3>Challenge the market&rsquo;s assumptions.</h3>
                <p>
                  A :10.1 breeze on Day 1 is not the same as a :10.1 breeze on Day 3.
                  It may not even be the same as a :10.1 breeze three sets later on the same morning.
                  Track conditions shift constantly &mdash; and not always in the same direction.
                  A sealed surface that started deep and cuppy can dry out and turn fast by midmorning.
                  The next day, a freshly harrowed track might ride fast early and deteriorate as hundreds
                  of horses churn through it. Weather changes between sets. Moisture levels shift.
                </p>
                <p>
                  ThoroughByte normalizes for all of it: session depth, track variant, set-to-set surface
                  changes, and environmental conditions. The model doesn&rsquo;t assume conditions move in
                  one direction &mdash; it measures which direction they actually moved and adjusts accordingly.
                </p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-num">4</span>
              <div className="step-body">
                <h3>Buy with conviction.</h3>
                <p>
                  Walk into the sale ring knowing the difference between a horse the market priced
                  correctly and one it didn&rsquo;t. ThoroughByte won&rsquo;t replace your eye or your
                  experience &mdash; it gives both of them better information to work with.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARKET MISSES / ALPHA */}
      <section className="section" id="alpha">
        <div className="container">
          <p className="section-tag">FINDING ALPHA</p>
          <h2>The market underprices talent.<br />We find it.</h2>
          <p className="section-intro">
            A &ldquo;Market Miss&rdquo; is a horse rated ELITE or STRONG that sold for $100K or less
            but went on to earn $100K or more on the track. In 2024, the algorithm
            flagged 36 of them.
          </p>
          <p className="bridge-sentence">
            This is exactly the kind of horse ThoroughByte is built to surface before the sale
            ring prices it correctly. Every horse in the table below was algorithmically flagged
            as high-rated at a time when the market had not yet recognized the value. The data
            was generated before any of these horses ever entered a starting gate.
          </p>

          {/* Table */}
          <div className="misses-table-wrap">
            <table className="misses-table">
              <thead>
                <tr>
                  <th>Horse</th>
                  <th>Sire</th>
                  <th>Tier</th>
                  <th>Score</th>
                  <th>Sale Price</th>
                  <th>Earnings</th>
                  <th>Return</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Speed King</strong></td>
                  <td>Volatile</td>
                  <td><span className="tag tag-strong">STRONG</span></td>
                  <td>68.6</td>
                  <td>$100,000</td>
                  <td className="earnings">$830,190</td>
                  <td className="positive">+730%</td>
                </tr>
                <tr>
                  <td><strong>Bam&rsquo;s Bliss Kiss</strong></td>
                  <td>Solomini</td>
                  <td><span className="tag tag-strong">STRONG</span></td>
                  <td>70.4</td>
                  <td>$95,000</td>
                  <td className="earnings">$286,290</td>
                  <td className="positive">+201%</td>
                </tr>
                <tr>
                  <td><strong>Naughty Rascal</strong></td>
                  <td>Rogueish</td>
                  <td><span className="tag tag-strong">STRONG</span></td>
                  <td>72.2</td>
                  <td>$39,000</td>
                  <td className="earnings">$243,975</td>
                  <td className="positive">+526%</td>
                </tr>
                <tr>
                  <td><strong>Starship Impulsive</strong></td>
                  <td>Improbable</td>
                  <td><span className="tag tag-strong">STRONG</span></td>
                  <td>72.3</td>
                  <td>$50,000</td>
                  <td className="earnings">$218,210</td>
                  <td className="positive">+336%</td>
                </tr>
                <tr>
                  <td><strong>In My Memories</strong></td>
                  <td>Jimmy Creed</td>
                  <td><span className="tag tag-strong">STRONG</span></td>
                  <td>77.3</td>
                  <td>$40,000</td>
                  <td className="earnings">$212,934</td>
                  <td className="positive">+432%</td>
                </tr>
                <tr>
                  <td><strong>Artislas</strong></td>
                  <td>Catalina Cruiser</td>
                  <td><span className="tag tag-strong">STRONG</span></td>
                  <td>75.0</td>
                  <td>$100,000</td>
                  <td className="earnings">$209,500</td>
                  <td className="positive">+110%</td>
                </tr>
                <tr>
                  <td><strong>R Morning Brew</strong></td>
                  <td>Curlin&rsquo;s Honor</td>
                  <td><span className="tag tag-strong">STRONG</span></td>
                  <td>79.3</td>
                  <td>$30,000</td>
                  <td className="earnings">$188,842</td>
                  <td className="positive">+530%</td>
                </tr>
                <tr>
                  <td><strong>Mrs Worldwide</strong></td>
                  <td>Global Campaign</td>
                  <td><span className="tag tag-elite">ELITE</span></td>
                  <td>80.7</td>
                  <td>$100,000</td>
                  <td className="earnings">$173,350</td>
                  <td className="positive">+73%</td>
                </tr>
                <tr>
                  <td><strong>R Pretty Kitty</strong></td>
                  <td>Instilled Regard</td>
                  <td><span className="tag tag-strong">STRONG</span></td>
                  <td>70.3</td>
                  <td>$30,000</td>
                  <td className="earnings">$142,693</td>
                  <td className="positive">+376%</td>
                </tr>
                <tr>
                  <td><strong>Powdered Sugar</strong></td>
                  <td>Gift Box</td>
                  <td><span className="tag tag-strong">STRONG</span></td>
                  <td>66.2</td>
                  <td>$95,000</td>
                  <td className="earnings">$135,440</td>
                  <td className="positive">+43%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRODUCT */}
      <section className="section section-dark" id="product">
        <div className="container">
          <p className="section-tag">THE PLATFORM</p>
          <h2>Everything you need, nothing you don&rsquo;t.</h2>
          <p className="section-intro" style={{ color: '#c5cdd8' }}>The ThoroughByte platform powers every tier &mdash; from free horse cards to the full Elite suite.</p>
          <div className="features features-3col">
            <div className="feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              </div>
              <h3>Horse Profile Cards</h3>
              <p>
                Individual horse cards with breeze time, stride length, gallop-out, deceleration,
                percentile rank, and a written scouting summary. Downloadable as PNG.
              </p>
              <span className="feature-tier feature-tier-all">All Plans</span>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3><a href="/consigner-scoring" style={{ color: 'inherit', textDecoration: 'none' }}>Consigner Ratings</a></h3>
              <p>
                Every consigner scored and tiered using Bayesian-adjusted racing outcomes, volume
                reliability, and market validation. Know which barns are producing runners &mdash; not just
                sale-toppers. <a href="/consigner-scoring" style={{ color: '#c8963e', fontWeight: 600 }}>See the methodology &rarr;</a>
              </p>
              <span className="feature-tier feature-tier-pro">Pro &amp; Elite</span>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h3>Interactive Ranked Sale List</h3>
              <p>
                Every horse scored 0&ndash;100 and tiered. Sortable and filterable by hip, score, tier,
                percentile, stride length, deceleration, sire, and state-bred designation. Exportable as PDF.
              </p>
              <span className="feature-tier feature-tier-elite">Elite</span>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <h3>Sire Performance Summary</h3>
              <p>
                Aggregate breeze metrics by stallion across the entire sale. See which sires are
                producing the highest-rated athletes.
              </p>
              <span className="feature-tier feature-tier-elite">Elite</span>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/><circle cx="12" cy="7" r="3"/></svg>
              </div>
              <h3>Dam Black-Type Overlay</h3>
              <p>
                BTW, BTP, and BTProd flags on every ranked horse, so pedigree context is visible
                alongside the athletic data.
              </p>
              <span className="feature-tier feature-tier-elite">Elite</span>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3>Value Flags</h3>
              <p>
                Algorithmic markers where ThoroughByte&rsquo;s athletic rating significantly exceeds
                expected market price based on historical consignor and sire median sale data.
              </p>
              <span className="feature-tier feature-tier-elite">Elite</span>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
              <h3>Tier Analysis PDF</h3>
              <p>
                Full-sale breakdown: tier distribution, average metrics per tier, and cohort
                comparisons by sex and distance.
              </p>
              <span className="feature-tier feature-tier-elite">Elite</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="container">
          <p className="section-tag">PRICING</p>
          <h2>Choose your edge.</h2>
          <p className="section-intro">
            Start free with 3 horse card lookups. Upgrade when you&rsquo;re ready for more.
          </p>
          <div className="pricing-grid">
            {/* Free */}
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3>Free</h3>
                <div className="pricing-price">$0</div>
                <p className="pricing-period">forever</p>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feat-yes">3 horse card lookups</li>
                <li className="pricing-feat-yes">Downloadable PNG cards</li>
                <li className="pricing-feat-no">Horse Ratings table</li>
                <li className="pricing-feat-no">Consigner Ratings</li>
                <li className="pricing-feat-no">Sire Performance</li>
                <li className="pricing-feat-no">Sorting &amp; filtering</li>
                <li className="pricing-feat-no">PDF / CSV export</li>
              </ul>
              <a href="/auth/signup" className="btn btn-outline pricing-cta">Create Free Account</a>
            </div>

            {/* Short List */}
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3>Short List</h3>
                <div className="pricing-price">$250</div>
                <p className="pricing-period">per sale</p>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feat-yes">25 horse card lookups</li>
                <li className="pricing-feat-yes">Downloadable PNG cards</li>
                <li className="pricing-feat-no">Horse Ratings table</li>
                <li className="pricing-feat-no">Consigner Ratings</li>
                <li className="pricing-feat-no">Sire Performance</li>
                <li className="pricing-feat-no">Sorting &amp; filtering</li>
                <li className="pricing-feat-no">PDF / CSV export</li>
              </ul>
              <a href="/auth/signup" className="btn btn-outline pricing-cta">Get Started</a>
            </div>

            {/* Pro */}
            <div className="pricing-card pricing-card-featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-card-header">
                <h3>Pro</h3>
                <div className="pricing-price">$1,000</div>
                <p className="pricing-period">per year</p>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feat-yes">Unlimited horse cards</li>
                <li className="pricing-feat-yes">Downloadable PNG cards</li>
                <li className="pricing-feat-no">Horse Ratings table</li>
                <li className="pricing-feat-yes">Consigner Ratings</li>
                <li className="pricing-feat-no">Sire Performance</li>
                <li className="pricing-feat-no">Sorting &amp; filtering</li>
                <li className="pricing-feat-no">PDF / CSV export</li>
              </ul>
              <a href="/auth/signup" className="btn btn-primary pricing-cta">Upgrade to Pro</a>
            </div>

            {/* Elite */}
            <div className="pricing-card pricing-card-dark">
              <div className="pricing-card-header">
                <h3>Elite</h3>
                <div className="pricing-price">$5,000</div>
                <p className="pricing-period">per year</p>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feat-yes">Unlimited horse cards</li>
                <li className="pricing-feat-yes">Downloadable PNG cards</li>
                <li className="pricing-feat-yes">Horse Ratings table</li>
                <li className="pricing-feat-yes">Consigner Ratings</li>
                <li className="pricing-feat-yes">Sire Performance</li>
                <li className="pricing-feat-yes">Full sorting &amp; filtering</li>
                <li className="pricing-feat-yes">PDF / CSV export</li>
              </ul>
              <a href="/auth/signup" className="btn btn-primary pricing-cta">Go Elite</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / CONTACT */}
      <section className="section" id="contact">
        <div className="container container-narrow">
          <p className="section-tag">QUESTIONS?</p>
          <h2>Get in touch.</h2>
          <p className="section-intro">
            Have questions about which plan is right for you? We&rsquo;re here to help.
          </p>
          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-light">Thorough</span><span className="logo-bold">Byte</span>
            <p className="footer-tagline">Breeze Intelligence</p>
          </div>
          <div className="footer-links">
            <a href="#how-to-use">How It Works</a>
            <a href="#what-we-do">What We Built</a>
            <a href="#performance">Performance</a>
            <a href="#alpha">Alpha</a>
            <a href="/scoring">Horse Scoring</a>
            <a href="/consigner-scoring">Consigner Scoring</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
          <p className="footer-legal">&copy; 2026 ThoroughByte. All rights reserved. All data verified against Equibase records.</p>
        </div>
      </footer>

      <BackToTop />
    </>
  );
}
