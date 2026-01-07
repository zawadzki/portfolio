// @ts-ignore
const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const tickers = Array.from(
  document.querySelectorAll<HTMLElement>("[data-ticker]")
);

type TickerState = {
  track: HTMLElement;
  segment: HTMLElement;
  rafId: number | null;
  position: number;
  lastTime: number;
  distance: number;
  pxPerSecond: number;
};

const states = new WeakMap<HTMLElement, TickerState>();
const visibility = new WeakMap<HTMLElement, boolean>();
const speed = 80; // px per second

const stopAnimation = (ticker: HTMLElement) => {
  const state = states.get(ticker);
  if (!state || state.rafId === null) {
    return;
  }
  cancelAnimationFrame(state.rafId);
  state.rafId = null;
  state.track.style.willChange = "";
};

const startAnimation = (ticker: HTMLElement) => {
  const state = states.get(ticker);
  if (!state || state.rafId !== null) {
    return;
  }

  state.lastTime = performance.now();
  state.track.style.willChange = "transform";

  const tick = (now: number) => {
    const delta = (now - state.lastTime) / 1000;
    state.lastTime = now;
    state.position -= state.pxPerSecond * delta;

    while (-state.position >= state.distance) {
      state.position += state.distance;
    }

    state.track.style.transform = `translate3d(${state.position}px, 0, 0)`;
    state.rafId = requestAnimationFrame(tick);
  };

  state.rafId = requestAnimationFrame(tick);
};

const setupTicker = (ticker: HTMLElement) => {
  const track = ticker.querySelector<HTMLElement>(".ticker-track");
  const segment = ticker.querySelector<HTMLElement>(".ticker-segment");

  if (!track || !segment) return;

  const existing = states.get(ticker);
  if (existing?.rafId) {
    cancelAnimationFrame(existing.rafId);
  }
  track.style.transform = "translate3d(0, 0, 0)";
  track.style.willChange = "";

  const trackWidth = ticker.getBoundingClientRect().width;
  if (!trackWidth) return;

  track.querySelectorAll(".ticker-segment.clone").forEach((clone) => {
    clone.remove();
  });

  const segmentWidth = segment.getBoundingClientRect().width;
  if (!segmentWidth) return;

  let totalWidth = segmentWidth;
  const targetWidth = trackWidth + segmentWidth;

  while (totalWidth < targetWidth) {
    const clone = segment.cloneNode(true) as HTMLElement;
    clone.classList.add("clone");
    track.appendChild(clone);
    totalWidth += clone.getBoundingClientRect().width;
  }

  const distance = Math.round(segmentWidth);
  const pxPerSecond = prefersReduced ? speed * 0.55 : speed;

  states.set(ticker, {
    track,
    segment,
    rafId: null,
    position: 0,
    lastTime: performance.now(),
    distance,
    pxPerSecond,
  });

  if (visibility.get(ticker)) {
    startAnimation(ticker);
  }
};

const initTickers = () => {
  tickers.forEach((ticker) => setupTicker(ticker));
};

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => requestAnimationFrame(initTickers));
} else {
  window.addEventListener(
    "load",
    () => requestAnimationFrame(initTickers),
    { once: true }
  );
}

const resizeObserver = new ResizeObserver(() => {
  requestAnimationFrame(initTickers);
});

tickers.forEach((ticker) => resizeObserver.observe(ticker));

const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const ticker = entry.target as HTMLElement;
    const isVisible = entry.isIntersecting;
    visibility.set(ticker, isVisible);
    if (isVisible) {
      startAnimation(ticker);
    } else {
      stopAnimation(ticker);
    }
  });
});

tickers.forEach((ticker) => {
  visibility.set(ticker, false);
  intersectionObserver.observe(ticker);
});
