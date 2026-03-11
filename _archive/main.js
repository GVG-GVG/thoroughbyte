(function () {
  /* ===== NAV ===== */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('mobileToggle');
  var links = document.querySelector('.nav-links');

  function checkScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
      });
    });
  }

  /* ===== BACK TO TOP ===== */
  var btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', function () {
      btt.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===== SMOOTH SCROLL ===== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
      }
    });
  });

  /* ===== CONTACT FORM ===== */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Submitted — We\'ll be in touch';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    });
  }

  /* ===== CHART.JS GLOBALS ===== */
  if (typeof Chart === 'undefined') return;
  if (typeof ChartDataLabels !== 'undefined') Chart.register(ChartDataLabels);

  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = '#8a9bae';
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.plugins.tooltip.backgroundColor = '#1a2332';
  Chart.defaults.plugins.tooltip.titleFont = { size: 13, weight: 600 };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 6;

  /* Reusable datalabel presets */
  var dlDark = { color: '#c5cdd8', anchor: 'end', align: 'end', font: { size: 11, weight: 600 } };
  var dlLight = { color: '#5a6a7e', anchor: 'end', align: 'end', font: { size: 11, weight: 600 } };

  var tierLabels = ['ELITE', 'STRONG', 'ABOVE AVG', 'AVERAGE', 'BELOW AVG', 'WEAK'];
  var tierColors = ['#2d6a4f', '#6aae78', '#bfb350', '#a0a0a0', '#c87a5a', '#b83c3c'];
  var gridColor = 'rgba(255,255,255,0.06)';
  var gridColorLight = 'rgba(26,35,50,0.08)';

  function darkScales(yPrefix, yMax) {
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
          callback: function (v) { return yPrefix + v.toLocaleString(); }
        },
        max: yMax || undefined,
        beginAtZero: true
      }
    };
  }

  /* ===== EARNINGS BAR ===== */
  var ctxE = document.getElementById('chartEarnings');
  if (ctxE) {
    new Chart(ctxE, {
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
        scales: darkScales('$'),
        plugins: {
          datalabels: Object.assign({}, dlDark, {
            formatter: function (v) { return '$' + (v / 1000).toFixed(0) + 'K'; }
          }),
          tooltip: {
            callbacks: {
              label: function (c) { return '$' + c.raw.toLocaleString(); }
            }
          }
        }
      }
    });
  }

  /* ===== WIN RATE ===== */
  var ctxW = document.getElementById('chartWinRate');
  if (ctxW) {
    new Chart(ctxW, {
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
        scales: darkScales('', 80),
        plugins: {
          datalabels: Object.assign({}, dlDark, {
            formatter: function (v) { return v + '%'; }
          }),
          tooltip: {
            callbacks: {
              label: function (c) { return c.raw + '%'; }
            }
          }
        }
      }
    });
  }

  /* ===== BLACK-TYPE RATE ===== */
  var ctxB = document.getElementById('chartBlackType');
  if (ctxB) {
    new Chart(ctxB, {
      type: 'bar',
      data: {
        labels: tierLabels,
        datasets: [
          {
            label: 'Black-Type %',
            data: [30.7, 16.1, 6.6, 5.1, 2.9, 0.0],
            backgroundColor: tierColors.map(function (c) { return c; }),
            borderRadius: 4,
            barPercentage: 0.7,
            datalabels: { display: true }
          },
          {
            label: 'Stakes Winner %',
            data: [18.7, 13.9, 5.2, 4.1, 2.2, 0],
            backgroundColor: tierColors.map(function () { return 'rgba(200,150,62,0.5)'; }),
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
        scales: darkScales('', 35),
        plugins: {
          datalabels: Object.assign({}, dlDark, {
            formatter: function (v) { return v > 0 ? v + '%' : ''; },
            font: { size: 10, weight: 600 }
          }),
          legend: { display: true, labels: { color: '#8a9bae', boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: function (c) { return c.dataset.label + ': ' + c.raw + '%'; }
            }
          }
        }
      }
    });
  }

  /* ===== GSW BAR ===== */
  var ctxG = document.getElementById('chartGSW');
  if (ctxG) {
    new Chart(ctxG, {
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
        },
        plugins: {
          datalabels: Object.assign({}, dlDark, {
            formatter: function (v) { return v > 0 ? v : ''; }
          }),
          tooltip: {
            callbacks: {
              label: function (c) { return c.raw + ' Graded Stakes Winner' + (c.raw !== 1 ? 's' : ''); }
            }
          }
        }
      }
    });
  }

  /* ===== SCORE DECILE ===== */
  var ctxD = document.getElementById('chartDecile');
  if (ctxD) {
    new Chart(ctxD, {
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
            ticks: { color: '#8a9bae', font: { size: 11 }, callback: function (v) { return '$' + (v / 1000) + 'K'; } },
            beginAtZero: true
          }
        },
        layout: { padding: { top: 20 } },
        plugins: {
          datalabels: Object.assign({}, dlDark, {
            formatter: function (v) { return '$' + (v / 1000).toFixed(0) + 'K'; }
          }),
          tooltip: {
            callbacks: {
              label: function (c) { return '$' + c.raw.toLocaleString(); }
            }
          }
        }
      }
    });
  }

  /* ===== ALPHA HORIZONTAL BAR ===== */
  var ctxA = document.getElementById('chartAlpha');
  if (ctxA) {
    var horses = ['Speed King', "Bam's Bliss Kiss", 'Naughty Rascal', 'Starship Impulsive', 'In My Memories', 'Artislas', 'R Morning Brew', 'Mrs Worldwide', 'R Pretty Kitty', 'Powdered Sugar'];
    var earningsData = [830190, 286290, 243975, 218210, 212934, 209500, 188842, 173350, 142693, 135440];
    var salePrices = [100000, 95000, 39000, 50000, 40000, 100000, 30000, 100000, 30000, 95000];

    new Chart(ctxA, {
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
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 50 } },
        scales: {
          x: {
            grid: { color: gridColorLight },
            border: { display: false },
            ticks: {
              color: '#5a6a7e', font: { size: 11 },
              callback: function (v) { return '$' + (v / 1000) + 'K'; }
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#1a2332', font: { size: 13, weight: 600 } }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { color: '#5a6a7e', boxWidth: 12, font: { size: 12 } }
          },
          datalabels: Object.assign({}, dlLight, {
            anchor: 'end', align: 'right',
            formatter: function (v) { return '$' + (v / 1000).toFixed(0) + 'K'; },
            font: { size: 10, weight: 600 }
          }),
          tooltip: {
            callbacks: {
              label: function (c) { return c.dataset.label + ': $' + c.raw.toLocaleString(); }
            }
          }
        }
      }
    });
  }

  /* ===== FADE-IN ON SCROLL ===== */
  var faders = document.querySelectorAll('.chart-card, .feature, .proof-stat, .how-step, .misses-table-wrap');
  if ('IntersectionObserver' in window) {
    faders.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    faders.forEach(function (el) { observer.observe(el); });
  }
})();
