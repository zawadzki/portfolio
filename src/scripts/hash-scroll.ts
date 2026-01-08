const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

export {};

const scrollToHash = (hash: string) => {
  const id = hash.replace(/^#/, "");
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
    block: "start",
  });

  const isFocusable = target.matches(
    'a, button, input, textarea, select, summary, [tabindex]'
  );
  if (!isFocusable) {
    target.setAttribute("tabindex", "-1");
  }
  target.focus({ preventScroll: true });
};

window.addEventListener("hashchange", () => {
  scrollToHash(window.location.hash);
});

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
  if (!link) return;
  const hash = link.getAttribute("href") || "";
  if (!hash || hash === "#") return;
  event.preventDefault();
  if (hash !== window.location.hash) {
    window.history.pushState(null, "", hash);
  }
  scrollToHash(hash);
});

if (window.location.hash) {
  window.requestAnimationFrame(() => {
    scrollToHash(window.location.hash);
  });
}
