/* ============================================
   Main — Entry point for itsmrmetaverse.com
   ============================================ */

// --- Scroll Reveal (IntersectionObserver) ---
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}

// --- Lazy Iframe Loading ---
function initLazyIframes() {
  const iframes = document.querySelectorAll('iframe[data-src]');
  if (!iframes.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          iframe.src = iframe.dataset.src;
          iframe.removeAttribute('data-src');
          observer.unobserve(iframe);
        }
      });
    },
    { rootMargin: '200px' }
  );

  iframes.forEach((iframe) => observer.observe(iframe));
}

// --- Nav Hide/Show on Scroll ---
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const currentY = window.scrollY;

      if (currentY > lastScrollY && currentY > 100) {
        nav.classList.add('nav--hidden');
      } else {
        nav.classList.remove('nav--hidden');
      }

      lastScrollY = currentY;
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

// --- Section Dot Indicator ---
function initSectionDots() {
  const dots = document.querySelectorAll('.section-dots__dot');
  const sections = document.querySelectorAll('.section[id], #tunnel');
  if (!dots.length || !sections.length) return;

  // Click to scroll
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetId = dot.dataset.section;
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Active state on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          dots.forEach((d) => {
            d.classList.toggle(
              'section-dots__dot--active',
              d.dataset.section === id
            );
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => observer.observe(section));
}

// --- Tunnel Skip Button ---
function initTunnelSkip() {
  const skipBtn = document.querySelector('.tunnel-skip');
  if (!skipBtn) return;

  skipBtn.addEventListener('click', () => {
    const hero = document.getElementById('hero');
    if (hero) hero.scrollIntoView({ behavior: 'smooth' });
  });
}

// --- Contact Form (Formspree) ---
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'SENDING...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        btn.textContent = 'SENT ✓';
        form.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 3000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch {
      btn.textContent = 'ERROR — TRY AGAIN';
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = originalText;
      }, 3000);
    }
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initLazyIframes();
  initNav();
  initSectionDots();
  initTunnelSkip();
  initContactForm();
});
