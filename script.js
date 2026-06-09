document.addEventListener('DOMContentLoaded', () => {

  const WEDDING_DATE = new Date('2026-09-15T15:00:00');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================
  // ENVELOPE: TAP-TO-OPEN + SCROLL REVERSE
  // ============================
  const envelopeSection = document.getElementById('envelope-section');
  const envelope = document.getElementById('envelope');
  const seal = document.getElementById('wax-seal');
  const card = document.getElementById('invitation-card');
  const scrollHint = document.getElementById('scroll-hint');
  const nav = document.getElementById('nav');
  const openPrompt = document.getElementById('open-prompt');
  const envBody = envelope ? envelope.querySelector('.envelope-body') : null;
  const envFlap = envelope ? envelope.querySelector('.envelope-flap-deco') : null;
  const envLabel = envelope ? envelope.querySelector('.envelope-label') : null;
  const envRibbonL = envelope ? envelope.querySelector('.envelope-ribbon-l') : null;
  const envRibbonR = envelope ? envelope.querySelector('.envelope-ribbon-r') : null;
  const envParts = [envBody, envFlap, envLabel, envRibbonL, envRibbonR];

  let envelopeOpened = false;
  let scrollDriven = false;
  document.body.classList.add('no-scroll');

  function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    if (openPrompt) {
      openPrompt.style.opacity = '0';
      openPrompt.style.pointerEvents = 'none';
    }

    if (prefersReducedMotion) {
      if (card) card.classList.add('visible');
      if (envBody) envBody.style.opacity = '0';
      if (seal) seal.style.opacity = '0';
      transitionToScrollDriven();
      return;
    }

    // Phase 1: Seal lifts up off the envelope
    if (seal) {
      seal.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease 0.3s';
      seal.style.transform = 'translate(-50%, -50%) translateY(-140px) scale(0.9)';
      seal.style.opacity = '0';
    }

    // Phase 2: Envelope fades away slowly
    setTimeout(() => {
      envParts.forEach(el => {
        if (el) {
          el.style.transition = 'opacity 1.4s ease';
          el.style.opacity = '0';
        }
      });
    }, 500);

    // Phase 3: Content reveals (card was always behind)
    setTimeout(() => {
      if (card) card.classList.add('visible');
    }, 1200);

    // Phase 4: Switch to scroll-driven
    setTimeout(transitionToScrollDriven, 3000);
  }

  function transitionToScrollDriven() {
    scrollDriven = true;

    if (seal) {
      seal.style.transition = 'none';
      seal.style.transform = 'translate(-50%, -50%) translateY(-140px) scale(0.9)';
      seal.style.opacity = '0';
    }
    envParts.forEach(el => {
      if (el) {
        el.style.transition = 'none';
        el.style.opacity = '0';
      }
    });
    if (card) card.classList.add('visible');

    document.body.classList.remove('no-scroll');
    requestAnimationFrame(() => {
      if (envelopeSection) {
        const totalScroll = envelopeSection.offsetHeight - window.innerHeight;
        window.scrollTo(0, Math.floor(totalScroll * 0.92));
      }
      requestAnimationFrame(() => {
        [seal, envBody, envFlap, envLabel].forEach(el => {
          if (el) el.style.transition = 'none';
        });
        updateEnvelopeScroll();
      });
    });
  }

  function updateEnvelopeScroll() {
    if (!scrollDriven || !envelopeSection) return;

    const rect = envelopeSection.getBoundingClientRect();
    const totalScroll = envelopeSection.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const p = Math.min(Math.max(scrolled / totalScroll, 0), 1);

    // Seal: p 0→0.20 — lifts up and fades
    if (seal) {
      if (p < 0.20) {
        const e = p / 0.20;
        seal.style.transform = `translate(-50%, -50%) translateY(-${e * 140}px) scale(${1 - e * 0.1})`;
        seal.style.opacity = String(1 - e);
      } else {
        seal.style.transform = 'translate(-50%, -50%) translateY(-140px) scale(0.9)';
        seal.style.opacity = '0';
      }
    }

    // Envelope (body + flap + label): p 0.10→0.45 — fades away
    envParts.forEach(el => {
      if (!el) return;
      if (p < 0.10) {
        el.style.opacity = '1';
      } else if (p < 0.45) {
        el.style.opacity = String(1 - (p - 0.10) / 0.35);
      } else {
        el.style.opacity = '0';
      }
    });

    // Envelope z-index: drop it behind card when faded
    if (envelope) {
      envelope.style.zIndex = p > 0.45 ? '0' : '5';
      envelope.style.pointerEvents = p > 0.45 ? 'none' : 'auto';
    }

    // Card content: p 0.30+ show all children directly
    if (card) {
      const children = card.querySelectorAll('.invitation-inner > *');
      if (p > 0.30) {
        card.classList.add('visible');
        children.forEach(ch => {
          ch.style.opacity = '1';
          ch.style.transform = 'translateY(0)';
        });
      } else {
        card.classList.remove('visible');
        children.forEach(ch => {
          ch.style.opacity = '0';
          ch.style.transform = 'translateY(14px)';
        });
      }
    }

    // Nav + scroll hint: p 0.80+
    if (scrollHint) {
      scrollHint.style.opacity = p > 0.80 ? '1' : '0';
      scrollHint.style.pointerEvents = p > 0.80 ? 'auto' : 'none';
    }
    if (nav) {
      nav.style.opacity = p > 0.80 ? '1' : '0';
      nav.style.pointerEvents = p > 0.80 ? 'auto' : 'none';
    }
  }

  if (envelope) envelope.addEventListener('click', openEnvelope);
  if (openPrompt) openPrompt.addEventListener('click', openEnvelope);

  // ============================
  // NAVIGATION
  // ============================
  function handleNavScroll() {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }
  }

  // ============================
  // SCROLL HANDLER
  // ============================
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleNavScroll();
        updateEnvelopeScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ============================
  // INTERSECTION OBSERVER ANIMATIONS
  // ============================
  if (!prefersReducedMotion) {
    const animatedElements = document.querySelectorAll('[data-animate]');
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.animationDelay = (el.dataset.delay || 0) + 's';
          el.classList.add('animated');
          animationObserver.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    animatedElements.forEach(el => animationObserver.observe(el));
  } else {
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.style.opacity = '1';
    });
  }

  // ============================
  // WEDDING RINGS ANIMATION
  // ============================
  if (!prefersReducedMotion) {
    const ringsDividers = document.querySelectorAll('.rings-divider');
    const ringsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.querySelector('.rings-container').classList.add('visible');
          ringsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    ringsDividers.forEach(el => ringsObserver.observe(el));
  } else {
    document.querySelectorAll('.rings-divider').forEach(el => {
      el.classList.add('visible');
      el.querySelector('.rings-container').classList.add('visible');
    });
  }

  // ============================
  // CARD TILT EFFECT
  // ============================
  if (!prefersReducedMotion) {
    document.querySelectorAll('.detail-card').forEach(c => {
      c.addEventListener('mousemove', (e) => {
        const rect = c.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        c.style.transform = `translateY(-10px) scale(1.02) perspective(800px) rotateX(${y * -8}deg) rotateY(${x * 8}deg)`;
      });
      c.addEventListener('mouseleave', () => {
        c.style.transform = '';
        c.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
      });
      c.addEventListener('mouseenter', () => {
        c.style.transition = 'transform 0.1s ease, box-shadow 0.5s ease';
      });
    });
  }

  // ============================
  // COUNTDOWN TIMER
  // ============================
  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');

  function updateCountdown() {
    const diff = WEDDING_DATE - new Date();
    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '0';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }
    updateDigit(daysEl, String(Math.floor(diff / 86400000)));
    updateDigit(hoursEl, String(Math.floor((diff / 3600000) % 24)).padStart(2, '0'));
    updateDigit(minutesEl, String(Math.floor((diff / 60000) % 60)).padStart(2, '0'));
    updateDigit(secondsEl, String(Math.floor((diff / 1000) % 60)).padStart(2, '0'));
  }

  function updateDigit(el, value) {
    if (!el || el.textContent === value) return;
    el.textContent = value;
    if (!prefersReducedMotion) {
      el.classList.remove('flip');
      void el.offsetWidth;
      el.classList.add('flip');
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ============================
  // LEAFLET MAP (Lazy Loaded)
  // ============================
  const mapContainer = document.getElementById('map');
  let mapInitialized = false;

  if (mapContainer) {
    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !mapInitialized) {
          mapInitialized = true;
          initMap();
          mapObserver.unobserve(mapContainer);
        }
      });
    }, { rootMargin: '200px' });
    mapObserver.observe(mapContainer);
  }

  function initMap() {
    const lat = parseFloat(mapContainer.dataset.lat) || 41.3111;
    const lng = parseFloat(mapContainer.dataset.lng) || 69.2797;
    const zoom = parseInt(mapContainer.dataset.zoom) || 15;

    const map = L.map('map', { scrollWheelZoom: false }).setView([lat, lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const icon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:36px;height:36px;background:#d4a853;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 15px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);color:#fff;font-size:14px">&#9829;</span></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    L.marker([lat, lng], { icon })
      .addTo(map)
      .bindPopup('<div style="text-align:center;font-family:Playfair Display,serif;padding:4px"><strong style="font-size:14px">Osiyo Toyhonasi</strong><br><span style="font-size:12px;color:#666">15 Sentyabr, 2026 — Soat 15:00</span></div>')
      .openPopup();
  }

  // ============================
  // MAGNETIC BUTTON EFFECT
  // ============================
  if (!prefersReducedMotion) {
    document.querySelectorAll('.directions-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translateY(-3px) translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }
});
