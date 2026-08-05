/**
 * Portfolio interactivity — vanilla JS, no dependencies.
 * - mobile nav toggle
 * - blueprint grid overlay toggle (signature interaction)
 * - live cursor coordinate readout (desktop only)
 * - scroll-triggered reveal animations
 * - sticky header shadow / active nav link
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     Mobile nav
     --------------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navMobile.classList.toggle('is-open', !isOpen);
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });

    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navMobile.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------------------------------------------------------
     Blueprint grid overlay toggle
     --------------------------------------------------------------- */
  var gridToggle = document.getElementById('gridToggle');
  var gridOverlay = document.getElementById('gridOverlay');

  if (gridToggle && gridOverlay) {
    gridToggle.addEventListener('click', function () {
      var isVisible = gridOverlay.classList.toggle('is-visible');
      gridToggle.setAttribute('aria-pressed', String(isVisible));
    });
  }

  /* ---------------------------------------------------------------
     Live coordinate readout — mirrors a design tool's inspector panel.
     Purely cosmetic; hidden from assistive tech and disabled when the
     user prefers reduced motion.
     --------------------------------------------------------------- */
  var coordReadout = document.getElementById('coordReadout');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (coordReadout && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    var raf = null;
    window.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var x = String(e.clientX).padStart(4, '0');
        var y = String(e.clientY).padStart(4, '0');
        coordReadout.textContent = 'X ' + x + ' / Y ' + y;
        raf = null;
      });
    });
  }

  /* ---------------------------------------------------------------
     Scroll-triggered reveal
     --------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------
     Active nav link on scroll
     --------------------------------------------------------------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-desktop a');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              var match = link.getAttribute('href') === '#' + id;
              link.style.color = match ? 'var(--c-ink)' : '';
            });
          }
        });
      },
      { threshold: 0, rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------------------------------------------------------
     Footer year
     --------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
