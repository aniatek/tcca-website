document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  const dropdownItems = document.querySelectorAll('.has-dropdown');
  const isDesktop = () => window.innerWidth >= 768;

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
});
