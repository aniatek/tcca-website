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
});
