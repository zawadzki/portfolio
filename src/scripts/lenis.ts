import Lenis from "lenis";

export const lenis = new Lenis({
  duration: 1.15,
  smoothWheel: true,
  syncTouch: true,
  syncTouchLerp: 0.12,
  touchMultiplier: 1,
  lerp: 0.1,
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
