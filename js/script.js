document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  const dropdownItems = document.querySelectorAll('.has-dropdown');
  const isDesktop = () => window.innerWidth >= 768;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const closeAllDropdowns = () => {
    dropdownItems.forEach((dd) => {
      dd.classList.remove('open');
      const anchor = dd.querySelector(':scope > a');
      if (anchor) {
        anchor.setAttribute('aria-expanded', 'false');
      }
    });
  };

  if (toggle && nav) {
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(nav.classList.contains('open')));
      if (!nav.classList.contains('open')) {
        closeAllDropdowns();
      }
    });
  }

  const dropdownLinks = document.querySelectorAll('.has-dropdown > a');

  dropdownLinks.forEach((link) => {
    link.setAttribute('aria-expanded', 'false');
    const parent = link.parentElement;

    link.addEventListener('click', function (e) {
      const href = (this.getAttribute('href') || '').trim();
      const isTriggerOnly = href === '#' || href === '';

      if (isTriggerOnly || !isDesktop()) {
        e.preventDefault();
      }
      e.stopPropagation();

      const isOpen = parent.classList.contains('open');
      closeAllDropdowns();

      if (!isOpen) {
        parent.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
    });

    parent.addEventListener('mouseenter', () => {
      if (!isDesktop()) {
        return;
      }
      closeAllDropdowns();
      parent.classList.add('open');
      link.setAttribute('aria-expanded', 'true');
    });

    parent.addEventListener('mouseleave', () => {
      if (!isDesktop()) {
        return;
      }
      parent.classList.remove('open');
      link.setAttribute('aria-expanded', 'false');
    });

    parent.addEventListener('focusin', () => {
      closeAllDropdowns();
      parent.classList.add('open');
      link.setAttribute('aria-expanded', 'true');
    });

    parent.addEventListener('focusout', (e) => {
      const nextFocused = e.relatedTarget;
      if (nextFocused && parent.contains(nextFocused)) {
        return;
      }
      parent.classList.remove('open');
      link.setAttribute('aria-expanded', 'false');
    });

    link.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        this.click();
      }
    });
  });

  document.addEventListener('click', function (e) {
    const clickedInsideDropdown = e.target.closest('.has-dropdown');
    const clickedNavToggle = e.target.closest('.nav-toggle');

    if (!clickedInsideDropdown && !clickedNavToggle) {
      closeAllDropdowns();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllDropdowns();
      if (nav && nav.classList.contains('open') && toggle) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const desktop = window.innerWidth >= 768;
      if (desktop && nav) {
        nav.classList.remove('open');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
        }
      }
      closeAllDropdowns();
    }, 200);
  });

  const header = document.querySelector('.site-header');
  if (header) {
    let ticking = false;
    const updateHeaderProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      header.style.setProperty('--scroll-progress', progress.toFixed(4));
      header.classList.toggle('is-scrolled', scrollTop > 8);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      if (prefersReducedMotion) {
        updateHeaderProgress();
      } else {
        window.requestAnimationFrame(updateHeaderProgress);
      }
    };

    updateHeaderProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  const currentPage = (document.body.dataset.page || '').trim();
  const pageFile = currentPage ? `${currentPage}.html` : '';

  if (currentPage) {
    document.querySelectorAll('.main-nav a').forEach((link) => {
      const href = (link.getAttribute('href') || '').trim();
      if (!href || href === '#') {
        return;
      }

      const isExactMatch = href === pageFile;
      const isLegacyMatch = href.includes(currentPage);
      if (isExactMatch || isLegacyMatch) {
        link.classList.add('active');
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') {
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const revealSelectors = [
    'main h1',
    'main h2',
    'main h3',
    'main h4',
    'main h5',
    'main h6',
    'main p',
    'main li',
    'main .section-title',
    'main .section-subtitle',
    'main .text-muted',
    'main .btn',
    'main .card-link-text'
  ];

  const revealTargets = Array.from(document.querySelectorAll(revealSelectors.join(',')));
  if (revealTargets.length) {
    revealTargets.forEach((el, index) => {
      el.classList.add('reveal-text');
      const delayStep = (index % 6) * 70;
      el.style.transitionDelay = `${Math.min(delayStep, 350)}ms`;
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
      );

      revealTargets.forEach((el) => observer.observe(el));
    }
  }

  const isHome = document.body.classList.contains('home');
  const carousel = document.querySelector('.hero-carousel');
  if (isHome && carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    if (slides.length > 1) {
      let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
      if (currentIndex < 0) {
        currentIndex = 0;
        slides[0].classList.add('is-active');
      }

      if (!prefersReducedMotion) {
        setInterval(() => {
          slides[currentIndex].classList.remove('is-active');
          currentIndex = (currentIndex + 1) % slides.length;
          slides[currentIndex].classList.add('is-active');
        }, 5200);
      }
    }
  }

  const travelMap = document.querySelector('#travel-route-map');
  const routeChips = Array.from(document.querySelectorAll('[data-route-country]'));
  const routeStatus = document.querySelector('#travel-route-status');

  if (travelMap && routeChips.length) {
    const frameWrap = travelMap.closest('.map-frame-wrap');
    const routeStops = {
      australia: {
        label: 'Australia',
        origin: 'Australia',
        countryView: { q: '-25.2744,133.7751', z: 4 }
      },
      hong_kong: {
        label: 'Hong Kong',
        origin: 'Hong Kong',
        countryView: { q: '22.3193,114.1694', z: 7 }
      },
      singapore: {
        label: 'Singapore',
        origin: 'Singapore',
        countryView: { q: '1.3521,103.8198', z: 8 }
      },
      new_zealand: {
        label: 'New Zealand',
        origin: 'New Zealand',
        countryView: { q: '-40.9006,174.8860', z: 5 }
      },
      china: {
        label: 'China',
        origin: 'China',
        countryView: { q: '35.8617,104.1954', z: 4 }
      }
    };

    let routeTimer;

    const setMapSrc = (src) => {
      if (frameWrap) {
        frameWrap.classList.add('is-transitioning');
      }
      window.setTimeout(() => {
        travelMap.src = src;
        if (frameWrap) {
          window.setTimeout(() => frameWrap.classList.remove('is-transitioning'), 220);
        }
      }, 120);
    };

    const getLocationMapSrc = (step) =>
      `https://maps.google.com/maps?q=${encodeURIComponent(step.q)}&z=${step.z}&output=embed`;

    const getRouteMapSrc = (originLabel) =>
      `https://maps.google.com/maps?output=embed&saddr=${encodeURIComponent(originLabel)}&daddr=${encodeURIComponent('Papua New Guinea')}+to:${encodeURIComponent('Port Moresby Papua New Guinea')}+to:${encodeURIComponent('East New Britain Papua New Guinea')}+to:${encodeURIComponent('Tavolo Papua New Guinea')}`;

    const playRoute = (countryKey) => {
      const route = routeStops[countryKey];
      if (!route) {
        return;
      }

      routeChips.forEach((chip) => {
        chip.classList.toggle('is-active', chip.dataset.routeCountry === countryKey);
      });

      if (routeStatus) {
        routeStatus.textContent = `${route.label} -> Papua New Guinea -> Port Moresby -> East New Britain -> Tavolo`;
      }

      if (routeTimer) {
        window.clearTimeout(routeTimer);
      }

      setMapSrc(getLocationMapSrc(route.countryView));
      routeTimer = window.setTimeout(() => {
        setMapSrc(getRouteMapSrc(route.origin));
      }, 1600);
    };

    routeChips.forEach((chip) => {
      chip.addEventListener('click', (event) => {
        event.preventDefault();
        playRoute(chip.dataset.routeCountry);
      });
    });

    playRoute('australia');
  }

  const homePopup = document.querySelector('#home-popup');
  if (homePopup && document.body.classList.contains('home')) {
    const closePopup = () => {
      homePopup.setAttribute('hidden', '');
    };

    const openPopup = () => {
      homePopup.removeAttribute('hidden');
    };

    homePopup.querySelectorAll('[data-popup-close]').forEach((node) => {
      node.addEventListener('click', closePopup);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !homePopup.hasAttribute('hidden')) {
        closePopup();
      }
    });

    window.setTimeout(openPopup, 500);
  }
});
