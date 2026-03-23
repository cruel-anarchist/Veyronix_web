const yearNode = document.getElementById("year");
const progressBar = document.getElementById("scroll-progress-bar");
const sectionNodes = Array.from(document.querySelectorAll("[data-section]"));
const navLinks = Array.from(document.querySelectorAll(".topnav a"));
const topbar = document.querySelector(".topbar");
const backToTop = document.getElementById("back-to-top");
const parallaxNodes = Array.from(
  document.querySelectorAll(
    ".hero-brand-banner, .parallax-orb, .scroll-signal, .value-strip, .workflow-intro-card, .feature-highlight, .convenience-badge-row",
  ),
);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const compactViewport = window.matchMedia("(max-width: 900px)");
let scrollUiTicking = false;
let parallaxFrame = 0;

const parallaxState = parallaxNodes.map((node) => ({
  node,
  baseCenter: 0,
  current: 0,
  target: 0,
}));

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const updateParallaxMetrics = () => {
  const scrollTop = window.scrollY || window.pageYOffset;

  for (const item of parallaxState) {
    const rect = item.node.getBoundingClientRect();
    item.baseCenter = scrollTop + rect.top + rect.height / 2;
  }
};

const applyParallax = () => {
  if (reducedMotion.matches || compactViewport.matches) {
    for (const item of parallaxState) {
      item.current = 0;
      item.target = 0;
      item.node.style.transform = "";
    }
    parallaxFrame = 0;
    return;
  }

  const scrollTop = window.scrollY || window.pageYOffset;
  const viewportHeight = window.innerHeight || 1;
  const viewportCenter = scrollTop + viewportHeight / 2;
  let needsNextFrame = false;

  for (const item of parallaxState) {
    const speed = Number(item.node.getAttribute("data-parallax-speed") || "0");
    item.target = (item.baseCenter - viewportCenter) * speed;
    item.current += (item.target - item.current) * 0.12;

    if (Math.abs(item.target - item.current) > 0.12) {
      needsNextFrame = true;
    } else {
      item.current = item.target;
    }

    item.node.style.transform = `translate3d(0, ${item.current.toFixed(2)}px, 0)`;
  }

  if (needsNextFrame) {
    parallaxFrame = window.requestAnimationFrame(applyParallax);
  } else {
    parallaxFrame = 0;
  }
};

const queueParallax = () => {
  if (parallaxFrame) {
    return;
  }

  parallaxFrame = window.requestAnimationFrame(applyParallax);
};

if (parallaxNodes.length > 0) {
  updateParallaxMetrics();
  applyParallax();
  window.addEventListener("scroll", queueParallax, { passive: true });
  window.addEventListener("resize", () => {
    updateParallaxMetrics();
    queueParallax();
  });
  reducedMotion.addEventListener("change", () => {
    updateParallaxMetrics();
    queueParallax();
  });
  compactViewport.addEventListener("change", () => {
    updateParallaxMetrics();
    queueParallax();
  });
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
  progressBar.style.transform = `scaleX(${progress})`;
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

const leadForm = document.getElementById("lead-form");
const formStatus = document.getElementById("form-status");

if (leadForm) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const recipient = leadForm.getAttribute("data-recipient") || "sales@veyronix.ru";
    const formData = new FormData(leadForm);
    const name = String(formData.get("name") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !contact) {
      if (formStatus) {
        formStatus.textContent = "Заполните имя и контакт для связи.";
      }
      return;
    }

    const subject = encodeURIComponent(`Запрос демо Veyronix — ${company || name}`);
    const body = encodeURIComponent(
      [
        "Новая заявка с сайта Veyronix",
        "",
        `Имя: ${name}`,
        `Контакт: ${contact}`,
        `Сервис: ${company || "не указано"}`,
        "",
        "Что важно показать на демонстрации:",
        message || "Не указано",
      ].join("\n"),
    );

    if (formStatus) {
        formStatus.textContent = "Открываю почтовый клиент для отправки заявки...";
    }

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });
}
