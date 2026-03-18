const yearNode = document.getElementById("year");
const progressBar = document.getElementById("scroll-progress-bar");
const sectionNodes = Array.from(document.querySelectorAll("[data-section]"));
const navLinks = Array.from(document.querySelectorAll(".topnav a"));
const topbar = document.querySelector(".topbar");
const backToTop = document.getElementById("back-to-top");

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const parallaxNodes = Array.from(document.querySelectorAll("[data-parallax]"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const compactViewport = window.matchMedia("(max-width: 900px)");
let ticking = false;
let scrollUiTicking = false;

const applyParallax = () => {
  ticking = false;

  if (reducedMotion.matches || compactViewport.matches) {
    for (const node of parallaxNodes) {
      node.style.transform = "";
    }
    return;
  }

  const viewportHeight = window.innerHeight || 1;

  for (const node of parallaxNodes) {
    const speed = Number(node.getAttribute("data-parallax-speed") || "0");
    const rect = node.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;
    const offset = (elementCenter - viewportCenter) * speed;
    node.style.transform = `translate3d(0, ${offset}px, 0)`;
  }
};

const queueParallax = () => {
  if (ticking) {
    return;
  }

  ticking = true;
  window.requestAnimationFrame(applyParallax);
};

if (parallaxNodes.length > 0) {
  applyParallax();
  window.addEventListener("scroll", queueParallax, { passive: true });
  window.addEventListener("resize", queueParallax);
  reducedMotion.addEventListener("change", queueParallax);
  compactViewport.addEventListener("change", queueParallax);
}

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
            }
          }
        },
        {
          threshold: 0.16,
          rootMargin: "0px 0px -10% 0px",
        },
      )
    : null;

for (const section of sectionNodes) {
  if (revealObserver) {
    revealObserver.observe(section);
  } else {
    section.classList.add("is-visible");
  }
}

const updateScrollProgress = () => {
  if (!progressBar) {
    return;
  }

  const scrollTop = window.scrollY || window.pageYOffset;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
  progressBar.style.width = `${progress * 100}%`;
};

const updateActiveNav = () => {
  const viewportMarker = window.innerHeight * 0.28;
  let activeId = "";

  for (const section of sectionNodes) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= viewportMarker && rect.bottom >= viewportMarker) {
      activeId = section.id;
      break;
    }
  }

  for (const link of navLinks) {
    const target = link.getAttribute("href")?.replace("#", "") || "";
    link.classList.toggle("is-active", target === activeId);
    if (target === activeId) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
};

const updateScrollUi = () => {
  scrollUiTicking = false;
  updateScrollProgress();
  updateActiveNav();
  const scrollTop = window.scrollY || window.pageYOffset;
  topbar?.classList.toggle("is-scrolled", scrollTop > 18);
  backToTop?.classList.toggle("is-visible", scrollTop > 640);
};

const queueScrollUi = () => {
  if (scrollUiTicking) {
    return;
  }

  scrollUiTicking = true;
  window.requestAnimationFrame(updateScrollUi);
};

updateScrollUi();
window.addEventListener("scroll", queueScrollUi, { passive: true });
window.addEventListener("resize", queueScrollUi);
