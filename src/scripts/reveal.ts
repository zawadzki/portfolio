import { animate } from "motion";

document.documentElement.classList.add("js");

const easeOut = [0.22, 1, 0.36, 1] as const;

const singleItems = Array.from(
  document.querySelectorAll<HTMLElement>("[data-reveal]")
);
const groups = Array.from(
  document.querySelectorAll<HTMLElement>("[data-reveal-group]")
);

const singleObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      singleObserver.unobserve(entry.target);
      animate(
        entry.target as HTMLElement,
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.6, easing: easeOut }
      );
    });
  },
  { threshold: 0.2 }
);

const groupObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      groupObserver.unobserve(entry.target);
      const items = Array.from(
        (entry.target as HTMLElement).querySelectorAll<HTMLElement>(
          "[data-reveal-item]"
        )
      );
      animate(
        items,
        { opacity: [0, 1], y: [16, 0] },
        {
          duration: 0.55,
          easing: easeOut,
          delay: (index: number) => index * 0.08,
        }
      );
    });
  },
  { threshold: 0.2 }
);

singleItems.forEach((item) => singleObserver.observe(item));
groups.forEach((group) => groupObserver.observe(group));
