// @ts-ignore
const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

const initFeaturedHover = (container: HTMLElement) => {
  const hover = document.createElement("div");
  const mask = document.createElement("div");
  const img = document.createElement("img");

  hover.className = "hover-preview";
  mask.className = "hover-preview-mask";
  img.className = "hover-preview-image";
  img.alt = "Preview";

  mask.appendChild(img);
  hover.appendChild(mask);
  document.body.appendChild(hover);

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let lastMove = performance.now();
  let isActive = false;
  const offsetX = 24;
  const offsetY = 24;
  const edgePadding = 16;
  let hoverWidth = 0;
  let hoverHeight = 0;

  const setImage = (src: string | null) => {
    if (!src) return;
    if (img.src.endsWith(src)) return;
    img.src = src;
  };

  const updateSize = () => {
    const rect = hover.getBoundingClientRect();
    hoverWidth = rect.width;
    hoverHeight = rect.height;
  };

  const clampPosition = (x: number, y: number) => {
    const maxX = Math.max(edgePadding, window.innerWidth - hoverWidth - edgePadding);
    const maxY = Math.max(edgePadding, window.innerHeight - hoverHeight - edgePadding);
    return {
      x: Math.min(Math.max(edgePadding, x), maxX),
      y: Math.min(Math.max(edgePadding, y), maxY),
    };
  };

  let swapTimeout: number | null = null;

  const activate = (item: HTMLElement, event?: PointerEvent) => {
    const src =
      item.getAttribute("data-hover-image") ||
      container.getAttribute("data-hover-image");
    const shouldSwap = Boolean(src && !img.src.endsWith(src));
    isActive = true;
    if (swapTimeout) {
      window.clearTimeout(swapTimeout);
      swapTimeout = null;
    }
    if (event) {
      const nextX = event.clientX + offsetX;
      const nextY = event.clientY + offsetY;
      const clamped = clampPosition(nextX, nextY);
      targetX = clamped.x;
      targetY = clamped.y;
      currentX = clamped.x;
      currentY = clamped.y;
      lastMove = performance.now();
    }
    if (shouldSwap) {
      hover.classList.remove("is-active");
      hover.classList.add("is-exit");
      swapTimeout = window.setTimeout(() => {
        setImage(src);
        hover.classList.add("is-active");
        hover.classList.remove("is-exit");
      }, 140);
    } else {
      setImage(src);
      hover.classList.add("is-active");
      hover.classList.remove("is-exit");
    }
  };

  const deactivate = () => {
    isActive = false;
    if (swapTimeout) {
      window.clearTimeout(swapTimeout);
      swapTimeout = null;
    }
    hover.classList.remove("is-active");
    hover.classList.add("is-exit");
  };

  const onMove = (event: PointerEvent) => {
    const now = performance.now();
    const delta = Math.max(16, now - lastMove);
    const nextX = event.clientX + offsetX;
    const nextY = event.clientY + offsetY;
    velocityX = (nextX - targetX) / delta;
    velocityY = (nextY - targetY) / delta;
    const clamped = clampPosition(nextX, nextY);
    targetX = clamped.x;
    targetY = clamped.y;
    lastMove = now;
    hover.classList.add("is-moving");
  };

  const tick = (time: number) => {
    currentX += (targetX - currentX) * 0.16;
    currentY += (targetY - currentY) * 0.16;

    const timeSinceMove = time - lastMove;
    const moveFactor = prefersReduced ? 0 : Math.max(0, 1 - timeSinceMove / 150);
    if (moveFactor === 0) {
      hover.classList.remove("is-moving");
    }
    const wiggle = prefersReduced ? 0 : Math.sin(time / 280) * moveFactor;
    const rotate = prefersReduced ? 0 : Math.sin(time / 360) * 0.6 * moveFactor;
    const skewX = prefersReduced
      ? 0
      : Math.max(-6, Math.min(6, velocityY * 70)) * moveFactor;
    const skewY = prefersReduced
      ? 0
      : Math.max(-6, Math.min(6, velocityX * 70)) * moveFactor;

    hover.style.transform = `translate3d(${currentX + wiggle}px, ${currentY - wiggle}px, 0) rotate(${rotate}deg)`;
    hover.style.setProperty("--skew-x", `${skewX}deg`);
    hover.style.setProperty("--skew-y", `${skewY}deg`);

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
  updateSize();
  window.addEventListener("resize", updateSize);
  img.addEventListener("load", updateSize);

  container.querySelectorAll<HTMLElement>(".hover-item").forEach((item) => {
    item.addEventListener("pointerenter", (event) =>
      activate(item, event as PointerEvent)
    );
    item.addEventListener("pointerleave", deactivate);
    item.addEventListener("pointermove", onMove);
  });
};

document.querySelectorAll<HTMLElement>(".is-hover").forEach((container) => {
  initFeaturedHover(container);
});
