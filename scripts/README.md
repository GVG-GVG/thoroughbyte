# Scripts

Analysis and scoring scripts for ThoroughByte. Each resolves paths relative to
the repo root, so run them from anywhere:

```bash
python3 scripts/deploy_day_norm.py
```

## deploy_day_norm.py

**The authoritative scoring pipeline.** Rewrites `src/lib/horse-data-obs-april-2026.json`
in place with fresh `rank`, `rating`, and `tier` values. Run after ingesting new
breeze data.

Pipeline order:

1. **Set adjustment** (1/8 mile only) — normalizes each set to the Set 1 baseline
   within a given day and sex.
2. **Day normalization** (1/8 mile only) — shifts `eighth_out`, `quarter_out`,
   and `decel` to the grand mean across days. 1/4 mile uses raw times, no
   adjustment.
3. **Z-scores** within each (sex, distance) cohort.
4. **3-sigma clip**, min-max scale to 0–100, assign tier and rank.

Weights by cohort:

| Cohort | time | stride | qtr_out | decel |
|--------|------|--------|---------|-------|
| C 1/8  | 0.20 | 0.30   | 0.30    | 0.20  |
| C 1/4  | 0.15 | 0.35   | 0.30    | 0.20  |
| F 1/8  | 0.20 | 0.20   | 0.35    | 0.25  |
| F 1/4  | 0.15 | 0.25   | 0.35    | 0.25  |

Tier thresholds: ELITE >= 80, STRONG 65–79, ABOVE AVG 50–64, AVERAGE 35–49,
BELOW AVG 20–34, WEAK < 20.

### Two special-case hip lists

`BAD_DATA_HIPS = {309, 523, 405}` — timing errors. Excluded from scoring
entirely and marked `tier: EXCLUDED` with blank rating and rank.

`OUTLIER_CEILING_HIPS = {1056}` — Hip 1056 (Flightline / Lucrezia) posted a
composite z-score far enough above the field that including him in min-max
scaling compressed every other C 1/8 colt by roughly six points. He is excluded
from the cohort statistics and from the scaling population, hardcoded to a
rating of 100, and the rest of the field is scaled to a ceiling of 99.

Effect of that change on C 1/8: ELITE went from 8 to 18, STRONG from 61 to 83.
Elite rate moved from 2.0% to 4.5%, in line with the 4–6% historical norm.

### Reading breeze times

OBS publishes times in fifths, not decimals. `9.1` means nine and one fifth —
10.2 real seconds would be `10.1`. `fifths_to_sec()` and `sec_to_fifths()`
handle the conversion; do not treat the raw value as a decimal.

## sales_analysis_pdf.py

Builds `obs-april-2026-sales-analysis.pdf` from the April 2026 JSON: sale
overview, tier breakdown, splits by sex and breeze distance, sell rate by tier
and sex, top 10 sales, and per-stallion averages split into 2+ sold and 1 sold.

Tier colors match the site's CSS (`src/app/dashboard/dashboard.css`). Every cell
is a `Paragraph` so long consigner and buyer names wrap instead of overflowing.

Update the subtitle and footer strings when the day range changes.

## stride_pdf.py

Builds `sire_stride_colts_vs_fillies.pdf` — average stride length for colts
versus fillies by sire, across all five OBS sales from 2024 to 2026. Includes
only sires with at least one of each sex, sorted by the differential.
