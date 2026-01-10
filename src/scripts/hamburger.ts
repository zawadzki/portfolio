const html = document.documentElement;
const hamburger = document.querySelector<HTMLButtonElement>(".hamburger");
const nav = document.querySelector<HTMLElement>(".nav");
const menuLinks = nav?.querySelectorAll<HTMLAnchorElement>("a") ?? [];
const bars = hamburger?.querySelectorAll<HTMLElement>(".bar") ?? [];

const setLinksTabIndex = (value: string) => {
  menuLinks.forEach((link) => link.setAttribute("tabindex", value));
};

const openMenu = () => {
  if (!hamburger) return;
  hamburger.classList.add("is-clicked");
  bars.forEach((bar) => bar.classList.add("animate"));
  setLinksTabIndex("0");
  hamburger.setAttribute("aria-expanded", "true");
  html.classList.add("menu-open");
};

const closeMenu = () => {
  if (!hamburger) return;
  hamburger.classList.remove("is-clicked");
  bars.forEach((bar) => bar.classList.remove("animate"));
  setLinksTabIndex("-1");
  hamburger.setAttribute("aria-expanded", "false");
  html.classList.remove("menu-open");
};

if (hamburger) {
  setLinksTabIndex("-1");
  hamburger.setAttribute("aria-expanded", "false");

  hamburger.addEventListener("click", (event) => {
    event.preventDefault();
    if (hamburger.classList.contains("is-clicked")) {
      closeMenu();
      return;
    }
    openMenu();
  });
}

menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});
