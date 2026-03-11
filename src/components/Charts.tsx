'use client';

import { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

export default function Charts() {
  const chartEarningsRef = useRef<HTMLCanvasElement>(null);
  const chartWinRateRef = useRef<HTMLCanvasElement>(null);
  const chartBlackTypeRef = useRef<HTMLCanvasElement>(null);
  const chartGSWRef = useRef<HTMLCanvasElement>(null);
  const chartDecileRef = useRef<HTMLCanvasElement>(null);
  const chartAlphaRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const tierLabels = ['ELITE', 'STRONG', 'ABOVE AVG', 'AVERAGE', 'BELOW AVG', 'WEAK'];
    const tierColors = ['#2d6a4f', '#6aae78', '#bfb350', '#a0a0a0', '#c87a5a', '#b83c3c'];
    const gridColor = 'rgba(255,255,255,0.06)';
    const gridColorLight = 'rgba(26,35,50,0.08)';

    // Chart defaults
    ChartJS.defaults.font.family = "'Inter', sans-serif";
    ChartJS.defaults.color = '#8a9bae';
    ChartJS.defaults.plugins.legend.display = false;
    ChartJS.defaults.plugins.tooltip.backgroundColor = '#1a2332';
    ChartJS.defaults.plugins.tooltip.titleFont = { size: 13, weight: 600 };
    ChartJS.defaults.plugins.tooltip.bodyFont = { size: 12 };
    ChartJS.defaults.plugins.tooltip.padding = 10;
    ChartJS.defaults.plugins.tooltip.cornerRadius = 6;

    const dlDark = { color: '#c5cdd8', anchor: 'end' as const, align: 'end' as const, font: { size: 11, weight: 600 } };
    const dlLight = { color: '#5a6a7e', anchor: 'end' as const, align: 'end' as const, font: { size: 11, weight: 600 } };

    function darkScales(yPrefix: string, yMax?: number) {
      return {
        x: {
          grid: { display: false },
          ticks: { color: '#8a9bae', font: { size: 12, weight: 600 } }
        },
        y: {
          grid: { color: gridColor },
          border: { display: false },
          ticks: {
            color: '#8a9bae',
            font: { size: 11 },
            callback: function (v: any) { return yPrefix + v.toLocaleString(); }
          },
          max: yMax || undefined,
          beginAtZero: true
        }
      };
    }

    // Chart 1: Earnings
    if (chartEarningsRef.current) {
      const ctx = chartEarningsRef.current;
      if ((ctx as any).chart) {
        (ctx as any).chart.destroy();
      }
      (ctx as any).chart = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: tierLabels,
          datasets: [{
            label: 'Avg Earnings',
            data: [137780, 94871, 53312, 46631, 32987, 16536],
            backgroundColor: tierColors,
            borderRadius: 4,
            barPercentage: 0.7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.2,
          layout: { padding: { top: 20 } },
          scales: darkScales('$') as any,
          plugins: {
            datalabels: Object.assign({}, dlDark, {
              formatter: function (v: any) { return '$' + (v / 1000).toFixed(0) + 'K'; }
            }),
            tooltip: {
              callbacks: {
                label: function (c: any) { return '$' + c.raw.toLocaleString(); }
              }
            }
          }
        }
      });
    }

    // Chart 2: Win Rate
    if (chartWinRateRef.current) {
      const ctx = chartWinRateRef.current;
      if ((ctx as any).chart) {
        (ctx as any).chart.destroy();
      }
      (ctx as any).chart = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: tierLabels,
          datasets: [{
            label: 'Win %',
            data: [74.2, 74.8, 69.4, 67.5, 57.0, 52.4],
            backgroundColor: tierColors,
            borderRadius: 4,
            barPercentage: 0.7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.4,
          scales: darkScales('', 80) as any,
          plugins: {
            datalabels: Object.assign({}, dlDark, {
              formatter: function (v: any) { return v + '%'; }
            }),
            tooltip: {
              callbacks: {
                label: function (c: any) { return c.raw + '%'; }
              }
            }
          }
        }
      });
    }

    // Chart 3: Black-Type
    if (chartBlackTypeRef.current) {
      const ctx = chartBlackTypeRef.current;
      if ((ctx as any).chart) {
        (ctx as any).chart.destroy();
      }
      (ctx as any).chart = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: tierLabels,
          datasets: [
            {
              label: 'Black-Type %',
              data: [30.7, 16.1, 6.6, 5.1, 2.9, 0.0],
              backgroundColor: tierColors,
              borderRadius: 4,
              barPercentage: 0.7,
              datalabels: { display: true }
            },
            {
              label: 'Stakes Winner %',
              data: [18.7, 13.9, 5.2, 4.1, 2.2, 0],
              backgroundColor: tierColors.map(() => 'rgba(200,150,62,0.5)'),
              borderRadius: 4,
              barPercentage: 0.7,
              datalabels: { display: false }
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.4,
          scales: darkScales('', 35) as any,
          plugins: {
            datalabels: Object.assign({}, dlDark, {
              formatter: function (v: any) { return v > 0 ? v + '%' : ''; },
              font: { size: 10, weight: 600 }
            }),
            legend: { display: true, labels: { color: '#8a9bae', boxWidth: 12, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: function (c: any) { return c.dataset.label + ': ' + c.raw + '%'; }
              }
            }
          }
        }
      });
    }

    // Chart 4: GSW
    if (chartGSWRef.current) {
      const ctx = chartGSWRef.current;
      if ((ctx as any).chart) {
        (ctx as any).chart.destroy();
      }
      (ctx as any).chart = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: tierLabels,
          datasets: [{
            label: 'Graded SW',
            data: [15, 19, 6, 6, 1, 0],
            backgroundColor: tierColors,
            borderRadius: 4,
            barPercentage: 0.7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.3,
          scales: {
            x: { grid: { display: false }, ticks: { color: '#8a9bae', font: { size: 12, weight: 600 } } },
            y: {
              grid: { color: gridColor }, border: { display: false },
              ticks: { color: '#8a9bae', font: { size: 11 }, stepSize: 5 },
              beginAtZero: true, max: 25
            }
          } as any,
          plugins: {
            datalabels: Object.assign({}, dlDark, {
              formatter: function (v: any) { return v > 0 ? v : ''; }
            }),
            tooltip: {
              callbacks: {
                label: function (c: any) { return c.raw + ' Graded Stakes Winner' + (c.raw !== 1 ? 's' : ''); }
              }
            }
          }
        }
      });
    }

    // Chart 5: Decile
    if (chartDecileRef.current) {
      const ctx = chartDecileRef.current;
      if ((ctx as any).chart) {
        (ctx as any).chart.destroy();
      }
      (ctx as any).chart = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: ['Top 10%', '10–20%', '20–30%', '30–40%', '40–50%', '50–60%', '60–70%', '70–80%', '80–90%', 'Btm 10%'],
          datasets: [{
            label: 'Avg Earnings',
            data: [119246, 109146, 60871, 59248, 46413, 49775, 46342, 38312, 47075, 28445],
            backgroundColor: [
              '#2d6a4f', '#2d6a4f',
              '#6aae78', '#6aae78',
              '#bfb350', '#bfb350',
              '#a0a0a0', '#a0a0a0',
              '#c87a5a', '#b83c3c'
            ],
            borderRadius: 4,
            barPercentage: 0.75
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.4,
          scales: {
            x: { grid: { display: false }, ticks: { color: '#8a9bae', font: { size: 11 }, maxRotation: 0 } },
            y: {
              grid: { color: gridColor }, border: { display: false },
              ticks: { color: '#8a9bae', font: { size: 11 }, callback: function (v: any) { return '$' + (v / 1000) + 'K'; } },
              beginAtZero: true
            }
          } as any,
          layout: { padding: { top: 20 } },
          plugins: {
            datalabels: Object.assign({}, dlDark, {
              formatter: function (v: any) { return '$' + (v / 1000).toFixed(0) + 'K'; }
            }),
            tooltip: {
              callbacks: {
                label: function (c: any) { return '$' + c.raw.toLocaleString(); }
              }
            }
          }
        }
      });
    }

    // Chart 6: Alpha (horizontal bar)
    if (chartAlphaRef.current) {
      const ctx = chartAlphaRef.current;
      if ((ctx as any).chart) {
        (ctx as any).chart.destroy();
      }
      const horses = ['Speed King', "Bam's Bliss Kiss", 'Naughty Rascal', 'Starship Impulsive', 'In My Memories', 'Artislas', 'R Morning Brew', 'Mrs Worldwide', 'R Pretty Kitty', 'Powdered Sugar'];
      const earningsData = [830190, 286290, 243975, 218210, 212934, 209500, 188842, 173350, 142693, 135440];
      const salePrices = [100000, 95000, 39000, 50000, 40000, 100000, 30000, 100000, 30000, 95000];

      (ctx as any).chart = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: horses,
          datasets: [
            {
              label: 'Earnings',
              data: earningsData,
              backgroundColor: '#1a2332',
              borderRadius: 4,
              barPercentage: 0.65
            },
            {
              label: 'Sale Price',
              data: salePrices,
              backgroundColor: '#c8963e',
              borderRadius: 4,
              barPercentage: 0.65
            }
          ]
        },
        options: {
          indexAxis: 'y' as const,
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { right: 50 } },
          scales: {
            x: {
              grid: { color: gridColorLight },
              border: { display: false },
              ticks: {
                color: '#5a6a7e', font: { size: 11 },
                callback: function (v: any) { return '$' + (v / 1000) + 'K'; }
              }
            },
            y: {
              grid: { display: false },
              ticks: { color: '#1a2332', font: { size: 13, weight: 600 } }
            }
          } as any,
          plugins: {
            legend: {
              display: true,
              position: 'top' as const,
              labels: { color: '#5a6a7e', boxWidth: 12, font: { size: 12 } }
            },
            datalabels: Object.assign({}, dlLight, {
              anchor: 'end' as const, align: 'right' as const,
              formatter: function (v: any) { return '$' + (v / 1000).toFixed(0) + 'K'; },
              font: { size: 10, weight: 600 }
            }),
            tooltip: {
              callbacks: {
                label: function (c: any) { return c.dataset.label + ': $' + c.raw.toLocaleString(); }
              }
            }
          }
        }
      });
    }

    return () => {
      // Cleanup on unmount
      [chartEarningsRef, chartWinRateRef, chartBlackTypeRef, chartGSWRef, chartDecileRef, chartAlphaRef].forEach(ref => {
        if (ref.current && (ref.current as any).chart) {
          (ref.current as any).chart.destroy();
        }
      });
    };
  }, []);

  return (
    <>
      {/* Earnings Chart */}
      <div className="chart-section">
        <div className="chart-card chart-card-wide">
          <h3 className="chart-title">Average Earnings by Tier</h3>
          <p className="chart-subtitle">ELITE horses earned $137,780 on average — 8.3x the $16,536 earned by WEAK.</p>
          <div className="chart-wrap">
            <canvas ref={chartEarningsRef} id="chartEarnings"></canvas>
          </div>
        </div>
      </div>

      {/* Win Rate + Black-Type Charts */}
      <div className="chart-section chart-section-duo">
        <div className="chart-card">
          <h3 className="chart-title">Race Winner Rate</h3>
          <p className="chart-subtitle">Percentage of starters that won at least one race.</p>
          <div className="chart-wrap">
            <canvas ref={chartWinRateRef} id="chartWinRate"></canvas>
          </div>
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Black-Type Rate</h3>
          <p className="chart-subtitle">Stakes-quality performance drops from 31% (ELITE) to 0% (WEAK).</p>
          <div className="chart-wrap">
            <canvas ref={chartBlackTypeRef} id="chartBlackType"></canvas>
          </div>
        </div>
      </div>

      {/* Graded Stakes Winners Chart */}
      <div className="chart-section">
        <div className="chart-card chart-card-wide">
          <h3 className="chart-title">Where Did the Graded Stakes Winners Come From?</h3>
          <p className="chart-subtitle">34 of 47 Graded Stakes Winners came from our top two tiers. Just 1 from BELOW AVG or WEAK.</p>
          <div className="chart-section-duo chart-inner-duo">
            <div className="chart-wrap">
              <canvas ref={chartGSWRef} id="chartGSW"></canvas>
            </div>
            <div className="gsw-callout">
              <div className="gsw-big">34<span className="gsw-of">/47</span></div>
              <p>Graded Stakes Winners from ELITE + STRONG</p>
              <div className="gsw-detail">
                <span>15 ELITE</span>
                <span>19 STRONG</span>
                <span>6 ABOVE AVG</span>
                <span>6 AVERAGE</span>
                <span>1 BELOW AVG</span>
              </div>
              <p className="gsw-note">These two tiers represent only 24% of the population but produced 72% of the graded stakes winners.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Decile Chart */}
      <div className="chart-section">
        <div className="chart-card chart-card-wide">
          <h3 className="chart-title">Earnings by Score Decile</h3>
          <p className="chart-subtitle">Horses binned into deciles by algorithm score. The top decile averaged $119K with 25 stakes winners.</p>
          <div className="chart-wrap">
            <canvas ref={chartDecileRef} id="chartDecile"></canvas>
          </div>
        </div>
      </div>

      {/* Alpha Chart (horizontal bar) */}
      <div className="chart-card chart-card-light">
        <div className="chart-wrap chart-wrap-tall">
          <canvas ref={chartAlphaRef} id="chartAlpha"></canvas>
        </div>
      </div>
    </>
  );
}
