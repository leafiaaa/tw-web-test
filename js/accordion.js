/* ===========================
   USE CASE — manual accordion
=========================== */
(function () {
  const root = document.getElementById("usecaseFeatures");
  if (!root) return;

  const features = Array.from(root.querySelectorAll(".uc-feature"));
  if (!features.length) return;

  function open(i) {
    features.forEach((f, j) => {
      const isOpen = j === i;
      f.classList.toggle("is-open", isOpen);
      const tab = f.querySelector(".uc-feature__tab");
      if (tab) tab.setAttribute("aria-expanded", String(isOpen));
    });
  }

  features.forEach((f, i) => {
    const tab = f.querySelector(".uc-feature__tab");
    if (!tab) return;
    tab.addEventListener("click", () => {
      const isCurrentlyOpen = f.classList.contains("is-open");
      // close all first, then open clicked one (unless it was already open)
      open(isCurrentlyOpen ? -1 : i);
    });
  });
})();