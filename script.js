/**
 * UpscaleQ — Main Script
 * Vanilla JS · No dependencies
 * Features: sticky nav, mobile menu, scroll reveal,
 *           number counters, course filters
 */

'use strict';

/* ─────────────────────────────────────────
   1. STICKY NAV — adds .scrolled class
   ───────────────────────────────────────── */
(function initStickyNav() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  const onScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ─────────────────────────────────────────
   2. MOBILE MENU TOGGLE
   ───────────────────────────────────────── */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('navDrawer');
  if (!hamburger || !drawer) return;

  const toggle = () => {
    const isOpen = drawer.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    // Prevent body scroll when menu open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggle);

  // Close drawer when a link inside it is clicked
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggle();
    }
  });
})();


/* ─────────────────────────────────────────
   3. SCROLL REVEAL (Intersection Observer)
   Skips hero elements — those use CSS animation
   ───────────────────────────────────────── */
(function initScrollReveal() {
  const heroSection = document.querySelector('.hero');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  // Observe all .reveal elements OUTSIDE the hero
  document.querySelectorAll('.reveal').forEach(el => {
    // Hero elements are handled by CSS keyframe animations
    if (heroSection && heroSection.contains(el)) return;
    observer.observe(el);
  });

  // Stagger cards inside grids when their parent grid scrolls in
  document.querySelectorAll('.courses-grid, .mentors-grid, .testimonials-grid, .partners-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.reveal');
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.08}s`;
    });
  });
})();


/* ─────────────────────────────────────────
   4. ANIMATED NUMBER COUNTER
   Triggers when stats bar enters viewport
   ───────────────────────────────────────── */
(function initCounters() {
  const DURATION = 1800; // ms
  const EASING = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.target, 10);
    const start    = performance.now();

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased    = EASING(progress);
      const current  = Math.round(eased * target);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(step);
  };

  const statsBar = document.querySelector('.stats-bar');
  if (!statsBar) return;

  let hasRun = false;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !hasRun) {
        hasRun = true;
        statsBar.querySelectorAll('[data-target]').forEach(animateCounter);
        observer.disconnect();
      }
    },
    { threshold: 0.4 }
  );

  observer.observe(statsBar);
})();


/* ─────────────────────────────────────────
   5. COURSE FILTER TABS
   ───────────────────────────────────────── */
(function initCourseFilters() {
  const tabs  = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.course-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      // Update active tab
      tabs.forEach(t => t.classList.remove('filter-tab--active'));
      tab.classList.add('filter-tab--active');

      // Show / hide cards with a smooth fade
      cards.forEach(card => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;

        if (show) {
          card.classList.remove('hidden');
          // Re-trigger reveal animation
          requestAnimationFrame(() => {
            card.classList.add('revealed');
          });
        } else {
          card.classList.add('hidden');
          card.classList.remove('revealed');
        }
      });
    });
  });
})();


/* ─────────────────────────────────────────
   6. ACTIVE NAV LINK HIGHLIGHT
   Highlights nav link for visible section
   ───────────────────────────────────────── */
(function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle(
              'nav__link--active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
  );

  sections.forEach(s => observer.observe(s));
})();


/* ─────────────────────────────────────────
   7. SMOOTH HOVER PARALLAX on float cards
   Subtle parallax following mouse in hero
   ───────────────────────────────────────── */
(function initFloatParallax() {
  const hero      = document.querySelector('.hero');
  const floatWrap = document.querySelector('.hero__float-wrap');
  if (!hero || !floatWrap) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx   = rect.width / 2;
    const cy   = rect.height / 2;
    const dx   = (e.clientX - rect.left - cx) / cx;
    const dy   = (e.clientY - rect.top  - cy) / cy;

    const cards = floatWrap.querySelectorAll('.float-card');
    cards.forEach((card, i) => {
      const factor = (i + 1) * 5;
      card.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  });

  hero.addEventListener('mouseleave', () => {
    floatWrap.querySelectorAll('.float-card').forEach(card => {
      card.style.transform = '';
    });
  });
})();
