/* ===========================
   USE CASE — auto-cycling accordion
=========================== */
(function () {
  const root = document.getElementById("usecaseFeatures");
  if (!root) return;

  const features = Array.from(root.querySelectorAll(".uc-feature"));
  if (!features.length) return;

  const READ_MS = 5000; // how long a panel stays open for reading
  const GAP_MS  = 3000; // pause (all closed) before the next one opens

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let shown = 0;        // last feature index that was shown
  let openIndex = -1;   // what's open right now (-1 = none)
  let timer = null;
  let hovering = false;

  function render() {
    features.forEach((f, i) => {
      const open = i === openIndex;
      f.classList.toggle("is-open", open);
      const tab = f.querySelector(".uc-feature__tab");
      if (tab) tab.setAttribute("aria-expanded", String(open));
    });
  }

  function open(i) {
    openIndex = i;
    if (i >= 0) shown = i;
    render();
  }

  function stop() { clearTimeout(timer); timer = null; }

  function loop() {
    stop();
    if (hovering || reduce) return;
    // hold the open panel, then close it, gap, then open the next
    timer = setTimeout(() => {
      open(-1);
      timer = setTimeout(() => {
        open((shown + 1) % features.length);
        loop();
      }, GAP_MS);
    }, READ_MS);
  }

  function start() {
    open(0);
    loop();
  }

  // Manual click takes control; the loop resumes from the clicked panel
  features.forEach((f, i) => {
    const tab = f.querySelector(".uc-feature__tab");
    if (!tab) return;
    tab.addEventListener("click", () => {
      stop();
      open(openIndex === i ? -1 : i);
      loop();
    });
  });

  // Pause on hover so readers aren't rushed
  root.addEventListener("mouseenter", () => { hovering = true; stop(); });
  root.addEventListener("mouseleave", () => { hovering = false; loop(); });

  // Kick off when the section scrolls into view
  const section = document.querySelector(".usecase");
  if (reduce) {
    open(0); // static — user controls via clicks
  } else if ("IntersectionObserver" in window && section) {
    const io = new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) { obs.disconnect(); start(); }
    }, { threshold: 0.3 });
    io.observe(section);
  } else {
    start();
  }
})();