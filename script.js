/* ============================================================
   Wasilah - script.js
   Rebuilt 2026-07-25.

   The live worship tools (browser prayer times, Quran reader,
   99 Names, duas, Hajj/Umrah guide) were removed: the app does
   all of that offline, and the website's job is to get people
   to install it. That also removed the third-party calls to
   api.aladhan.com and api.alquran.cloud.

   Bangla is no longer a JS textContent swap. It is a real page
   at /bn/, so the whole i18n copy object is gone too.

   What is left: store links, the ?download=app router, sticky
   header, scroll reveals, back-to-top, year stamp, copy-link.
   ============================================================ */

const STORE_LINKS = {
  appStore: "https://apps.apple.com/app/id6767919573",
  googlePlay: "https://play.google.com/store/apps/details?id=site.wasilah.wasilah"
};

const isBangla = () => document.documentElement.lang === "bn";

/* ---- Store links ------------------------------------------ */
function applyStoreLinks() {
  [
    ["app-store-link", STORE_LINKS.appStore],
    ["play-store-link", STORE_LINKS.googlePlay]
  ].forEach(([id, url]) => {
    const anchor = document.getElementById(id);
    if (!anchor) return;

    if (url) {
      anchor.href = url;
      anchor.classList.remove("is-muted");
      anchor.removeAttribute("aria-disabled");
      anchor.target = "_blank";
      anchor.rel = "noopener";
      return;
    }

    anchor.href = "#top";
    anchor.classList.add("is-muted");
    anchor.setAttribute("aria-disabled", "true");
    anchor.removeAttribute("target");
    anchor.removeAttribute("rel");
  });
}

/* Sends /?download=app straight to the right store. */
function smartRedirect() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("download") !== "app") return;

  const userAgent = navigator.userAgent || "";
  const isAndroid = /Android/i.test(userAgent);
  const isApple = /iPhone|iPad|iPod|Macintosh/i.test(userAgent);

  if (isAndroid && STORE_LINKS.googlePlay) {
    window.location.assign(STORE_LINKS.googlePlay);
  } else if (isApple && STORE_LINKS.appStore) {
    window.location.assign(STORE_LINKS.appStore);
  }
}

/* ---- Scroll reveals --------------------------------------- */
/* The .reveal opacity rule is gated behind body.motion-ready, which
   only this function adds, so a visitor with no JS sees everything.
   The failsafe below covers the other direction: if the observer
   never fires (restored scroll position, a throttled background tab,
   a proxy browser), show everything anyway rather than leave the
   page looking empty. */
function initScrollReveals() {
  const targets = document.querySelectorAll(
    ".section-copy, .section-head, .guide-card, .cap-tile, .cap-extras li, .deliver-card, .di-copy, .di-step, .reason-card, .faq-list details, .footer-card, .inapp-cta, .site-footer > *"
  );

  if (!targets.length) return;

  document.body.classList.add("motion-ready");

  // Stagger per parent, not per page: each grid choreographs its own
  // children, so a card never waits on a counter from another section.
  const parentCounts = new Map();
  targets.forEach((target) => {
    target.classList.add("reveal");
    const parent = target.parentElement;
    const index = parentCounts.get(parent) || 0;
    parentCounts.set(parent, index + 1);
    target.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 60}ms`);
  });

  const revealAll = () => targets.forEach((target) => target.classList.add("is-visible"));

  if (!("IntersectionObserver" in window)) {
    revealAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  targets.forEach((target) => observer.observe(target));

  // Failsafe: nothing on this page should ever stay invisible.
  window.setTimeout(() => {
    observer.disconnect();
    revealAll();
  }, 4000);
}

/* ---- Header, back to top, year ---------------------------- */
function onScroll(handler) {
  let ticking = false;
  const run = () => {
    handler();
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(run);
    },
    { passive: true }
  );
  handler();
}

function initStickyHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  onScroll(() => header.classList.toggle("is-scrolled", window.scrollY > 24));
}

function initBackToTop() {
  const button = document.getElementById("back-to-top");
  if (!button) return;

  onScroll(() => button.classList.toggle("is-visible", window.scrollY > 600));

  button.addEventListener("click", () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
}

/* ---- Mobile nav disclosure -------------------------------- */
function initMobileNav() {
  const nav = document.querySelector(".mobile-nav");
  if (!nav) return;
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) nav.removeAttribute("open");
  });
}

function initYearStamp() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

/* ---- Copy-link share button ------------------------------- */
function initCopyLink() {
  document.querySelectorAll('[data-share="copy"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copyText || window.location.href;
      const label = btn.querySelector(".copy-label");
      const original = label ? label.textContent : "";
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add("is-copied");
        if (label) label.textContent = isBangla() ? "কপি হয়েছে" : "Copied!";
      } catch {
        if (label) label.textContent = (isBangla() ? "কপি করুন: " : "Copy: ") + text;
      }
      window.setTimeout(() => {
        btn.classList.remove("is-copied");
        if (label) label.textContent = original;
      }, 2200);
    });
  });
}

/* ---- Boot ------------------------------------------------- */
function init() {
  smartRedirect();
  applyStoreLinks();
  initStickyHeader();
  initBackToTop();
  initMobileNav();
  initYearStamp();
  initCopyLink();
  initScrollReveals();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
