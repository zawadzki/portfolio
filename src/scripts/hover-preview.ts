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
  let lastPointer: { x: number; y: number } | null = null;
  let pointerRaf: number | null = null;
  let animRaf: number | null = null;
  let lastItem: HTMLElement | null = null;
  let lastSrc: string | null = null;

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

  const updateTargetFromPoint = (x: number, y: number) => {
    const now = performance.now();
    const delta = Math.max(16, now - lastMove);
    const nextX = x + offsetX;
    const nextY = y + offsetY;
    velocityX = (nextX - targetX) / delta;
    velocityY = (nextY - targetY) / delta;
    const clamped = clampPosition(nextX, nextY);
    targetX = clamped.x;
    targetY = clamped.y;
    lastMove = now;
    hover.classList.add("is-moving");
  };

  const startAnimation = () => {
    if (animRaf === null) {
      animRaf = requestAnimationFrame(tick);
    }
  };

  const stopAnimation = () => {
    if (animRaf !== null) {
      cancelAnimationFrame(animRaf);
      animRaf = null;
    }
  };

  const activate = (item: HTMLElement, event?: PointerEvent) => {
    if (item === lastItem && isActive) {
      if (event) {
        lastPointer = { x: event.clientX, y: event.clientY };
        updateTargetFromPoint(event.clientX, event.clientY);
      }
      startAnimation();
      return;
    }
    const src =
      item.getAttribute("data-hover-image") ||
      container.getAttribute("data-hover-image");
    if (src && src === lastSrc && isActive) {
      lastItem = item;
      if (event) {
        lastPointer = { x: event.clientX, y: event.clientY };
        updateTargetFromPoint(event.clientX, event.clientY);
      }
      startAnimation();
      return;
    }
    const shouldSwap = Boolean(src && !img.src.endsWith(src));
    isActive = true;
    lastItem = item;
    lastSrc = src ?? null;
    if (swapTimeout) {
      window.clearTimeout(swapTimeout);
      swapTimeout = null;
    }
    if (event) {
      lastPointer = { x: event.clientX, y: event.clientY };
      updateTargetFromPoint(event.clientX, event.clientY);
      currentX = targetX;
      currentY = targetY;
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
    startAnimation();
  };

  const deactivate = () => {
    isActive = false;
    lastItem = null;
    if (swapTimeout) {
      window.clearTimeout(swapTimeout);
      swapTimeout = null;
    }
    hover.classList.remove("is-active");
    hover.classList.add("is-exit");
    stopAnimation();
  };

  const onMove = (event: PointerEvent) => {
    lastPointer = { x: event.clientX, y: event.clientY };
    if (pointerRaf !== null) {
      return;
    }
    pointerRaf = window.requestAnimationFrame(() => {
      if (!lastPointer) {
        pointerRaf = null;
        return;
      }
      updateTargetFromPoint(lastPointer.x, lastPointer.y);
      pointerRaf = null;
    });
  };

  const onWheel = () => {
    if (!isActive || !lastPointer) {
      return;
    }
    startAnimation();
    updateTargetFromPoint(lastPointer.x, lastPointer.y);
    const hovered = document.elementFromPoint(lastPointer.x, lastPointer.y) as
      | HTMLElement
      | null;
    const hoverItem = hovered?.closest(".hover-item") as HTMLElement | null;
    if (hoverItem && container.contains(hoverItem)) {
      activate(hoverItem);
    } else {
      deactivate();
    }
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

    animRaf = requestAnimationFrame(tick);
  };

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

  window.addEventListener("wheel", onWheel, { passive: true });
};

document.querySelectorAll<HTMLElement>(".is-hover").forEach((container) => {
  initFeaturedHover(container);
});
