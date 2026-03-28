/* ============================================
   Tunnel Controller — ScrollTrigger integration
   ============================================ */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TunnelScene } from './TunnelScene.js';

gsap.registerPlugin(ScrollTrigger);

export async function initTunnel() {
  const canvas = document.getElementById('tunnel-canvas');
  const tunnelSection = document.getElementById('tunnel');
  const tunnelName = document.querySelector('.tunnel-name');
  if (!canvas || !tunnelSection) return;

  // Skip on mobile (CSS handles the fallback)
  if (window.innerWidth < 1024) return;

  // Skip on reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tunnel = new TunnelScene(canvas);
  await tunnel.init();

  // Proxy object for ScrollTrigger → RAF bridge
  const proxy = { scroll: 0 };

  // ScrollTrigger drives the proxy
  ScrollTrigger.create({
    trigger: tunnelSection,
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
    pin: true,
    onUpdate(self) {
      proxy.scroll = self.progress;
    },
  });

  // RAF reads the proxy (never direct coupling)
  function tick() {
    tunnel.setScroll(proxy.scroll);

    // Animate name overlay
    if (tunnelName) {
      const primary = tunnelName.querySelector('.tunnel-name__primary');
      const handle = tunnelName.querySelector('.tunnel-name__handle');
      const role = tunnelName.querySelector('.tunnel-name__role');

      if (proxy.scroll > 0.3 && proxy.scroll < 0.85) {
        const nameProgress = (proxy.scroll - 0.3) / 0.3;
        const clampedName = Math.min(nameProgress, 1);

        if (primary) primary.style.opacity = String(clampedName);
        if (handle) handle.style.opacity = String(Math.max(0, clampedName - 0.3) / 0.7);
        if (role) role.style.opacity = String(Math.max(0, clampedName - 0.5) / 0.5);
      } else if (proxy.scroll >= 0.85) {
        const fadeOut = (proxy.scroll - 0.85) / 0.15;
        const alpha = 1 - fadeOut;
        if (primary) primary.style.opacity = String(alpha);
        if (handle) handle.style.opacity = String(alpha);
        if (role) role.style.opacity = String(alpha);
      } else {
        if (primary) primary.style.opacity = '0';
        if (handle) handle.style.opacity = '0';
        if (role) role.style.opacity = '0';
      }
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Cleanup on navigation (SPA-safe)
  return () => tunnel.dispose();
}
