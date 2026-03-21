import Nav from '@/components/Nav';
import ScoringNav from '@/components/ScoringNav';
import BackToTop from '@/components/BackToTop';
import '../scoring/scoring.css';

export const metadata = {
  title: 'Consigner Rating Methodology | ThoroughByte',
  description: 'How ThoroughByte rates consigners at two-year-old sales using Bayesian-adjusted racing outcomes, volume reliability, and market validation.',
};

export default function ConsignerScoringPage() {
  return (
    <>
      <Nav />
      <ScoringNav />
      <div className="scoring-page" style={{ paddingTop: '140px' }}>
        <div className="scoring-container">
          <p className="scoring-tag">CONSIGNER RATINGS</p>
          <h1>How We Rate Consigners</h1>
          <p className="scoring-intro">
            Consigner ratings measure something most buyers care about but rarely quantify:
            do the horses this operation puts through the ring go on to run? Our algorithm
            tracks post-sale racing outcomes for every horse breezed, applies statistical
            correction for sample size, and produces a single composite score.
          </p>

          <div className="scoring-term">
            <h2>What We Measure</h2>
            <p>
              The foundation of every consigner rating is racing performance. We track four
              metrics for every horse a consigner breezes at a sale, whether the horse sells
              or not. This is an important distinction &mdash; RNA horses still reflect on the
              consigner&rsquo;s program.
            </p>
            <p>
              <strong>% Started</strong> &mdash; What percentage of horses breezed went on to
              make at least one start on the racetrack. This is the most fundamental measure.
              A consigner whose horses consistently make it to the track is doing something right
              in selection and preparation.
            </p>
            <p>
              <strong>% Won</strong> &mdash; What percentage went on to win at least one race.
              Getting to the track matters, but winning matters more. This is weighted equally
              with starting rate because both are reliable indicators of consigner quality at
              reasonable sample sizes.
            </p>
            <p>
              <strong>% Stakes Winners</strong> &mdash; What percentage produced at least one
              stakes victory. This separates good programs from elite ones, but it&rsquo;s
              inherently rare &mdash; even the best consigners typically produce SW rates in
              the low teens.
            </p>
            <p>
              <strong>% Graded Stakes Winners</strong> &mdash; The top of the pyramid. Graded
              stakes winners are so rare that this metric carries the least weight, but when a
              consigner consistently produces them, it&rsquo;s a powerful signal.
            </p>
          </div>

          <div className="scoring-term">
            <h2>Why Raw Percentages Lie</h2>
            <p>
              A consigner who breezes 2 horses and both win has a 100% win rate. A consigner
              who breezes 60 horses and 35 win has a 58% win rate. Which one is actually better
              at producing winners?
            </p>
            <p>
              You don&rsquo;t know, and that&rsquo;s the point. Raw percentages are unreliable
              at small sample sizes. A single lucky horse can make a two-horse consigner look
              like Godolphin. We solve this using <strong>Bayesian shrinkage</strong> &mdash;
              a statistical technique that pulls small-sample rates toward the population average.
              The smaller the sample, the stronger the pull.
            </p>
            <p>
              In practice: a consigner with 2 horses and a 50% graded stakes winner rate gets
              adjusted down significantly (toward something like 8%), while a consigner with 60+
              horses barely moves. This means you can trust the ratings for large and small
              consigners alike &mdash; the math accounts for the uncertainty.
            </p>
          </div>

          <div className="scoring-term">
            <h2>The Composite Score</h2>
            <p>
              Each consigner&rsquo;s final score (0&ndash;100) combines three components.
            </p>
            <p>
              <strong>Racing Outcome Score</strong> &mdash; The dominant factor. This blends
              the four Bayesian-adjusted racing metrics (started, won, stakes winner, graded
              stakes winner) with heavier weight on starting and winning, lighter weight on
              stakes performance. The rationale: getting horses to the track and winning are
              the most reliable and repeatable indicators of consigner quality. Stakes results
              are too rare and variance-prone to carry heavy weight.
            </p>
            <p>
              <strong>Volume Reliability</strong> &mdash; A smaller component that rewards
              consigners with larger sample sizes, capped at a threshold. This isn&rsquo;t
              about rewarding size for its own sake &mdash; it&rsquo;s about statistical
              confidence. A consigner with 40 horses has a more trustworthy track record than
              one with 4, all else equal.
            </p>
            <p>
              <strong>Market Validation</strong> &mdash; Consigners who breeze horses but sell
              none of them receive a penalty. If the market won&rsquo;t buy your horses at any
              price, that&rsquo;s a meaningful signal. Consigners with at least one sale are
              unpenalized.
            </p>
          </div>

          <div className="scoring-term">
            <h2>What We Reward</h2>
            <div className="scoring-list">
              <div className="scoring-list-item scoring-list-positive">
                <span className="scoring-list-icon">+</span>
                <span>High percentage of horses making it to the racetrack</span>
              </div>
              <div className="scoring-list-item scoring-list-positive">
                <span className="scoring-list-icon">+</span>
                <span>High win rate among horses breezed</span>
              </div>
              <div className="scoring-list-item scoring-list-positive">
                <span className="scoring-list-icon">+</span>
                <span>Stakes and graded stakes production</span>
              </div>
              <div className="scoring-list-item scoring-list-positive">
                <span className="scoring-list-icon">+</span>
                <span>Larger sample sizes (more statistical confidence)</span>
              </div>
              <div className="scoring-list-item scoring-list-positive">
                <span className="scoring-list-icon">+</span>
                <span>At least one horse sold (market validation)</span>
              </div>
            </div>
          </div>

          <div className="scoring-term">
            <h2>What We Hold Against Them</h2>
            <div className="scoring-list">
              <div className="scoring-list-item scoring-list-negative">
                <span className="scoring-list-icon">&minus;</span>
                <span>Horses that breeze but never make it to the track</span>
              </div>
              <div className="scoring-list-item scoring-list-negative">
                <span className="scoring-list-icon">&minus;</span>
                <span>Low win rates relative to horses breezed</span>
              </div>
              <div className="scoring-list-item scoring-list-negative">
                <span className="scoring-list-icon">&minus;</span>
                <span>Small sample sizes (adjusted via Bayesian shrinkage, not trusted at face value)</span>
              </div>
              <div className="scoring-list-item scoring-list-negative">
                <span className="scoring-list-icon">&minus;</span>
                <span>Zero horses sold (no market validation whatsoever)</span>
              </div>
            </div>
          </div>

          <div className="scoring-term">
            <h2>Tiers</h2>
            <p>Tiers are assigned by percentile rank of the composite score across all consigners:</p>
            <div className="tier-table-wrap">
              <table className="tier-table">
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>What It Means</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="tier-badge tier-badge-elite">ELITE</span></td>
                    <td>The best consigning operations in the sale. Consistently high start rates, win rates, and stakes production across meaningful sample sizes.</td>
                  </tr>
                  <tr>
                    <td><span className="tier-badge tier-badge-strong">STRONG</span></td>
                    <td>Above-average programs with solid racing outcomes. These consigners reliably produce runners and winners.</td>
                  </tr>
                  <tr>
                    <td><span className="tier-badge tier-badge-above">ABOVE AVG</span></td>
                    <td>Better than the median consigner. Horses from these operations are more likely than not to make it to the track.</td>
                  </tr>
                  <tr>
                    <td><span className="tier-badge tier-badge-avg">AVERAGE</span></td>
                    <td>Middle of the pack. Outcomes are in line with the sale-wide averages.</td>
                  </tr>
                  <tr>
                    <td><span className="tier-badge tier-badge-below">BELOW AVG</span></td>
                    <td>Below-average racing outcomes. Often small sample sizes with limited track record.</td>
                  </tr>
                  <tr>
                    <td><span className="tier-badge tier-badge-weak">WEAK</span></td>
                    <td>Bottom of the rankings. Typically zero-sold consigners or operations with very few horses that rarely reach the track.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="scoring-term">
            <h2>Adjusted Metrics</h2>
            <p>
              In the consigner ratings table, you&rsquo;ll see both raw and adjusted columns.
              The &ldquo;Adj&rdquo; columns are the Bayesian-adjusted values that feed into
              the composite score. For large consigners (30+ horses), raw and adjusted values
              will be similar. For small consigners, the adjusted values may differ significantly
              from raw &mdash; that&rsquo;s the correction working as intended.
            </p>
            <p>
              When comparing consigners, always use the adjusted columns. They&rsquo;re the
              apples-to-apples numbers.
            </p>
          </div>

          <div className="scoring-term">
            <h2>Scope &amp; Limitations</h2>
            <p>
              The current consigner ratings cover OBS 2024 March and April combined sales
              (1,474 horses, 170 unique consigners). Ratings are based on racing outcomes
              through the data collection date and will be updated as more race results
              become available. Consigner names are normalized to merge agent variants
              (e.g., &ldquo;Eddie Woods, Agent VIII&rdquo; rolls up under &ldquo;Eddie
              Woods&rdquo;).
            </p>
          </div>

          <div className="scoring-cta">
            <a href="/dashboard" className="btn btn-primary">View Consigner Ratings</a>
            <a href="/scoring" className="btn btn-outline-dark">Horse Scoring Method</a>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-icon">T<span>B</span></span>
            <span className="footer-brand-text"><span className="logo-light">Thorough</span><span className="logo-bold">Byte</span></span>
            <p className="footer-tagline">Breeze Intelligence</p>
          </div>
          <p className="footer-legal">&copy; 2026 ThoroughByte. All rights reserved.</p>
        </div>
      </footer>

      <BackToTop />
    </>
  );
}
