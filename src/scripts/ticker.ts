const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const tickers = Array.from(
  document.querySelectorAll<HTMLElement>("[data-ticker]")
);

const animations = new WeakMap<HTMLElement, number>();
const speed = 80; // px per second

const setupTicker = (ticker: HTMLElement) => {
  const track = ticker.querySelector<HTMLElement>(".ticker-track");
  const segment = ticker.querySelector<HTMLElement>(".ticker-segment");

  if (!track || !segment) return;

  const existing = animations.get(track);
  if (existing) {
    cancelAnimationFrame(existing);
  }
  track.style.transform = "translate3d(0, 0, 0)";
  track.style.willChange = "transform";

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
  let position = 0;
  let lastTime = performance.now();

  const tick = (now: number) => {
    const delta = (now - lastTime) / 1000;
    lastTime = now;
    position -= pxPerSecond * delta;

    while (-position >= distance) {
      position += distance;
    }

    track.style.transform = `translate3d(${position}px, 0, 0)`;
    const id = requestAnimationFrame(tick);
    animations.set(track, id);
  };

  const id = requestAnimationFrame(tick);
  animations.set(track, id);
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
