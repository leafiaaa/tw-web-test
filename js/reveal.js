(function () {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  // No IntersectionObserver support → just show everything.
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = entry.target.dataset.revealDelay;
        if (delay) entry.target.style.transitionDelay = delay + "ms";
        entry.target.classList.add("is-revealed");
        obs.unobserve(entry.target); // animate once
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );

  els.forEach((el) => io.observe(el));
})();
