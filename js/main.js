(function () {
  const navbar = document.getElementById('navbar');
  const flyingLogo = document.getElementById('flyingLogo');
  const logoImg = flyingLogo.querySelector('img');
  const heroCtaBtn = document.getElementById('heroCtaBtn');
  const heroScrollBtn = document.getElementById('heroScrollBtn');
  const heroNav = document.getElementById('heroNav');

  const LOGO_ASPECT = 3.33;

  let ticking = false;
  let heroLogoHeight = 245;
  let navLogoHeight = 77;
  let navHeight = 130;

  function readCssVarLength(varName) {
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;height:var(${varName})`;
    document.body.appendChild(probe);
    const height = probe.getBoundingClientRect().height;
    document.body.removeChild(probe);
    return height;
  }

  function getNavEdgeX() {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;width:var(--nav-edge-x)';
    document.body.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    document.body.removeChild(probe);
    return width;
  }

  function measureSizes() {
    heroLogoHeight = readCssVarLength('--hero-logo-height');
    navLogoHeight = readCssVarLength('--nav-logo-height');
    navHeight = readCssVarLength('--nav-height');
  }

  function getLogoWidth(logoHeight) {
    const measured = flyingLogo.getBoundingClientRect().width;
    if (measured > 0) return measured;

    if (logoImg.naturalWidth && logoImg.naturalHeight) {
      return logoHeight * (logoImg.naturalWidth / logoImg.naturalHeight);
    }

    return logoHeight * LOGO_ASPECT;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function setLogoPosition(progress, logoHeight, top) {
    const isMobile = window.innerWidth <= 768;

    flyingLogo.style.height = `${logoHeight}px`;
    flyingLogo.style.top = `${top}px`;

    if (!isMobile || progress < 0.01) {
      flyingLogo.style.left = '50%';
      flyingLogo.style.right = 'auto';
      flyingLogo.style.transform = 'translate(-50%, -50%)';
      return;
    }

    const logoWidth = getLogoWidth(logoHeight);
    const edgeX = getNavEdgeX();
    const startLeft = window.innerWidth / 2 - logoWidth / 2;
    const endLeft = window.innerWidth - edgeX - logoWidth;
    const left = Math.round(startLeft + (endLeft - startLeft) * progress);

    flyingLogo.style.left = `${left}px`;
    flyingLogo.style.right = 'auto';
    flyingLogo.style.transform = 'translateY(-50%)';
  }

  function updateFlyingLogo() {
    const scrollY = window.scrollY;
    const isMobile = window.innerWidth <= 768;
    const scrollRange = Math.max(window.innerHeight * (isMobile ? 0.45 : 0.55), isMobile ? 220 : 280);
    const rawProgress = Math.min(scrollY / scrollRange, 1);
    const progress = easeOutCubic(rawProgress);
    const uiProgress = smoothstep(0.28, 0.72, progress);

    const logoHeight = heroLogoHeight + (navLogoHeight - heroLogoHeight) * progress;
    const startTop = window.innerHeight * (isMobile ? 0.46 : 0.5);
    const endTop = navHeight * 0.5;
    const top = startTop + (endTop - startTop) * progress;

    setLogoPosition(progress, logoHeight, top);

    navbar.style.opacity = String(uiProgress);
    navbar.style.transform = `translateY(${(uiProgress - 1) * 100}%)`;

    const isNavActive = uiProgress >= 0.92;
    navbar.style.pointerEvents = isNavActive ? 'auto' : 'none';
    navbar.setAttribute('aria-hidden', isNavActive ? 'false' : 'true');
    navbar.classList.toggle('navbar--scrolled', scrollY > 20 && isNavActive);

    const heroUiOpacity = 1 - uiProgress;

    heroNav.style.opacity = String(heroUiOpacity);
    heroNav.style.pointerEvents = heroUiOpacity > 0.5 ? 'auto' : 'none';

    const heroCtaGap = isMobile ? (window.innerWidth <= 480 ? 36 : 52) : 88;
    const logoBottom = top + logoHeight / 2;
    heroCtaBtn.style.top = `${logoBottom + heroCtaGap}px`;
    heroCtaBtn.style.opacity = String(heroUiOpacity);
    heroCtaBtn.style.pointerEvents = heroUiOpacity > 0.5 ? 'auto' : 'none';

    heroScrollBtn.style.opacity = String(heroUiOpacity);
    heroScrollBtn.style.pointerEvents = heroUiOpacity > 0.5 ? 'auto' : 'none';

    ticking = false;
  }

  function scheduleUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateFlyingLogo);
    }
  }

  measureSizes();
  updateFlyingLogo();

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', () => {
    measureSizes();
    updateFlyingLogo();
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      measureSizes();
      updateFlyingLogo();
    }, 100);
  });

  if (logoImg.complete) {
    requestAnimationFrame(updateFlyingLogo);
  } else {
    logoImg.addEventListener('load', updateFlyingLogo, { once: true });
  }

  window.addEventListener('load', () => {
    measureSizes();
    updateFlyingLogo();
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document
    .querySelectorAll('.work-card, .review-card, .team-card, .location-card, .contact__map')
    .forEach((el) => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
})();
