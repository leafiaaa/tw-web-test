(function () {
  // ── 1. Fetch and inject navbar ──────────────────────────────
  const placeholder = document.getElementById("navbar-placeholder");
  if (placeholder) {
    fetch("./components/navbar.html")
      .then((res) => res.text())
      .then((html) => {
        placeholder.innerHTML = html;
        initNavbar();
      })
      .catch((err) => console.error("Navbar load failed:", err));
  }

  // ── 1b. Fetch and inject footer ────────────────────────────
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) {
    fetch("./components/footer.html")
      .then((res) => res.text())
      .then((html) => {
        footerPlaceholder.innerHTML = html;
      })
      .catch((err) => console.error("Footer load failed:", err));
  }

  // ── 2. Init all interactions ────────────────────────────────
  function initNavbar() {
    initLangDropdown();
    initHamburger();
    highlightActiveLink();
    initScrollFrost();
  }
  // Frost navbar on scroll
  function initScrollFrost() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
      navbar.style.background = "rgba(255, 255, 255, 0.85)";
    });
  }

  function initMegaMenu(root = document) {
    const item = root.querySelector(".navbar__has-mega");
    if (!item) return;
    const trigger = item.querySelector(".navbar__products-trigger");
    if (!trigger) return;

    const open = () => {
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      item.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };

    // Tap/click toggles (so touch users can open it instead of navigating away)
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      item.classList.contains("is-open") ? close() : open();
    });

    // Close on outside click and on Escape
    document.addEventListener("click", (e) => {
      if (!item.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  // Language dropdown
  function initLangDropdown() {
    const toggle = document.getElementById("langToggle");
    const dropdown = document.getElementById("langDropdown");
    const currentLabel = document.getElementById("langCurrent");
    if (!toggle || !dropdown) return;

    toggle.addEventListener("click", () => {
      const isOpen = dropdown.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen);
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", false);
      }
    });

    // Language selection — desktop + drawer
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        currentLabel.textContent = btn.textContent.trim();
        dropdown.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", false);

        // Navigate to appropriate page based on language
        if (lang === "tw") {
          window.location.href = "/tw.html";
        } else if (lang === "en") {
          window.location.href = "/index.html";
        }
      });
    });

    // Reflect current lang in label on load
    const params = new URLSearchParams(window.location.search);
    const activeLang = params.get("lang") || "en";
    const map = { en: "EN", tw: "TW", th: "TH", idn: "IDN" };
    if (map[activeLang]) currentLabel.textContent = map[activeLang];
  }

  // Hamburger / drawer
  function initHamburger() {
    const hamburger = document.getElementById("hamburger");
    const drawer = document.getElementById("navDrawer");
    const overlay = document.getElementById("navOverlay");
    if (!hamburger || !drawer) return;

    function openDrawer() {
      drawer.classList.add("is-open");
      overlay.classList.add("is-open");
    }

    function closeDrawer() {
      drawer.classList.remove("is-open");
      overlay.classList.remove("is-open");
    }

    hamburger.addEventListener("click", () => {
      drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
    });

    overlay.addEventListener("click", closeDrawer);
  }

  // Highlight active nav link
  function highlightActiveLink() {
    const links = document.querySelectorAll(
      ".navbar__links a, .navbar__drawer a",
    );
    const current = window.location.pathname;
    links.forEach((link) => {
      if (link.getAttribute("href") === current) {
        link.style.color = "#1a5ce5";
        link.style.fontWeight = "600";
      }
    });
  }
})();
