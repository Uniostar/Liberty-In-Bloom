/* ============================================================
   Liberty in Bloom — Shared JavaScript Utilities
   ============================================================ */

'use strict';

/* ============================================================
   NAV: Active State & Hamburger
   ============================================================ */
(function initNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || href === './' + currentPath ||
        (currentPath === '' && href === 'index.html') ||
        (currentPath === 'index.html' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  const hamburger = document.querySelector('.nav-hamburger');
  const navLinksEl = document.querySelector('.nav-links');

  if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
      navLinksEl.classList.toggle('open');
    });
    // Close on link click
    navLinksEl.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinksEl.classList.remove('open'));
    });
  }
})();

/* ============================================================
   FIREFLY EFFECT
   ============================================================ */
function initFireflies(count = 20) {
  const container = document.body;
  const fireflies = [];

  for (let i = 0; i < count; i++) {
    const ff = document.createElement('div');
    ff.classList.add('firefly');

    // Random starting position
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    ff.style.left = x + 'px';
    ff.style.top  = y + 'px';

    // Random animation duration and delay
    const dur   = 2 + Math.random() * 4;   // 2–6s pulse
    const delay = Math.random() * 5;         // 0–5s delay
    ff.style.animationDuration = dur + 's';
    ff.style.animationDelay   = delay + 's';

    container.appendChild(ff);
    fireflies.push({ el: ff, x, y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8
    });
  }

  // Slowly drift fireflies
  function driftFireflies() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    fireflies.forEach(ff => {
      ff.x += ff.vx;
      ff.y += ff.vy;

      // Bounce off edges
      if (ff.x < 0 || ff.x > W) ff.vx *= -1;
      if (ff.y < 0 || ff.y > H) ff.vy *= -1;

      // Occasionally change direction
      if (Math.random() < 0.008) {
        ff.vx += (Math.random() - 0.5) * 0.5;
        ff.vy += (Math.random() - 0.5) * 0.5;
        // Clamp speed
        const speed = Math.sqrt(ff.vx * ff.vx + ff.vy * ff.vy);
        if (speed > 1.2) { ff.vx *= 0.8; ff.vy *= 0.8; }
        if (speed < 0.2) { ff.vx += (Math.random() - 0.5) * 0.3; ff.vy += (Math.random() - 0.5) * 0.3; }
      }

      ff.el.style.left = ff.x + 'px';
      ff.el.style.top  = ff.y + 'px';
    });

    requestAnimationFrame(driftFireflies);
  }

  requestAnimationFrame(driftFireflies);
}

/* ============================================================
   FLOWER PETAL SPAWNER (hero section)
   ============================================================ */
function initPetals(containerSelector = '.petal-container') {
  // CSS petals are already in HTML; this function can spawn additional dynamic ones
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const colors = [
    ['#e8a4b4', '#c97090'],
    ['#f9d0a0', '#e8a870'],
    ['#c8a8d8', '#9870b8'],
    ['#f0e0b0', '#d4af37'],
    ['#b8d4f8', '#88a8e0'],
    ['#f8c8d0', '#e0889a'],
    ['#e0d0f8', '#a890e0'],
    ['#c0e0d0', '#80c0a8'],
  ];

  function spawnPetal() {
    const petal = document.createElement('div');
    petal.classList.add('petal');

    const color = colors[Math.floor(Math.random() * colors.length)];
    petal.style.background = `linear-gradient(135deg, ${color[0]}, ${color[1]})`;
    petal.style.left  = Math.random() * 100 + '%';
    petal.style.bottom = '-60px';
    petal.style.width  = (12 + Math.random() * 12) + 'px';
    petal.style.height = (18 + Math.random() * 18) + 'px';

    const dur = 8 + Math.random() * 8;
    const delay = Math.random() * 3;
    petal.style.animationDuration = dur + 's';
    petal.style.animationDelay   = delay + 's';
    petal.style.animationName    = 'petalFloat';
    petal.style.animationTimingFunction = 'linear';
    petal.style.animationFillMode = 'forwards';

    container.appendChild(petal);

    // Remove after animation completes
    setTimeout(() => {
      if (petal.parentNode) petal.parentNode.removeChild(petal);
    }, (dur + delay) * 1000 + 500);
  }

  // Spawn petals periodically
  setInterval(spawnPetal, 2000);
}

/* ============================================================
   COUNTDOWN TIMER — July 4, 2026
   ============================================================ */
function initCountdown() {
  const targetDate = new Date('July 4, 2026 00:00:00').getTime();

  const daysEl    = document.getElementById('countdown-days');
  const hoursEl   = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');

  if (!daysEl) return;

  function updateCountdown() {
    const now  = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      daysEl.textContent    = '0';
      hoursEl.textContent   = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent    = days;
    hoursEl.textContent   = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ============================================================
   SCROLL FADE-IN (IntersectionObserver)
   ============================================================ */
function initScrollFadeIn() {
  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  const elements = document.querySelectorAll('.fade-in');
  if (elements.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    elements.forEach(el => {
      if (isInViewport(el)) {
        el.classList.add('visible');
      } else {
        observer.observe(el);
      }
    });
  }

  const timelineItems = document.querySelectorAll('.timeline-item');
  if (timelineItems.length) {
    const tlObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), 150);
          tlObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    timelineItems.forEach(el => {
      if (isInViewport(el)) {
        el.classList.add('visible');
      } else {
        tlObserver.observe(el);
      }
    });
  }

  // Safety net: after 800ms force all remaining elements visible
  setTimeout(() => {
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => el.classList.add('visible'));
    document.querySelectorAll('.timeline-item:not(.visible)').forEach(el => el.classList.add('visible'));
  }, 800);
}

/* ============================================================
   CLICKABLE QUOTE HANDLER
   ============================================================ */
function initClickableQuotes() {
  const quoteCards = document.querySelectorAll('.quote-card[data-modal]');
  const overlay = document.getElementById('quote-modal');
  if (!overlay) return;

  const closeBtn  = overlay.querySelector('.modal-close');
  const modalQuote = overlay.querySelector('.modal-quote');
  const modalTitle = overlay.querySelector('.modal-title');
  const modalBody  = overlay.querySelector('.modal-body');

  quoteCards.forEach(card => {
    card.addEventListener('click', function(e) {
      const quote = this.dataset.quote;
      const title = this.dataset.title;
      const body  = this.dataset.body;

      modalQuote.textContent = '"' + quote + '"';
      modalTitle.textContent = title;
      modalBody.textContent  = body;

      overlay.classList.add('open');

      // Bloom rings animation at click point
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = 0; i < 3; i++) {
        const ring = document.createElement('div');
        ring.classList.add('bloom-ring');
        ring.style.left   = x + 'px';
        ring.style.top    = y + 'px';
        ring.style.width  = '30px';
        ring.style.height = '30px';
        ring.style.marginLeft = '-15px';
        ring.style.marginTop  = '-15px';
        ring.style.animationDelay = (i * 0.18) + 's';
        this.appendChild(ring);
        setTimeout(() => { if (ring.parentNode) ring.parentNode.removeChild(ring); }, 900);
      }
    });
  });

  closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.classList.remove('open');
  });
}

/* ============================================================
   DATA LAYER — Firebase Firestore + localStorage fallback
   Config lives in firebase-config.js (fill in your values there).
   window._db and helpers are set by the <script type="module">
   block in each HTML page's <head> once Firebase initialises.
   ============================================================ */

// In-memory cache — populated by loadFirebaseData() at page load
let _quizCache   = null;
let _surveyCache = null;

/**
 * Fetch all quiz and survey documents from Firestore into memory.
 * Call this once (await it) before reading data on any page.
 */
async function loadFirebaseData() {
  if (!window._db) return;
  try {
    const qSnap      = await window._fbGetDocs(window._fbCollection(window._db, 'quizResults'));
    _quizCache       = qSnap.docs.map(d => d.data());
    const sSnap      = await window._fbGetDocs(window._fbCollection(window._db, 'surveyResults'));
    _surveyCache     = sSnap.docs.map(d => d.data());
  } catch (e) {
    console.warn('Firebase read failed — falling back to localStorage.', e);
  }
}

/**
 * Save a quiz result (Firestore when available, localStorage otherwise).
 */
function saveQuizResult(score, missedQuestions) {
  const data = { score, missedQuestions, timestamp: new Date().toISOString(), total: 10 };
  if (window._db) {
    window._fbAddDoc(window._fbCollection(window._db, 'quizResults'), data)
      .catch(e => console.warn('Firebase write failed:', e));
    if (_quizCache) _quizCache.push(data);
    return;
  }
  const existing = JSON.parse(localStorage.getItem('libertyBloom_quizResults') || '[]');
  existing.push(data);
  localStorage.setItem('libertyBloom_quizResults', JSON.stringify(existing));
}

/**
 * Read all quiz results (from cache when Firebase is active).
 */
function getQuizResults() {
  if (_quizCache !== null) return _quizCache;
  try { return JSON.parse(localStorage.getItem('libertyBloom_quizResults') || '[]'); }
  catch { return []; }
}

/**
 * Save a survey response (Firestore when available, localStorage otherwise).
 */
function saveSurveyResult(responses) {
  const data = { responses, timestamp: new Date().toISOString() };
  if (window._db) {
    window._fbAddDoc(window._fbCollection(window._db, 'surveyResults'), data)
      .catch(e => console.warn('Firebase write failed:', e));
    if (_surveyCache) _surveyCache.push(data);
    return;
  }
  const existing = JSON.parse(localStorage.getItem('libertyBloom_surveyResults') || '[]');
  existing.push(data);
  localStorage.setItem('libertyBloom_surveyResults', JSON.stringify(existing));
}

/**
 * Read all survey results (from cache when Firebase is active).
 */
function getSurveyResults() {
  if (_surveyCache !== null) return _surveyCache;
  try { return JSON.parse(localStorage.getItem('libertyBloom_surveyResults') || '[]'); }
  catch { return []; }
}

/**
 * Compute aggregated survey totals synchronously from cache/localStorage.
 * Returns { q0: { optionText: count }, q1: { … }, … }
 */
function getAggregateSurveyData() {
  const results = getSurveyResults();
  const agg = {};
  results.forEach(result => {
    const responses = result.responses;
    Object.keys(responses).forEach(qKey => {
      if (!agg[qKey]) agg[qKey] = {};
      const answers = Array.isArray(responses[qKey]) ? responses[qKey] : [responses[qKey]];
      answers.forEach(ans => {
        if (ans) agg[qKey][ans] = (agg[qKey][ans] || 0) + 1;
      });
    });
  });
  return agg;
}

/**
 * Compute most-missed question from quiz results
 * Returns { index, question, missCount, totalAttempts }
 */
function getMostMissedQuestion(questionTexts) {
  const results = getQuizResults();
  if (!results.length) return null;

  const missCounts = new Array(10).fill(0);
  results.forEach(r => {
    (r.missedQuestions || []).forEach(idx => {
      if (idx >= 0 && idx < 10) missCounts[idx]++;
    });
  });

  const maxMisses = Math.max(...missCounts);
  if (maxMisses === 0) return null;

  const maxIdx = missCounts.indexOf(maxMisses);
  return {
    index: maxIdx,
    question: questionTexts ? questionTexts[maxIdx] : `Question ${maxIdx + 1}`,
    missCount: maxMisses,
    totalAttempts: results.length
  };
}

/* ============================================================
   RATE LIMITING — one submission per 24 hours per device
   ============================================================ */
function isRateLimited(key, windowMs) {
  const last = localStorage.getItem(key);
  if (!last) return false;
  return (Date.now() - parseInt(last, 10)) < windowMs;
}

function markSubmission(key) {
  localStorage.setItem(key, Date.now().toString());
}

/* ============================================================
   FIREWORKS ANIMATION
   ============================================================ */
function launchFireworks() {
  let container = document.querySelector('.fireworks-container');
  if (!container) {
    container = document.createElement('div');
    container.classList.add('fireworks-container');
    document.body.appendChild(container);
  }

  const colors = ['#d4af37', '#c9956a', '#8b1a1a', '#b8d4e8', '#ffffff', '#f0d060', '#e8a4b4'];
  const count = 28;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const fw = document.createElement('div');
      fw.classList.add('firework');

      const size  = 20 + Math.random() * 60;
      const x     = 10 + Math.random() * 80;
      const y     = 10 + Math.random() * 80;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const dur   = 0.8 + Math.random() * 0.8;

      fw.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}%;
        top: ${y}%;
        background: radial-gradient(circle, ${color} 0%, transparent 70%);
        animation-duration: ${dur}s;
        margin-left: -${size/2}px;
        margin-top: -${size/2}px;
      `;

      container.appendChild(fw);
      setTimeout(() => { if (fw.parentNode) fw.parentNode.removeChild(fw); }, dur * 1000 + 100);
    }, i * 120);
  }

  // Remove container after animation
  setTimeout(() => {
    if (container && container.parentNode) container.parentNode.removeChild(container);
  }, count * 120 + 1500);
}

/* ============================================================
   INIT ON DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  // initNav already ran as an IIFE at parse time — do not call again
  initScrollFadeIn();
  initCountdown();
  initClickableQuotes();
  initFireflies(18);
  initPetals('.petal-container');
});
