document.addEventListener('DOMContentLoaded', () => {

  const WEDDING_DATE = new Date('2026-09-15T15:00:00');
  const PARTICLE_COUNT = 60;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================
  // SMOOTH PAGE LOAD
  // ============================
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.8s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  // ============================
  // NAVIGATION
  // ============================
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleNavScroll();
        updateActiveSection();
        if (!prefersReducedMotion) {
          updateParallax();
          updateCardTilt();
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  function handleNavScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }

  function updateActiveSection() {
    let current = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150 && rect.bottom > 150) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.checked = false;
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  // ============================
  // PARALLAX SCROLLING
  // ============================
  function updateParallax() {
    const scrollY = window.scrollY;
    const viewHeight = window.innerHeight;

    document.querySelectorAll('.floating-decor').forEach(el => {
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.top < viewHeight && rect.bottom > 0) {
        const progress = (viewHeight - rect.top) / (viewHeight + rect.height);
        const offset = (progress - 0.5) * 40;
        el.style.transform = `translateY(${offset}px) ${el.style.transform?.includes('rotate') ? '' : ''}`;
      }
    });

    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrollY < viewHeight) {
      const ratio = scrollY / viewHeight;
      heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroContent.style.opacity = 1 - ratio * 1.2;
    }

    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.style.opacity = Math.max(0, 1 - (scrollY / 200));
    }
  }

  // ============================
  // MOUSE TRACKING (Hero section glow)
  // ============================
  if (!prefersReducedMotion) {
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty('--mouse-x', x + '%');
        hero.style.setProperty('--mouse-y', y + '%');

        const morphBgs = hero.querySelectorAll('.hero-morph-bg');
        morphBgs.forEach((bg, i) => {
          const speed = i === 0 ? 0.02 : -0.015;
          const offsetX = (x - 50) * speed;
          const offsetY = (y - 50) * speed;
          bg.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
      });
    }
  }

  // ============================
  // CARD TILT EFFECT
  // ============================
  const cards = document.querySelectorAll('.detail-card');

  function updateCardTilt() {}

  if (!prefersReducedMotion) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-10px) scale(1.02) perspective(800px) rotateX(${y * -8}deg) rotateY(${x * 8}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease, box-shadow 0.5s ease';
      });
    });
  }

  // ============================
  // INTERSECTION OBSERVER ANIMATIONS
  // ============================
  if (!prefersReducedMotion) {
    const animatedElements = document.querySelectorAll('[data-animate]');

    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || 0;
          el.style.animationDelay = delay + 's';
          el.classList.add('animated');
          animationObserver.unobserve(el);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

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
  // STAGGERED SECTION REVEALS
  // ============================
  if (!prefersReducedMotion) {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const children = entry.target.querySelectorAll('.detail-card, .countdown-block');
          children.forEach((child, i) => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(30px)';
            child.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
              });
            });
          });
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.details-cards, .countdown-timer').forEach(el => {
      staggerObserver.observe(el);
    });
  }

  // ============================
  // PARTICLE SYSTEM (Enhanced)
  // ============================
  const canvas = document.getElementById('particles-canvas');
  let particlesActive = true;

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let mouseX = -1000;
    let mouseY = -1000;

    function resizeCanvas() {
      const hero = canvas.parentElement;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.parentElement.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2.5 + 0.5;
        this.baseSpeedX = (Math.random() - 0.5) * 0.3;
        this.baseSpeedY = (Math.random() - 0.5) * 0.25;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.opacity = Math.random() * 0.35 + 0.05;
        this.baseOpacity = this.opacity;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.time = 0;
        const colors = ['201,168,124', '212,184,150', '139,111,71', '200,200,200'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.time += this.pulseSpeed;
        this.opacity = this.baseOpacity + Math.sin(this.time + this.pulseOffset) * 0.1;

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.speedX = this.baseSpeedX + (dx / dist) * force * 0.5;
          this.speedY = this.baseSpeedY + (dy / dist) * force * 0.5;
          this.opacity = Math.min(this.baseOpacity + force * 0.3, 0.6);
        } else {
          this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
          this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${Math.max(0, this.opacity)})`;
        ctx.fill();
      }
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201, 168, 124, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function initParticles() {
      resizeCanvas();
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      if (!particlesActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawConnections();
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animateParticles);
    }

    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          particlesActive = true;
          animateParticles();
        } else {
          particlesActive = false;
          cancelAnimationFrame(animationId);
        }
      });
    }, { threshold: 0 });

    heroObserver.observe(canvas.parentElement);
    initParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      particles.forEach(p => {
        if (p.x > canvas.width) p.x = Math.random() * canvas.width;
        if (p.y > canvas.height) p.y = Math.random() * canvas.height;
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
    const now = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    updateDigit(daysEl, String(days));
    updateDigit(hoursEl, String(hours).padStart(2, '0'));
    updateDigit(minutesEl, String(minutes).padStart(2, '0'));
    updateDigit(secondsEl, String(seconds).padStart(2, '0'));
  }

  function updateDigit(el, value) {
    if (el.textContent !== value) {
      el.textContent = value;
      if (!prefersReducedMotion) {
        el.classList.remove('flip');
        void el.offsetWidth;
        el.classList.add('flip');
      }
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ============================
  // SMOOTH COUNTER ANIMATION
  // ============================
  if (!prefersReducedMotion) {
    const countdownSection = document.querySelector('.countdown');
    if (countdownSection) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounterReveal();
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      counterObserver.observe(countdownSection);
    }
  }

  function animateCounterReveal() {
    const blocks = document.querySelectorAll('.countdown-block');
    blocks.forEach((block, i) => {
      block.style.opacity = '0';
      block.style.transform = 'translateY(20px) scale(0.9)';
      setTimeout(() => {
        block.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        block.style.opacity = '1';
        block.style.transform = 'translateY(0) scale(1)';
      }, i * 120);
    });
  }

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

    const map = L.map('map', {
      scrollWheelZoom: false,
      zoomControl: true
    }).setView([lat, lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const goldIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 36px; height: 36px;
        background: #d4a853;
        border: 3px solid #fff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 15px rgba(0,0,0,0.2);
        display: flex; align-items: center; justify-content: center;
      "><span style="
        transform: rotate(45deg);
        color: #fff;
        font-size: 14px;
      ">&#9829;</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    L.marker([lat, lng], { icon: goldIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center; font-family: 'Playfair Display', serif; padding: 4px;">
          <strong style="font-size: 14px;">Osiyo Toyhonasi</strong><br>
          <span style="font-size: 12px; color: #666;">15 Sentyabr, 2026 — Soat 15:00</span>
        </div>
      `)
      .openPopup();
  }

  // ============================
  // MAGNETIC BUTTON EFFECT
  // ============================
  if (!prefersReducedMotion) {
    document.querySelectorAll('.submit-btn, .directions-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translateY(-3px) translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ============================
  // RSVP FORM
  // ============================
  const form = document.getElementById('rsvp-form');
  const successEl = document.getElementById('rsvp-success');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const name = form.querySelector('#guest-name').value.trim();
      const email = form.querySelector('#guest-email').value.trim();
      const attendance = form.querySelector('input[name="attendance"]:checked');

      let valid = true;

      if (!name) {
        showError('guest-name', 'Please enter your name');
        valid = false;
      }
      if (!email || !isValidEmail(email)) {
        showError('guest-email', 'Please enter a valid email');
        valid = false;
      }
      if (!attendance) {
        const radioGroup = form.querySelector('.form-group-radio');
        const errorMsg = document.createElement('p');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Please select your attendance';
        errorMsg.style.color = '#c44';
        errorMsg.style.fontSize = '0.8rem';
        errorMsg.style.marginTop = '0.3rem';
        radioGroup.appendChild(errorMsg);
        valid = false;
      }

      if (!valid) return;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      console.log('RSVP Submission:', data);

      const subject = encodeURIComponent(`Wedding RSVP - ${data.name}`);
      const body = encodeURIComponent(
        `Name: ${data.name}\n` +
        `Email: ${data.email}\n` +
        `Guests: ${data.guests || 1}\n` +
        `Attendance: ${data.attendance}\n` +
        `Dietary: ${data.dietary || 'None'}\n` +
        `Message: ${data.message || 'None'}`
      );

      // To use mailto, uncomment:
      // window.location.href = `mailto:your@email.com?subject=${subject}&body=${body}`;

      form.style.animation = 'slideOut 0.6s ease forwards';
      setTimeout(() => {
        form.style.display = 'none';
        successEl.style.display = 'block';
        successEl.classList.add('show');
      }, 600);
    });
  }

  function showError(inputId, message) {
    const group = document.getElementById(inputId).closest('.form-group');
    group.classList.add('has-error');
    const errorMsg = document.createElement('p');
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    group.appendChild(errorMsg);
  }

  function clearErrors() {
    form.querySelectorAll('.has-error').forEach(g => g.classList.remove('has-error'));
    form.querySelectorAll('.error-message').forEach(e => e.remove());
    const radioError = document.querySelector('.form-group-radio .error-message');
    if (radioError) radioError.remove();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
