/* ============================================================
   SCRIPT.JS — Ashhab Quddusi Portfolio
   Handles: particle background, smooth scrolling, active nav,
            theme toggle, scroll-reveal, skill bars, skill filter,
            hero card 3-D tilt
   ============================================================ */


/* ────────────────────────────────────────────────────────────
   1. ANIMATED PARTICLE NETWORK BACKGROUND
   Draws interconnected dots on a full-screen <canvas>.
   ──────────────────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  /* Helper — are we in dark mode? */
  const isDark = () =>
    document.documentElement.getAttribute('data-theme') !== 'light';

  /* Resize canvas to always fill the viewport */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── Single particle class ── */
  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.r     = Math.random() * 1.4 + 0.4;        // radius 0.4–1.8 px
      this.vx    = (Math.random() - 0.5) * 0.30;     // slow drift
      this.vy    = (Math.random() - 0.5) * 0.30;
      this.alpha = Math.random() * 0.45 + 0.1;
      this.color = Math.random() > 0.5 ? '#4f8ef7' : '#7c3aed'; // blue or purple
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      /* Bounce off edges */
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle   = this.color;
      ctx.globalAlpha = isDark() ? this.alpha : this.alpha * 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* Spawn particles — density scales with screen area */
  function initParticleList() {
    particles = [];
    const count = Math.min(130, Math.floor(W * H / 10000));
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  /* Draw faint connecting lines between nearby particles */
  function drawConnections() {
    const MAX_DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);

        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * (isDark() ? 0.10 : 0.04);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79,142,247,${alpha})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  /* Main animation loop */
  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  /* Start everything */
  window.addEventListener('resize', () => { resize(); initParticleList(); }, { passive: true });
  resize();
  initParticleList();
  animate();
})();


/* ────────────────────────────────────────────────────────────
   2. SMOOTH IN-PAGE SCROLLING
   scrollToSection(id) calculates the element's position and
   uses window.scrollTo with behaviour:'smooth'.
   This prevents any navigation to a new page.
   ──────────────────────────────────────────────────────────── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  /* Offset by header height (64 px) so the heading is never hidden */
  const top = el.getBoundingClientRect().top + window.pageYOffset - 64;
  window.scrollTo({ top, behavior: 'smooth' });
}

/* Wire up every nav button */
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => scrollToSection(btn.dataset.section));
});

/* Logo also scrolls back to home */
document.querySelector('.logo').addEventListener('click', () => scrollToSection('home'));


/* ────────────────────────────────────────────────────────────
   3. ACTIVE NAV HIGHLIGHT
   As the user scrolls, the matching nav button gets .active.
   ──────────────────────────────────────────────────────────── */
const NAV_SECTIONS = ['home', 'skills', 'experience', 'projects', 'certifications', 'contact'];
const navBtns      = document.querySelectorAll('.nav-btn');

window.addEventListener('scroll', () => {
  let current = 'home';

  /* Find the last section whose top is at or above the viewport midpoint */
  NAV_SECTIONS.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.pageYOffset >= el.offsetTop - 120) {
      current = id;
    }
  });

  navBtns.forEach(btn =>
    btn.classList.toggle('active', btn.dataset.section === current)
  );
}, { passive: true });


/* ────────────────────────────────────────────────────────────
   4. DARK / LIGHT THEME TOGGLE
   Flips data-theme attribute on <html> and updates button icon.
   ──────────────────────────────────────────────────────────── */
const themeBtn = document.getElementById('theme-toggle');

themeBtn.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
  themeBtn.textContent = isLight ? '🌙' : '☀️';
});


/* ────────────────────────────────────────────────────────────
   5. SCROLL-REVEAL — IntersectionObserver
   Adds .visible to elements with class .reveal, .tl-item,
   .cert-card, or .proj-card when they enter the viewport.
   A staggered delay (index × 70 ms) gives a cascade effect.
   ──────────────────────────────────────────────────────────── */
const revealTargets = document.querySelectorAll(
  '.reveal, .tl-item, .cert-card, .proj-card'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      /* Stagger the appearance */
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      revealObserver.unobserve(entry.target); // animate once
    }
  });
}, { threshold: 0.10 });

revealTargets.forEach(el => revealObserver.observe(el));


/* ────────────────────────────────────────────────────────────
   6. SKILL BAR ANIMATION
   When a skill card scrolls into view the bar fills to the
   percentage stored in the card's data-level attribute.
   ──────────────────────────────────────────────────────────── */
const skillCards    = document.querySelectorAll('.skill-card');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const level = entry.target.dataset.level || 70;
      const fill  = entry.target.querySelector('.skill-bar-fill');
      if (fill) {
        /* Small delay so CSS transition is visible */
        setTimeout(() => { fill.style.width = level + '%'; }, 150);
      }
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.25 });

skillCards.forEach(c => skillObserver.observe(c));


/* ────────────────────────────────────────────────────────────
   7. SKILL CATEGORY FILTER
   Clicking a .cat-btn shows only cards whose data-cat matches.
   'all' shows every card.
   ──────────────────────────────────────────────────────────── */
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    /* Update active state */
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const selected = btn.dataset.cat;

    skillCards.forEach(card => {
      const show = selected === 'all' || card.dataset.cat === selected;
      card.style.display = show ? '' : 'none';
    });
  });
});


/* ────────────────────────────────────────────────────────────
   8. HERO CARD 3-D TILT (mouse parallax)
   The card tilts subtly toward the mouse cursor using CSS
   perspective + rotateX/Y transforms.
   ──────────────────────────────────────────────────────────── */
document.addEventListener('mousemove', e => {
  const card = document.querySelector('.hero-card');
  if (!card) return;

  /* Normalise mouse to -1 … +1 */
  const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
  const my = (e.clientY / window.innerHeight - 0.5) * 2;

  card.style.transform =
    `perspective(900px) rotateY(${mx * 5}deg) rotateX(${-my * 5}deg)`;
}, { passive: true });
