// js/skill-video.js
// Muted autoplay-on-scroll with transport controls (back / play-pause / forward)
// and a hybrid unmute toggle. Reusable across all skill cards; carousel-safe.

(function () {
  const PLAY_THRESHOLD = 0.6;
  const SKIP_SECONDS = 10; // back/forward step — tune for your clip length
  let soundOn = false; // shared preference across every skill video
  let io;

  const getVideos = () =>
    Array.from(document.querySelectorAll(".skill_section__media"));

  function applySoundState() {
    getVideos().forEach((v) => {
      v.muted = !soundOn;
    });
    document.querySelectorAll("[data-sound-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(soundOn));
      btn.setAttribute("aria-label", soundOn ? "Mute sound" : "Turn on sound");
    });
  }

  // keep the play/pause button icon synced to the real video state
  function bindVideoState(video) {
    if (video.dataset.bound) return;
    video.dataset.bound = "true";
    const toggle = video
      .closest(".skill_section__video")
      ?.querySelector("[data-skill-playpause]");
    const reflect = () => {
      if (!toggle) return;
      const playing = !video.paused;
      toggle.dataset.playing = String(playing);
      toggle.setAttribute("aria-label", playing ? "Pause" : "Play");
    };
    video.addEventListener("play", reflect);
    video.addEventListener("pause", reflect);
    reflect();
  }

  function observeNew() {
    if (!io) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
              if (!video.dataset.loaded) {
                video.load();
                video.dataset.loaded = "true";
              }
              video.muted = !soundOn;
              if (video.dataset.userPaused !== "true") {
                video.play().catch(() => {});
              }
            } else {
              video.pause(); // auto-pause off-screen (not a user pause)
            }
          });
        },
        { threshold: PLAY_THRESHOLD },
      );
    }
    getVideos().forEach((v) => {
      if (v.dataset.observed) return;
      v.dataset.observed = "true";
      io.observe(v);
    });
  }

  // delegated so it works for clones injected at any time
  document.addEventListener("click", (e) => {
    const wrap = e.target.closest(".skill_section__video");
    if (!wrap) return;
    const video = wrap.querySelector(".skill_section__media");
    if (!video) return;

    if (e.target.closest("[data-sound-toggle]")) {
      soundOn = !soundOn; // the click is the gesture browsers need for audio
      applySoundState();
      video.play().catch(() => {});
    } else if (e.target.closest("[data-skill-playpause]")) {
      if (video.paused) {
        video.dataset.userPaused = "false";
        video.play().catch(() => {});
      } else {
        video.dataset.userPaused = "true"; // remember manual pause
        video.pause();
      }
    } else if (e.target.closest("[data-skill-back]")) {
      video.currentTime = Math.max(0, video.currentTime - SKIP_SECONDS);
    } else if (e.target.closest("[data-skill-forward]")) {
      const dur = isFinite(video.duration) ? video.duration : Infinity;
      video.currentTime = Math.min(dur, video.currentTime + SKIP_SECONDS);
    }
  });

  function init() {
    applySoundState();
    getVideos().forEach(bindVideoState);
    observeNew();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.initSkillVideo = init; // re-runnable after carousel cloning (idempotent)
})();
