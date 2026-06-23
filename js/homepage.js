/* ===== xNinja Skills carousel (infinite loop) ===== */
function initSkillsCarousel(root = document) {
  const carousel = root.querySelector(".skills__carousel");
  if (!carousel) return;

  const viewport = carousel.querySelector(".skills__viewport");
  const track = carousel.querySelector(".skills__track");
  const prevBtn = carousel.querySelector(".skills__nav--prev");
  const nextBtn = carousel.querySelector(".skills__nav--next");
  if (!viewport || !track) return;

  const originals = Array.from(track.children).filter((el) =>
    el.classList.contains("skill-card"),
  );
  const n = originals.length;
  if (n === 0) return;

  // Single card: nothing to loop, just center it.
  if (n === 1) {
    const c = originals[0];
    c.classList.add("skill-card--active");
    const center = () => {
      track.style.transform = `translateX(${
        viewport.offsetWidth / 2 - (c.offsetLeft + c.offsetWidth / 2)
      }px)`;
    };
    window.addEventListener("resize", center);
    window.addEventListener("load", center);
    center();
    return;
  }

  // Clone the full set on each side -> [clones][originals][clones]
  originals
    .map((c) => c.cloneNode(true))
    .forEach((c) => track.insertBefore(c, originals[0]));
  originals.map((c) => c.cloneNode(true)).forEach((c) => track.appendChild(c));

  const cards = Array.from(track.children).filter((el) =>
    el.classList.contains("skill-card"),
  );
  const realStart = n; // index in `cards` where the originals begin
  const activeOriginal = Math.max(
    0,
    originals.findIndex((c) => c.classList.contains("skill-card--active")),
  );

  let ext = realStart + activeOriginal;
  let animating = false;
  let suppressClick = false;

  const logical = (i) => (((i - realStart) % n) + n) % n;

  function applyTransform() {
    const active = cards[ext];
    const offset =
      viewport.offsetWidth / 2 - (active.offsetLeft + active.offsetWidth / 2);
    track.style.transform = `translateX(${offset}px)`;
  }

  function paint() {
    cards.forEach((c, i) => {
      const isActive = i === ext;
      c.classList.toggle("skill-card--active", isActive);
      c.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
  }

  function animateTo() {
    track.style.transition = ""; // fall back to CSS (0.45s)
    applyTransform();
  }

  function jumpTo() {
    track.style.transition = "none";
    applyTransform();
    void track.offsetWidth; // force reflow so the next move animates again
    track.style.transition = "";
  }

  function go(dir) {
    if (animating) return;
    animating = true;
    ext += dir;
    paint();
    animateTo();
  }

  function rebase() {
    const target = realStart + logical(ext);
    if (target !== ext) {
      ext = target;
      paint();
      jumpTo();
    }
  }

  track.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform") return;
    animating = false;
    rebase();
  });

  if (prevBtn) prevBtn.addEventListener("click", () => go(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => go(1));

  cards.forEach((c) => {
    c.addEventListener("click", (e) => {
      if (suppressClick || e.target.closest("a, button")) return;
      if (c.classList.contains("skill-card--active")) return;
      const rect = c.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const vpRect = viewport.getBoundingClientRect();
      const vpCenter = vpRect.left + viewport.offsetWidth / 2;
      go(cardCenter < vpCenter ? -1 : 1);
    });
  });

  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });

  // swipe / drag
  let startX = 0;
  let dragging = false;
  viewport.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
  });
  window.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) {
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      go(dx < 0 ? 1 : -1);
    }
  });

  const recenter = () => jumpTo();
  window.addEventListener("resize", recenter);
  window.addEventListener("load", recenter);

  paint();
  jumpTo();
}


/* ===== xNinja Skills — icon stepper ===== */
/* Drives the existing carousel via its nav arrows and mirrors its
   active card onto the icons. No changes to the carousel file needed. */
function initSkillsStepper(root = document) {
  const carousel = root.querySelector(".skills__carousel");
  const stepsWrap = root.querySelector(".skills__steps");
  if (!carousel || !stepsWrap) return;

  const track = carousel.querySelector(".skills__track");
  const nextBtn = carousel.querySelector(".skills__nav--next");
  const prevBtn = carousel.querySelector(".skills__nav--prev");
  const steps = Array.from(stepsWrap.querySelectorAll(".skills__step"));
  if (!track || !nextBtn || !prevBtn || steps.length === 0) return;

  // Logical order of skills, taken straight from the stepper markup.
  const order = steps.map((s) => s.dataset.skillKey);

  const activeKey = () => {
    const active = track.querySelector(".skill-card--active");
    return active ? active.dataset.videoKey : order[0];
  };
  const currentIndex = () => {
    const i = order.indexOf(activeKey());
    return i === -1 ? 0 : i;
  };

  // Resolve once the carousel finishes one step (with a safety timeout).
  const waitStep = () =>
    new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        track.removeEventListener("transitionend", onEnd);
        resolve();
      };
      const onEnd = (e) => {
        if (e.propertyName === "transform") finish();
      };
      track.addEventListener("transitionend", onEnd);
      setTimeout(finish, 900); // fallback if no transition fires
    });

  let navigating = false;
  async function goTo(targetIndex) {
    const n = order.length;
    if (navigating || n < 2 || targetIndex === currentIndex()) return;

    navigating = true;
    // Carousel loops, so take the shorter direction.
    const forward = (((targetIndex - currentIndex()) % n) + n) % n;
    const backward = n - forward;
    const btn = forward <= backward ? nextBtn : prevBtn;
    const count = Math.min(forward, backward);

    for (let k = 0; k < count; k++) {
      btn.click();
      await waitStep();
    }
    navigating = false;
  }

  steps.forEach((step) => {
    step.addEventListener("click", () => {
      const target = order.indexOf(step.dataset.skillKey);
      if (target !== -1) goTo(target);
    });
  });

  // Mirror the carousel's active card onto the icons (swipe / arrows / click).
  const syncStepper = () => {
    const key = activeKey();
    steps.forEach((s) =>
      s.classList.toggle("skills__step--active", s.dataset.skillKey === key)
    );
  };

  new MutationObserver(syncStepper).observe(track, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  syncStepper();
}

/* ===== Skills bootstrap — carousel + stepper on desktop only ===== */
const skillsMobileMQL = window.matchMedia("(max-width: 720px)");

function setupSkills() {
  // Phone: leave the cards as a plain stacked list (CSS handles layout).
  if (skillsMobileMQL.matches) return;
  initSkillsCarousel();
  initSkillsStepper();
}

document.addEventListener("DOMContentLoaded", setupSkills);

// Re-run setup when crossing the breakpoint (avoids stale clones/transforms).
skillsMobileMQL.addEventListener("change", () => location.reload());
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // No IntersectionObserver support → just show everything.
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = entry.target.dataset.revealDelay;
        if (delay) entry.target.style.transitionDelay = delay + 'ms';
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target); // animate once
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );

  els.forEach((el) => io.observe(el));
})();