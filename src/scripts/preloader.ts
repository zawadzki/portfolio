const root = document.documentElement;

const finish = () => {
  root.classList.remove("is-preloading");
  root.classList.add("is-loaded");
};

window.addEventListener("load", () => {
  window.setTimeout(() => {
    window.requestAnimationFrame(finish);
  }, 200);
});
