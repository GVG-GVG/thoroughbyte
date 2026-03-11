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
            <h1>A proprietary algorithmic model that predicts racetrack performance before the starting gate opens.</h1>
            <p className="hero-sub">
              Every buyer at the under-tack show sees the same clock. ThoroughByte
              goes deeper &mdash; our model synthesizes <em>20+ data points</em> from
              each breeze into a single 0–100 score, normalizing for
              environmental variables and isolating the true athletic signal
              &mdash; delivered <em>before</em> sale day.
            </p>
            <div className="hero-actions">
              <a href="#performance" className="btn btn-primary">See the Proof</a>
              <a href="#contact" className="btn btn-outline">Request Access</a>
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

      {/* WHAT WE DO */}
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

                {/* What our model saw — scorecard */}
                <div className="compare-scorecard">
                  <div className="sc-header">
                    <span className="sc-badge">WHAT OUR MODEL SAW</span>
                    <span className="sc-sale">2024 OBS April &middot; Hip 951</span>
                  </div>
                  <div className="sc-body">
                    <div className="sc-top">
                      <div>
                        <div className="sc-horse">Hip 951</div>
                        <div className="sc-sire">by Volatile &mdash; c, 1/8</div>
                        <div className="sc-dam">Dam: Athenian Beauty</div>
                      </div>
                      <div className="sc-score-block">
                        <div className="sc-score">68.6</div>
                        <div className="sc-score-label">TB SCORE</div>
                        <div className="sc-tier-badge sc-tier-strong">STRONG</div>
                      </div>
                    </div>

                    {/* Breeze inputs the model ingested */}
                    <div className="sc-inputs-label">BREEZE DATA INGESTED</div>
                    <div className="sc-metrics sc-metrics-4">
                      <div className="sc-metric">
                        <div className="sc-metric-val">25.7&prime;</div>
                        <div className="sc-metric-label">STRIDE LENGTH</div>
                      </div>
                      <div className="sc-metric">
                        <div className="sc-metric-val">:10.1</div>
                        <div className="sc-metric-label">1/8 OUT</div>
                      </div>
                      <div className="sc-metric">
                        <div className="sc-metric-val">:21.0</div>
                        <div className="sc-metric-label">1/4 OUT</div>
                      </div>
                      <div className="sc-metric sc-metric-prop">
                        <div className="sc-metric-val">11.74</div>
                        <div className="sc-metric-label">DECELERATION</div>
                        <div className="sc-prop-inline">Proprietary &mdash; only from ThoroughByte</div>
                      </div>
                    </div>

                    {/* Model output */}
                    <div className="sc-inputs-label">MODEL OUTPUT</div>
                    <div className="sc-metrics">
                      <div className="sc-metric">
                        <div className="sc-metric-val">Top 22%</div>
                        <div className="sc-metric-label">PERCENTILE</div>
                      </div>
                      <div className="sc-metric">
                        <div className="sc-metric-val">106 / 483</div>
                        <div className="sc-metric-label">RANK (COLTS)</div>
                      </div>
                      <div className="sc-metric">
                        <div className="sc-metric-val">50.0</div>
                        <div className="sc-metric-label">SESSION AVG</div>
                      </div>
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

      {/* PERFORMANCE: EARNINGS */}
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

      {/* MARKET MISSES / ALPHA */}
      <section className="section" id="alpha">
        <div className="container">
          <p className="section-tag">FINDING ALPHA</p>
          <h2>The market underprices talent.<br />We find it.</h2>
          <p className="section-intro">
            A "Market Miss" is a horse rated ELITE or STRONG that sold for $100K or less
            but went on to earn more than $50K on the track. In 2024, the algorithm
            flagged 36 of them. Here are the top 10.
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
          <p className="section-tag">THE PRODUCT</p>
          <h2>What you get.</h2>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h3>Pre-Sale Rankings</h3>
              <p>
                Complete ranked reports delivered before each sale day. Every horse
                scored, tiered, and ranked within sex and distance cohorts.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <h3>Sire Analytics</h3>
              <p>
                See which stallions are producing the highest-rated breezes.
                Aggregate sire performance across the entire sale.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/><circle cx="12" cy="7" r="3"/></svg>
              </div>
              <h3>Dam Annotations</h3>
              <p>
                Black-type dam production overlaid on every ranking. BTW, BTP,
                and BTProd flags so you see the full picture at a glance.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3>Value Flags</h3>
              <p>
                Algorithmic identification of high-rated horses likely to be
                undervalued by the market &mdash; the steals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / CONTACT */}
      <section className="section" id="contact">
        <div className="container container-narrow">
          <p className="section-tag">GET STARTED</p>
          <h2>Ready for an edge?</h2>
          <p className="section-intro">
            ThoroughByte is currently available for the 2026 OBS sale season.
            Contact us to discuss access and pricing.
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
            <a href="#what-we-do">What We Do</a>
            <a href="#performance">Performance</a>
            <a href="#alpha">Alpha</a>
            <a href="#product">Product</a>
            <a href="#contact">Contact</a>
          </div>
          <p className="footer-legal">&copy; 2026 ThoroughByte. All rights reserved. All data verified against Equibase records.</p>
        </div>
      </footer>

      <BackToTop />
    </>
  );
}
