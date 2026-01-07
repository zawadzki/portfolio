const images = Array.from(
  document.querySelectorAll<HTMLImageElement>("img[data-blur-up]")
);

images.forEach((img) => {
  const reveal = () => {
    img.classList.add("is-loaded");
  };

  if (img.complete && img.naturalWidth > 0) {
    reveal();
    return;
  }

  img.addEventListener("load", reveal, { once: true });
  img.addEventListener(
    "error",
    () => {
      img.classList.add("is-loaded");
    },
    { once: true }
  );
});
