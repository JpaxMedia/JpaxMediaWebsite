(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const body = document.body;

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const siteNav = document.querySelector("[data-site-nav]");

  if (menuToggle && siteNav) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      siteNav.classList.remove("open");
      body.classList.remove("menu-open");
    };

    menuToggle.addEventListener("click", () => {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
      siteNav.classList.toggle("open", willOpen);
      body.classList.toggle("menu-open", willOpen);
    });

    siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const updateScroll = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
    root.style.setProperty("--scroll-progress", progress.toFixed(2));
  };

  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", updateScroll, { passive: true });

  const revealItems = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!reducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.1 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const canvas = document.querySelector("#space-field");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const stars = [];
  let width = 0;
  let height = 0;
  let frame = 0;

  const resizeCanvas = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const starCount = reducedMotion ? 70 : Math.min(190, Math.floor((width * height) / 6800));
    stars.length = 0;
    for (let index = 0; index < starCount; index += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.35 + Math.random() * 1.15,
        speed: 0.025 + Math.random() * 0.09,
        phase: Math.random() * Math.PI * 2,
        green: Math.random() < 0.16,
      });
    }
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);

    const wash = context.createLinearGradient(0, 0, 0, height);
    wash.addColorStop(0, "rgba(2, 4, 10, 0.18)");
    wash.addColorStop(1, "rgba(4, 8, 14, 0.42)");
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);

    stars.forEach((star) => {
      if (!reducedMotion) {
        star.y += star.speed;
        star.phase += 0.016;
        if (star.y > height + 4) star.y = -4;
      }
      const opacity = 0.4 + 0.26 * Math.sin(star.phase);
      context.beginPath();
      context.fillStyle = star.green
        ? `rgba(74, 222, 128, ${opacity})`
        : `rgba(226, 232, 240, ${opacity})`;
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });

    if (!reducedMotion) {
      frame += 1;
      if (frame < Number.MAX_SAFE_INTEGER) window.requestAnimationFrame(draw);
    }
  };

  resizeCanvas();
  draw();
  window.addEventListener("resize", resizeCanvas, { passive: true });
})();
