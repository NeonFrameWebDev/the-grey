(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===========================
     LOADER
  =========================== */
  const loader = document.getElementById('loader');
  if (loader) {
    const done = () => loader.classList.add('is-done');
    window.addEventListener('load', () => setTimeout(done, prefersReduced ? 100 : 1200));
    // Safety fallback
    setTimeout(done, 3000);
  }

  /* ===========================
     NAV SCROLL STATE
  =========================== */
  const nav = document.getElementById('nav');
  if (nav) {
    const setNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 80);
    setNav();
    window.addEventListener('scroll', setNav, { passive: true });
  }

  /* ===========================
     MOBILE MENU
  =========================== */
  const navBurger  = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');

  if (navBurger && mobileMenu) {
    const openMenu = () => {
      mobileMenu.classList.add('is-open');
      mobileMenu.removeAttribute('inert');
      navBurger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('inert', '');
      navBurger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    navBurger.addEventListener('click', openMenu);
    mobileMenuClose && mobileMenuClose.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ===========================
     SMOOTH SCROLL (anchor links)
  =========================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReduced ? 'instant' : 'smooth' });
    });
  });

  /* ===========================
     HERO PARALLAX (desktop only)
  =========================== */
  const heroImg = document.querySelector('.hero__img');
  const isMobile = window.matchMedia('(max-width: 768px), (hover: none)').matches;

  if (heroImg && !prefersReduced && !isMobile) {
    const onHeroScroll = () => {
      const y = Math.min(window.scrollY, 800) * 0.18;
      // translate up (negative) so building seems stationary
      heroImg.style.transform = `scale(1.06) translate3d(0, ${-y}px, 0)`;
    };
    onHeroScroll();
    window.addEventListener('scroll', onHeroScroll, { passive: true });
  }

  /* ===========================
     SCROLL REVEAL (IntersectionObserver)
  =========================== */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  }

  /* ===========================
     GALLERY LIGHTBOX
  =========================== */
  const galleryItems = document.querySelectorAll('.gallery__item');
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  let lastFocused = null;

  const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.src = '';
    lightboxImg.alt = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  galleryItems.forEach(item => {
    const src = item.dataset.src || item.querySelector('img')?.src;
    const alt = item.dataset.alt || item.querySelector('img')?.alt || '';

    item.addEventListener('click', () => openLightbox(src, alt));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(src, alt);
      }
    });
    // Make items keyboard focusable
    if (!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '0');
  });

  lightboxClose && lightboxClose.addEventListener('click', closeLightbox);

  lightbox && lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (lightbox && !lightbox.hidden && e.key === 'Escape') closeLightbox();
  });

  // Touch swipe to close lightbox
  if (lightbox) {
    let touchStartY = 0;
    lightbox.addEventListener('touchstart', e => { touchStartY = e.changedTouches[0].clientY; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      const delta = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (delta > 60) closeLightbox();
    }, { passive: true });
  }

})();
