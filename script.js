// Vanilla port of "The Heritage Invite" design (envelope.jsx + invite.jsx).
// Behavior, timings and class names mirror the design prototype exactly.

(function () {
  'use strict';

  var CONFIG = {
    dateISO: '2026-07-11T14:00:00',
    time: 'Soat 14:00',
    venueName: 'ZAMIN TO\'YXONASI',
    lat: 40.930817,
    lng: 71.894547,
  };

  var UZ_DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

  /* ===================== STATE ===================== */
  var startOpen = (typeof location !== 'undefined' && location.hash === '#open');
  var opened = startOpen;
  var showCover = !startOpen;

  var cover = document.getElementById('cover');
  var phase = 'closed'; // closed → opening → lifting → gone

  function syncLocked() {
    document.body.classList.toggle('locked', showCover && !opened);
  }

  function setPhase(p) {
    cover.classList.remove('cover-' + phase);
    phase = p;
    cover.classList.add('cover-' + phase);
  }

  /* ===================== ENVELOPE ===================== */
  function openCover() {
    if (phase !== 'closed') return;
    setPhase('opening');
    setTimeout(function () { setPhase('lifting'); }, 1500);
    setTimeout(function () {
      setPhase('gone');
      opened = true;
      syncLocked();
      startReveal();
    }, 2900);
    setTimeout(function () {
      cover.style.display = 'none';
      showCover = false;
      syncLocked();
      armReseal();
    }, 4100);
  }
  cover.addEventListener('click', openCover);

  // reseal: once the guest has scrolled down, returning to the very top closes the envelope again
  var resealCleanup = null;
  function armReseal() {
    if (showCover) return;
    var armed = false;
    var check = function () {
      if (window.scrollY > window.innerHeight * 0.7) { armed = true; }
      else if (armed && window.scrollY <= 2) {
        // close the envelope again
        if (resealCleanup) { resealCleanup(); resealCleanup = null; }
        opened = false;
        showCover = true;
        stopReveal();
        // remount with entrance animation: cover-pre fades/scales the envelope back in
        cover.style.display = '';
        cover.className = 'cover cover-closed cover-pre';
        phase = 'closed';
        setTimeout(function () { cover.classList.remove('cover-pre'); }, 40);
        syncLocked();
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    var iv = setInterval(check, 280);
    resealCleanup = function () {
      window.removeEventListener('scroll', check);
      clearInterval(iv);
    };
  }

  /* ===================== SCROLL REVEAL ===================== */
  var io = null, revealSafety = null;
  function startReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var ioFired = false;
    io = new IntersectionObserver(function (ents) {
      ioFired = true;
      ents.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('in');
        else e.target.classList.remove('in');
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
    revealSafety = setTimeout(function () {
      if (!ioFired) els.forEach(function (e) { e.classList.add('in'); });
    }, 3000);
  }
  function stopReveal() {
    if (io) { io.disconnect(); io = null; }
    if (revealSafety) { clearTimeout(revealSafety); revealSafety = null; }
  }

  /* ===================== INV TIME (weekday) ===================== */
  var weekday = UZ_DAYS[new Date(CONFIG.dateISO).getDay()];
  document.getElementById('inv-time').textContent =
    CONFIG.time.toUpperCase() + ' · ' + weekday.toUpperCase();

  /* ===================== COUNTDOWN (odometer) ===================== */
  function calc(t) {
    var d = Math.max(0, new Date(t).getTime() - Date.now());
    return {
      d: Math.floor(d / 864e5),
      h: Math.floor((d % 864e5) / 36e5),
      m: Math.floor((d % 36e5) / 6e4),
      s: Math.floor((d % 6e4) / 1e3),
    };
  }

  /* one rolling odometer digit: a 0-9(+0) strip that rolls vertically */
  function createOdoDigit(initial) {
    var digit = document.createElement('span');
    digit.className = 'odo-digit';
    var strip = document.createElement('span');
    strip.className = 'odo-strip';
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(function (n) {
      var s = document.createElement('span');
      s.textContent = n;
      strip.appendChild(s);
    });
    digit.appendChild(strip);
    var prev = initial, t1 = null, t2 = null;
    function apply(pos) {
      strip.style.transform = 'translateY(' + (0.17 - pos).toFixed(3) + 'em)';
    }
    apply(initial);
    return {
      el: digit,
      set: function (d) {
        if (d === prev) return;
        clearTimeout(t1); clearTimeout(t2);
        if (prev === 9 && d === 0) {
          // roll FORWARD onto the duplicate 0, then snap back silently
          apply(10);
          t1 = setTimeout(function () {
            strip.classList.add('no-anim');
            apply(0);
            t2 = setTimeout(function () { strip.classList.remove('no-anim'); }, 50);
          }, 660);
        } else {
          apply(d);
        }
        prev = d;
      },
    };
  }

  /* a wheel housing holding the digits of one unit */
  function createOdoWheel(value) {
    var wheel = document.createElement('div');
    wheel.className = 'odo-wheel';
    var digits = [];
    String(value).padStart(2, '0').split('').forEach(function (ch, i) {
      if (i > 0) {
        var split = document.createElement('span');
        split.className = 'odo-split';
        wheel.appendChild(split);
      }
      var d = createOdoDigit(+ch);
      digits.push(d);
      wheel.appendChild(d.el);
    });
    return {
      el: wheel,
      count: digits.length,
      set: function (v) {
        var chs = String(v).padStart(2, '0').split('');
        for (var i = 0; i < digits.length; i++) digits[i].set(+chs[i]);
      },
    };
  }

  function initCountdown(target) {
    var root = document.getElementById('countdown');
    var labels = ['Kun', 'Soat', 'Daqiqa', 'Soniya'];
    var keys = ['d', 'h', 'm', 's'];
    var wheels = [];
    var t = calc(target);

    function build() {
      root.innerHTML = '';
      wheels = [];
      labels.forEach(function (label, i) {
        var cell = document.createElement('div');
        cell.className = 'cd-cell';
        var wheel = createOdoWheel(t[keys[i]]);
        wheels.push(wheel);
        cell.appendChild(wheel.el);
        var lab = document.createElement('span');
        lab.className = 'cd-lab';
        lab.textContent = label;
        cell.appendChild(lab);
        root.appendChild(cell);
      });
    }
    build();

    setInterval(function () {
      t = calc(target);
      for (var i = 0; i < wheels.length; i++) {
        var v = t[keys[i]];
        if (String(v).padStart(2, '0').length !== wheels[i].count) { build(); return; }
        wheels[i].set(v);
      }
    }, 1000);
  }
  initCountdown(CONFIG.dateISO);

  /* ===================== MAP ===================== */
  function buildMap(id, lat, lng, label) {
    var ref = document.getElementById(id);
    var tries = 0;
    var init = function () {
      if (!window.L || !ref) { if (tries++ < 60) return setTimeout(init, 100); return; }
      if (ref._leaflet_id) return;
      var map = window.L.map(ref, { scrollWheelZoom: false }).setView([lat, lng], 16);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);
      var icon = window.L.divIcon({
        className: 'pin-wrap',
        html: '<div class="map-pin"><div class="map-pin-dot"></div></div>',
        iconSize: [30, 40],
        iconAnchor: [15, 38],
      });
      window.L.marker([lat, lng], { icon: icon }).addTo(map).bindPopup('<b>' + label + '</b>');
      map.on('click', function () { map.scrollWheelZoom.enable(); });
    };
    init();
  }
  buildMap('map-uy', 40.934242, 71.832632, 'UY');
  buildMap('map', CONFIG.lat, CONFIG.lng, CONFIG.venueName);

  /* ===================== BOOT ===================== */
  if (startOpen) {
    cover.style.display = 'none';
    startReveal();
    armReseal();
  }
  syncLocked();
})();
