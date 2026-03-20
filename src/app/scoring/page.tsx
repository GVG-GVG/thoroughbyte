import Nav from '@/components/Nav';
import BackToTop from '@/components/BackToTop';
import './scoring.css';

export const metadata = {
  title: 'Understanding Your ThoroughByte Score | ThoroughByte',
  description: 'How to read your ThoroughByte score, tier, rank, and percentile. A reference guide for buyers at 2-year-old sales.',
};

export default function ScoringPage() {
  return (
    <>
      <Nav />
      <div className="scoring-page">
        <div className="scoring-container">
          <p className="scoring-tag">HOW SCORING WORKS</p>
          <h1>Understanding Your ThoroughByte Score</h1>
          <p className="scoring-intro">
            Every horse that breezes at an under-tack show receives a ThoroughByte score.
            Here&rsquo;s how to read it.
          </p>

          <div className="scoring-term">
            <h2>Score (0&ndash;100)</h2>
            <p>
              A composite number representing the horse&rsquo;s overall athletic performance in
              the breeze, normalized for environmental conditions, session timing, and distance.
              Higher is better. The score is not a raw speed number &mdash; it synthesizes multiple
              performance dimensions into a single comparable value. A horse that scores 75 at
              OBS March can be meaningfully compared to a horse that scores 75 at OBS June,
              because both have been adjusted against their respective sale conditions.
            </p>
          </div>

          <div className="scoring-term">
            <h2>Tier</h2>
            <p>A classification based on score thresholds:</p>
            <div className="tier-table-wrap">
              <table className="tier-table">
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Score Range</th>
                    <th>What It Means</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="tier-badge tier-badge-elite">ELITE</span></td>
                    <td>&ge; 80</td>
                    <td>Top-of-sale athlete. Exceptional across multiple metrics. Historically, 45% of ELITE horses go on to win a stakes race.</td>
                  </tr>
                  <tr>
                    <td><span className="tier-badge tier-badge-strong">STRONG</span></td>
                    <td>65&ndash;79</td>
                    <td>Well-above-average breeze. Multiple standout metrics. The sweet spot for value buyers &mdash; not always priced like elite, but frequently runs like it.</td>
                  </tr>
                  <tr>
                    <td><span className="tier-badge tier-badge-above">ABOVE AVG</span></td>
                    <td>50&ndash;64</td>
                    <td>Solid performer with one or more above-average metrics. Competitive racehorses live here.</td>
                  </tr>
                  <tr>
                    <td><span className="tier-badge tier-badge-avg">AVERAGE</span></td>
                    <td>35&ndash;49</td>
                    <td>Middle of the pack. No glaring weaknesses, no standout strengths. Outcome depends heavily on training, management, and opportunity.</td>
                  </tr>
                  <tr>
                    <td><span className="tier-badge tier-badge-below">BELOW AVG</span></td>
                    <td>20&ndash;34</td>
                    <td>One or more metrics significantly below the cohort baseline. Higher risk profile.</td>
                  </tr>
                  <tr>
                    <td><span className="tier-badge tier-badge-weak">WEAK</span></td>
                    <td>&lt; 20</td>
                    <td>Multiple metrics well below baseline. Historically the lowest-earning tier by a wide margin.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="scoring-term">
            <h2>Rank</h2>
            <p>
              Where the horse places among all horses of the same sex who breezed the same distance
              at that sale. Rank #1 is the highest-scored horse in the cohort. Rank provides ordinal
              context that score alone doesn&rsquo;t &mdash; a score of 72 might be #15 in a deep
              March sale or #5 in a thinner June sale.
            </p>
          </div>

          <div className="scoring-term">
            <h2>Percentile</h2>
            <p>
              The percentage of horses in the cohort that scored lower. &ldquo;Top 22%&rdquo; means
              the horse outscored 78% of its peer group. Percentile is often the most intuitive way
              to understand where a horse stands relative to the field.
            </p>
          </div>

          <div className="scoring-term">
            <h2>Cohort</h2>
            <p>
              The comparison group. Horses are always scored and ranked within their sex (colts vs
              fillies) and breeze distance (1/8 mile vs 1/4 mile). A filly who breezed a furlong is
              compared only against other fillies who breezed a furlong at the same sale. This prevents
              distance and sex differences from distorting the rankings.
            </p>
          </div>

          <div className="scoring-cta">
            <a href="/consigner-scoring" className="btn btn-primary">Consigner Scoring Method</a>
            <a href="/#contact" className="btn btn-outline-dark">Request Access</a>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-light">Thorough</span><span className="logo-bold">Byte</span>
            <p className="footer-tagline">Breeze Intelligence</p>
          </div>
          <p className="footer-legal">&copy; 2026 ThoroughByte. All rights reserved.</p>
        </div>
      </footer>

      <BackToTop />
    </>
  );
}
