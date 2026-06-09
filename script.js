document.addEventListener('DOMContentLoaded', () => {

  const WEDDING_DATE = new Date('2026-09-15T15:00:00');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================
  // ENVELOPE SCROLL ANIMATION
  // ============================
  const envelopeSection = document.getElementById('envelope-section');
  const envelope = document.getElementById('envelope');
  const flap = document.getElementById('envelope-flap');
  const seal = document.getElementById('wax-seal');
  const card = document.getElementById('invitation-card');
  const scrollHint = document.getElementById('scroll-hint');
  const nav = document.getElementById('nav');

  let sealBroken = false;

  function getEnvelopeProgress() {
    if (!envelopeSection) return 1;
    const rect = envelopeSection.getBoundingClientRect();
    const totalScroll = envelopeSection.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    return Math.min(Math.max(scrolled / totalScroll, 0), 1);
  }

  function updateEnvelope() {
    const p = getEnvelopeProgress();

    // Hide scroll hint after slight scroll
    if (scrollHint) {
      scrollHint.style.opacity = p < 0.05 ? 1 : 0;
      scrollHint.style.pointerEvents = p < 0.05 ? 'auto' : 'none';
    }

    // Show nav after envelope opens
    if (nav) {
      nav.style.opacity = p > 0.85 ? 1 : 0;
      nav.style.pointerEvents = p > 0.85 ? 'auto' : 'none';
    }

    if (!envelope) return;

    // Phase 1: 0-0.15 — Seal cracks and breaks
    if (p < 0.15) {
      const sealP = p / 0.15;
      if (seal) {
        seal.style.opacity = 1;
        const shake = Math.sin(sealP * Math.PI * 4) * sealP * 3;
        seal.style.transform = `translate(-50%, -50%) rotate(${shake}deg)`;
        if (sealP > 0.7 && !sealBroken) {
          sealBroken = true;
          seal.classList.add('cracking');
        }
      }
      if (flap) {
        flap.style.transform = 'rotateX(0deg)';
      }
      if (card) {
        card.style.transform = 'translateY(0)';
      }
    }
    // Phase 2: 0.15-0.25 — Seal fades away
    else if (p < 0.25) {
      const fadeP = (p - 0.15) / 0.1;
      if (seal) {
        seal.style.opacity = 1 - fadeP;
        const scale = 1 + fadeP * 0.3;
        seal.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }
      if (flap) {
        flap.style.transform = 'rotateX(0deg)';
      }
      if (card) {
        card.style.transform = 'translateY(0)';
      }
    }
    // Phase 3: 0.25-0.50 — Flap opens
    else if (p < 0.50) {
      const flapP = (p - 0.25) / 0.25;
      if (seal) {
        seal.style.opacity = 0;
      }
      if (flap) {
        const angle = flapP * 180;
        flap.style.transform = `rotateX(${angle}deg)`;
        // Fade flap as it goes past 90deg (behind)
        if (angle > 90) {
          flap.style.opacity = 1 - ((angle - 90) / 90) * 0.5;
        } else {
          flap.style.opacity = 1;
        }
      }
      if (card) {
        card.style.transform = 'translateY(0)';
      }
    }
    // Phase 4: 0.50-0.95 — Card slides out
    else if (p < 0.95) {
      const cardP = (p - 0.50) / 0.45;
      // Eased card movement
      const eased = 1 - Math.pow(1 - cardP, 3);
      const envelopeH = envelope.offsetHeight || 280;
      const slideDistance = envelopeH * 1.15;

      if (seal) seal.style.opacity = 0;
      if (flap) {
        flap.style.transform = 'rotateX(180deg)';
        flap.style.opacity = 0.5;
      }
      if (card) {
        card.style.transform = `translateY(-${eased * slideDistance}px)`;
        card.style.boxShadow = `0 ${4 + eased * 20}px ${15 + eased * 40}px rgba(0,0,0,${0.05 + eased * 0.1})`;
      }
    }
    // Phase 5: 0.95-1.0 — Fully out
    else {
      if (seal) seal.style.opacity = 0;
      if (flap) {
        flap.style.transform = 'rotateX(180deg)';
        flap.style.opacity = 0.5;
      }
      if (card) {
        const envelopeH = envelope.offsetHeight || 280;
        card.style.transform = `translateY(-${envelopeH * 1.15}px)`;
        card.style.boxShadow = '0 24px 55px rgba(0,0,0,0.15)';
      }
    }
  }

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
        updateEnvelope();
        handleNavScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateEnvelope();

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
