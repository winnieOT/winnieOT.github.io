/* =============================================
   main.js — Navigation, scroll behaviour, utilities
   ============================================= */

(function () {
  'use strict';

  // ── Active nav link ──────────────────────────────────────────
  const normalizePath = (path) => path.replace(/\/+$/, '') || '/';
  const currentPath = normalizePath(window.location.pathname);

  document.querySelectorAll('.nav-link').forEach(link => {
    const href = normalizePath(link.getAttribute('href') || '');
    if (href === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // ── Sticky header shadow on scroll ──────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile menu toggle ───────────────────────────────────────
  const toggle  = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (toggle && navMenu) {
    const openMenu = () => {
      navMenu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      // Focus first nav link
      const firstLink = navMenu.querySelector('.nav-link');
      if (firstLink) firstLink.focus();
    };
    const closeMenu = () => {
      navMenu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    // Close on nav link click (mobile)
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (navMenu.classList.contains('is-open') &&
          !navMenu.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  // ── Back-to-top button ───────────────────────────────────────
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Smooth scroll for anchor links ──────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    });
  });

  // ── Carousel ─────────────────────────────────────────────────
  function initCarousel(el) {
    const track         = el.querySelector('.carousel-track');
    const cards         = Array.from(track.querySelectorAll('.card'));
    const prevBtn       = el.querySelector('.carousel-btn--prev');
    const nextBtn       = el.querySelector('.carousel-btn--next');
    const dotsContainer = el.querySelector('.carousel-dots');
    let currentIndex    = 0;

    function slidesVisible() {
      const viewport = el.querySelector('.carousel-viewport');
      const w = viewport ? viewport.offsetWidth : el.offsetWidth;
      if (w >= 700) return 3;
      if (w >= 400) return 2;
      return 1;
    }

    function maxIndex() {
      return Math.max(0, cards.length - slidesVisible());
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      for (let i = 0; i <= maxIndex(); i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.setAttribute('role', 'listitem');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function goTo(index) {
      const max = maxIndex();
      if (index > max) index = 0;
      if (index < 0)   index = max;
      currentIndex = index;
      const gap       = parseFloat(getComputedStyle(track).gap) || 24;
      const cardWidth = cards[0].offsetWidth + gap;
      track.style.transform = `translateX(${-currentIndex * cardWidth}px)`;
      dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildDots();
        goTo(Math.min(currentIndex, maxIndex()));
      }, 150);
    }, { passive: true });

    buildDots();
    goTo(0);
  }

  document.querySelectorAll('.carousel').forEach(initCarousel);

})();
