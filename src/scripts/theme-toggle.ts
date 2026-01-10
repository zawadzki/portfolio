const storageKey = "theme";
const toggle = document.querySelector<HTMLInputElement>(".toggle input");
const docEl = document.documentElement;

const applyTheme = (theme: "light" | "dark", persist: boolean) => {
  docEl.dataset.theme = theme;
  docEl.style.colorScheme = theme;
  if (toggle) {
    toggle.checked = theme === "light";
  }
  if (persist) {
    localStorage.setItem(storageKey, theme);
  }
};

const currentTheme =
  docEl.dataset.theme === "light" ? "light" : ("dark" as const);
applyTheme(currentTheme, false);

toggle?.addEventListener("change", () => {
  applyTheme(toggle.checked ? "light" : "dark", true);
});
