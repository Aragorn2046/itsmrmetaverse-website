/* ============================================
   Animations — GSAP ScrollTrigger enhancements
   ============================================ */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  // Hero elements fade-up with stagger
  gsap.from('#hero .hero__statement', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top 80%',
    },
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power2.out',
  });

  gsap.from('#hero .hero__subtitle', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top 80%',
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    delay: 0.3,
    ease: 'power2.out',
  });

  // Section titles — subtle slide up
  gsap.utils.toArray('.section__title').forEach((title) => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
      },
      y: 20,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
    });
  });

  // Cards — staggered entrance per grid
  gsap.utils.toArray('.grid-2, .grid-3, .grid-4').forEach((grid) => {
    const cards = grid.querySelectorAll('.card, .testimonial, .embed-container');
    if (!cards.length) return;

    gsap.from(cards, {
      scrollTrigger: {
        trigger: grid,
        start: 'top 80%',
      },
      y: 24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power2.out',
    });
  });

  // Metrics counter animation
  gsap.utils.toArray('.metric__value').forEach((el) => {
    const raw = el.textContent.trim();
    const match = raw.match(/^([\d,]+)(\+?)$/);
    if (!match) return;

    const target = parseInt(match[1].replace(/,/g, ''), 10);
    const suffix = match[2];
    const obj = { val: 0 };

    gsap.to(obj, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      },
      val: target,
      duration: 1.5,
      ease: 'power1.out',
      snap: { val: 1 },
      onUpdate() {
        el.textContent = obj.val.toLocaleString() + suffix;
      },
    });
  });

  // Logo bar items — fade in with stagger
  gsap.from('.logo-bar__item', {
    scrollTrigger: {
      trigger: '.logo-bar',
      start: 'top 85%',
    },
    opacity: 0,
    y: 10,
    duration: 0.5,
    stagger: 0.08,
    ease: 'power2.out',
  });
}
