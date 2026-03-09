/* ===== NAV SCROLL ===== */
(function () {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('mobileToggle');
  const links = document.querySelector('.nav-links');

  // Solid nav on scroll
  function checkScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();

  // Mobile menu
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    // Close on link click
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  /* ===== SMOOTH ANCHOR OFFSET ===== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: y, behavior: 'smooth' });
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

  /* ===== FADE-IN ON SCROLL ===== */
  var faders = document.querySelectorAll('.step, .result-card, .feature, .stat-card');
  if ('IntersectionObserver' in window) {
    faders.forEach(function (el) { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.5s ease, transform 0.5s ease'; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    faders.forEach(function (el) { observer.observe(el); });
  }
})();
