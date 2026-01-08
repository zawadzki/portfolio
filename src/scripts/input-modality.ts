const root = document.documentElement;

const setKeyboard = () => {
  root.classList.add("using-keyboard");
  root.classList.remove("using-mouse");
};

const setMouse = () => {
  root.classList.add("using-mouse");
  root.classList.remove("using-keyboard");
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Tab") {
    setKeyboard();
  }
};

root.classList.add("using-mouse");
window.addEventListener("keydown", handleKeydown);
window.addEventListener("mousemove", setMouse);
