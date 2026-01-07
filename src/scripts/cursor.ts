const isHoverCapable = window.matchMedia("(hover: hover)").matches;

if (isHoverCapable) {
  document.documentElement.classList.add("has-cursor");

  const cursor = document.createElement("div");
  const ring = document.createElement("div");
  const ringInner = document.createElement("div");
  const reticule = document.createElement("div");

  cursor.className = "cursor";
  ring.className = "cursor-ring";
  ringInner.className = "cursor-ring-inner";
  reticule.className = "cursor-reticule reticule-idle";

  ringInner.append(reticule);
  ring.append(ringInner);
  document.body.append(cursor, ring);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let tx = x;
  let ty = y;
  let lastPointer: { x: number; y: number } | null = null;
  let targetEl: HTMLElement | null = null;

  const speed = 0.3;
  const cursorSize = 5;
  const ringSize = 40;
  const ringPadding = 8;
  const cornerThickness = 2;
  const cornerLength = 10;

  type CornerPosition = {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };

  const corners: CornerPosition[] = [
    { top: "0px", left: "0px" },
    { top: "0px", right: "0px" },
    { bottom: "0px", left: "0px" },
    { bottom: "0px", right: "0px" },
  ];

  const addCorner = (position: CornerPosition) => {
    const vertical = document.createElement("div");
    vertical.className = "cursor-corner";
    vertical.style.width = `${cornerThickness}px`;
    vertical.style.height = `${cornerLength}px`;
    Object.assign(vertical.style, position);

    const horizontal = document.createElement("div");
    horizontal.className = "cursor-corner";
    horizontal.style.width = `${cornerLength}px`;
    horizontal.style.height = `${cornerThickness}px`;
    Object.assign(horizontal.style, position);

    reticule.append(vertical, horizontal);
  };

  corners.forEach(addCorner);

  const setCursorVisible = (visible: boolean) => {
    cursor.style.opacity = visible ? "1" : "0";
    ring.style.opacity = visible ? "1" : "0";
  };

  const setActive = (active: boolean) => {
    document.body.classList.toggle("cursor-active", active);
  };

  const setTargetState = (active: boolean) => {
    ring.classList.toggle("ring-target", active);
    document.body.classList.toggle("cursor-target", active);
    reticule.classList.toggle("reticule-idle", !active);
    reticule.classList.toggle("reticule-target", active);
  };

  const resetTarget = (el: HTMLElement) => {
    setActive(false);
    setTargetState(false);
    targetEl = null;
    el.style.transform = "translate3d(0, 0, 0)";
    el.classList.remove("is-magnetic");
  };

  const activateTarget = (el: HTMLElement) => {
    setActive(true);
    setTargetState(true);
    targetEl = el;
  };

  const updateRingPosition = () => {
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const width = rect.width + ringPadding * 2;
      const height = rect.height + ringPadding * 2;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      ring.style.width = `${width}px`;
      ring.style.height = `${height}px`;
      ring.style.transform = `translate3d(${centerX - width / 2}px, ${centerY - height / 2}px, 0)`;
      ring.style.borderRadius = "0px";
      return;
    }

    ring.style.width = `${ringSize}px`;
    ring.style.height = `${ringSize}px`;
    ring.style.transform = `translate3d(${x - ringSize / 2}px, ${y - ringSize / 2}px, 0)`;
    ring.style.borderRadius = "0px";
  };

  const animate = () => {
    x += (tx - x) * speed;
    y += (ty - y) * speed;
    cursor.style.transform = `translate3d(${tx - cursorSize / 2}px, ${ty - cursorSize / 2}px, 0)`;
    updateRingPosition();
    requestAnimationFrame(animate);
  };

  const updatePointer = (xPos: number, yPos: number) => {
    tx = xPos;
    ty = yPos;
    setCursorVisible(true);
  };

  const onMove = (event: MouseEvent) => {
    lastPointer = { x: event.clientX, y: event.clientY };
    updatePointer(event.clientX, event.clientY);
  };

  const onWheel = () => {
    if (!lastPointer) {
      return;
    }
    if (targetEl) {
      resetTarget(targetEl);
    }
    updatePointer(lastPointer.x, lastPointer.y);
  };

  const updateMagnetic = (event: MouseEvent, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const relX = event.clientX - rect.left - rect.width / 2;
    const relY = event.clientY - rect.top - rect.height / 2;
    const strength = 0.25;
    const maxMove = 14;
    const moveX = Math.max(-maxMove, Math.min(maxMove, relX * strength));
    const moveY = Math.max(-maxMove, Math.min(maxMove, relY * strength));
    el.classList.add("is-magnetic");
    el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
  };

  const magneticTargets = Array.from(
    document.querySelectorAll<HTMLElement>("a, button")
  );

  magneticTargets.forEach((el) => {
    el.classList.add("magnetic-target");
    el.addEventListener("mouseenter", () => activateTarget(el));
    el.addEventListener("mouseleave", () => resetTarget(el));
    el.addEventListener("focus", () => activateTarget(el));
    el.addEventListener("blur", () => resetTarget(el));
    el.addEventListener("mousemove", (event) => updateMagnetic(event, el));
  });

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("mousedown", () =>
    document.body.classList.add("cursor-pressed")
  );
  window.addEventListener("mouseup", () => {
    document.body.classList.remove("cursor-pressed");
    document.body.classList.add("cursor-release");
    window.setTimeout(() => {
      document.body.classList.remove("cursor-release");
    }, 220);
  });
  window.addEventListener("mouseleave", () => {
    setCursorVisible(false);
    targetEl = null;
    setTargetState(false);
  });

  animate();
}
