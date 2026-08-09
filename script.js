/**
 * Portfolio interactivity — vanilla JS, no dependencies.
 * - mobile nav toggle
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
     Case study sort control
     Clicking a filter button reorders .case-card elements in place —
     matching cards move to the top, non-matching stay put below, nothing
     is hidden or unmounted. Uses the FLIP technique (First-Last-Invert-Play)
     so the reorder reads as a smooth shuffle instead of a layout jump.
     --------------------------------------------------------------- */
  var caseFilter = document.querySelector('.case-filter');
  var caseList = document.querySelector('.case-list');

  if (caseFilter && caseList) {
    var filterButtons = Array.prototype.slice.call(caseFilter.querySelectorAll('.filter-btn'));
    var caseCards = Array.prototype.slice.call(caseList.querySelectorAll('.case-card'));

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (button.getAttribute('aria-pressed') === 'true') return;

        filterButtons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        button.setAttribute('aria-pressed', 'true');

        sortCaseCards(button.getAttribute('data-filter'));
      });
    });

    function sortCaseCards(filter) {
      // FIRST: record current positions
      var firstRects = caseCards.map(function (card) { return card.getBoundingClientRect(); });

      // reorder the DOM: matches first (stable order), then the rest (stable order)
      var ordered = caseCards;
      if (filter !== 'all') {
        var matching = [];
        var rest = [];
        caseCards.forEach(function (card) {
          var categories = (card.getAttribute('data-categories') || '').split(/\s+/);
          (categories.indexOf(filter) !== -1 ? matching : rest).push(card);
        });
        ordered = matching.concat(rest);
      }
      ordered.forEach(function (card) { caseList.appendChild(card); });

      if (prefersReducedMotion) return;

      // LAST + INVERT + PLAY
      ordered.forEach(function (card, i) {
        var firstRect = firstRects[caseCards.indexOf(card)];
        var lastRect = card.getBoundingClientRect();
        var dx = firstRect.left - lastRect.left;
        var dy = firstRect.top - lastRect.top;
        if (!dx && !dy) return;

        card.style.transition = 'none';
        card.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
        // eslint-disable-next-line no-unused-expressions
        card.getBoundingClientRect(); // force reflow so the transform above applies before animating
        card.style.transition = 'transform 420ms var(--ease)';
        card.style.transform = '';

        card.addEventListener('transitionend', function handler() {
          card.style.transition = '';
          card.removeEventListener('transitionend', handler);
        });
      });
    }
  }

  /* ---------------------------------------------------------------
     Footer year
     --------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
