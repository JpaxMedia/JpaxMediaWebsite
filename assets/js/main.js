(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const body = document.body;

  const preventZoom = (event) => {
    if (event.cancelable) event.preventDefault();
  };

  document.addEventListener("touchmove", (event) => {
    if (event.touches.length > 1) preventZoom(event);
  }, { passive: false });

  document.addEventListener("gesturestart", preventZoom, { passive: false });
  document.addEventListener("gesturechange", preventZoom, { passive: false });

  let lastTouchEnd = 0;
  document.addEventListener("touchend", (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) preventZoom(event);
    lastTouchEnd = now;
  }, { passive: false });

  /* ====================================================================
     Starfield + slow flight path + horizon glow
     ==================================================================== */
  const canvas = document.querySelector("#space-field");
  const pointer = { x: 0, y: 0, active: false };

  if (canvas) {
    const ctx = canvas.getContext("2d");
    const stars = [];
    const layers = [
      { count: 0.50, speedY: 0.03, size: [0.4, 0.9], green: 0.12 },
      { count: 0.35, speedY: 0.11, size: [0.7, 1.3], green: 0.16 },
      { count: 0.15, speedY: 0.26, size: [1.0, 1.8], green: 0.22 },
    ];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let tick = 0;

    function resize() {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const baseCount = prefersReducedMotion
        ? 100
        : Math.min(300, Math.floor((width * height) / 5200));
      stars.length = 0;

      layers.forEach((layer) => {
        const n = Math.floor(baseCount * layer.count);
        for (let i = 0; i < n; i += 1) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: layer.speedY,
            r: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
            vx: -0.03 + Math.random() * 0.06,
            vy: 0.5 + Math.random() * 0.5,
            tw: Math.random() * Math.PI * 2,
            g: Math.random() < layer.green,
          });
        }
      });
    }

    function drawHorizon(px, py) {
      const horizonY = height * 0.97 + py * 0.22;
      ctx.save();
      const glow = ctx.createLinearGradient(0, horizonY - height * 0.26, 0, height);
      glow.addColorStop(0, "rgba(56, 189, 248, 0)");
      glow.addColorStop(0.46, "rgba(56, 189, 248, 0.09)");
      glow.addColorStop(0.72, "rgba(74, 222, 128, 0.08)");
      glow.addColorStop(1, "rgba(4, 6, 11, 0.6)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizonY - height * 0.32, width, height * 0.36);
      ctx.restore();
    }

    function drawFlightPath(px, py) {
      const launchX = width * 0.04 + px * 0.7;
      const launchY = height * 0.92 + py * 0.35;
      const apexX = width * 0.46 + px * 1.6;
      const apexY = height * 0.18 + py * 0.9;
      const exitX = width * 0.98 + px * 0.4;
      const exitY = height * 0.12 + py * 0.3;

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(74, 222, 128, 0.18)";
      ctx.beginPath();
      ctx.moveTo(launchX, launchY);
      ctx.quadraticCurveTo(apexX, apexY, exitX, exitY);
      ctx.stroke();

      const t = prefersReducedMotion ? 0.55 : (tick % 600) / 600;
      const om = 1 - t;
      const mx = om * om * launchX + 2 * om * t * apexX + t * t * exitX;
      const my = om * om * launchY + 2 * om * t * apexY + t * t * exitY;
      ctx.fillStyle = "rgba(248, 250, 252, 0.95)";
      ctx.shadowColor = "rgba(74, 222, 128, 0.85)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      const grd = ctx.createLinearGradient(0, 0, 0, height);
      grd.addColorStop(0, "rgba(2, 4, 10, 0.5)");
      grd.addColorStop(0.45, "rgba(5, 8, 15, 0.36)");
      grd.addColorStop(1, "rgba(1, 3, 7, 0.5)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      const px = pointer.active ? (pointer.x - width / 2) * 0.012 : 0;
      const py = pointer.active ? (pointer.y - height / 2) * 0.012 : 0;

      for (const star of stars) {
        if (!prefersReducedMotion) {
          star.x += star.vx * (star.z * 4) + px * 0.002 * (star.z * 10);
          star.y += star.vy * star.z + py * 0.002 * (star.z * 10);
          star.tw += 0.024 + star.z * 0.04;

          if (star.y > height + 8) star.y = -8;
          if (star.x < -8) star.x = width + 8;
          if (star.x > width + 8) star.x = -8;
        }

        const tw = 0.72 + 0.28 * Math.sin(star.tw);
        ctx.beginPath();
        ctx.fillStyle = star.g
          ? `rgba(74, 222, 128, ${0.55 * tw})`
          : `rgba(248, 250, 252, ${0.7 * tw})`;
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      drawFlightPath(px, py);
      drawHorizon(px, py);

      if (!prefersReducedMotion) {
        tick += 1;
        requestAnimationFrame(draw);
      }
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }, { passive: true });
    window.addEventListener("pointerleave", () => { pointer.active = false; }, { passive: true });

    resize();
    draw();
  }

  /* ====================================================================
     Magnetic CTA hover (gentle)
     ==================================================================== */
  if (!prefersReducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      let raf = 0;
      el.addEventListener("pointermove", (event) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const dx = ((event.clientX - rect.left) / rect.width - 0.5) * 6;
          const dy = ((event.clientY - rect.top) / rect.height - 0.5) * 4;
          el.style.transform = `translate(${dx}px, ${dy}px)`;
          raf = 0;
        });
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ====================================================================
     Scroll progress bar
     ==================================================================== */
  const updateScroll = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
    root.style.setProperty("--scroll-progress", pct.toFixed(2));
  };
  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", updateScroll, { passive: true });

  /* ====================================================================
     Nav toggle
     ==================================================================== */
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("open", !isOpen);
      body.classList.toggle("menu-open", !isOpen);
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("open");
        body.classList.remove("menu-open");
      });
    });
  }

  /* ====================================================================
     Reveal on scroll
     ==================================================================== */
  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length && "IntersectionObserver" in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ====================================================================
     Telemetry counters on the home hero
     ==================================================================== */
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length && "IntersectionObserver" in window) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.target || "0");
      const suffix = el.dataset.suffix || "";
      const out = el.querySelector("[data-counter-out]");
      if (!out) return;
      const isFloat = !Number.isInteger(target);
      const dur = 1200;
      const start = performance.now();
      const tickFn = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const v = target * eased;
        out.textContent = (isFloat ? v.toFixed(2) : Math.round(v)) + suffix;
        if (t < 1) requestAnimationFrame(tickFn);
      };
      requestAnimationFrame(tickFn);
    };

    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach((el) => {
      const out = el.querySelector("[data-counter-out]");
      if (out) out.textContent = (el.dataset.target || "0") + (el.dataset.suffix || "");
    });
  }

  /* ====================================================================
     Quiz
     ==================================================================== */
  const quiz = document.querySelector("[data-quiz]");
  if (quiz) {
    const choices = quiz.querySelectorAll("[data-choice]");
    const result = quiz.querySelector("[data-result]");
    const resultTitle = quiz.querySelector("[data-result-title]");
    const resultBody = quiz.querySelector("[data-result-body]");
    const resultLink = quiz.querySelector("[data-result-link]");
    const scores = {};
    const copy = {
      website: { title: "Website Foundation", body: "Start with a clearer owned website, stronger local trust, and the structure to route leads into the right next step.", href: "services.html#starting-points" },
      brandweb: { title: "Brand + Web Foundation", body: "You need the identity and the web system together: sharper positioning, stronger visuals, and a site that supports the business.", href: "services.html#starting-points" },
      content: { title: "Content System", body: "Your next system is a repeatable demand engine: content calendar, creative assets, campaign pages, and performance visibility.", href: "services.html#create-demand" },
      workflow: { title: "Workflow Sprint", body: "Your pressure is operational. A focused sprint can connect intake, dashboards, automation, and internal tools.", href: "services.html#workflow" },
      tradeos: { title: "TradeOS", body: "You need the trades and home-services operating layer: lead flow, follow-up, reporting, content rhythm, and operational visibility in one system.", href: "tradeos.html" },
      creator: { title: "Creator System", body: "Elara is the right path when content, sponsor ideas, posting rhythm, and revenue visibility need one operating layer.", href: "elara.html" },
      partner: { title: "Operating Partnership", body: "You need ongoing support: reporting, site management, content systems, and operating improvements after launch.", href: "services.html#run" },
    };

    choices.forEach((choice) => {
      choice.addEventListener("click", () => {
        const group = choice.closest("[data-question]");
        const key = choice.dataset.choice;
        group.querySelectorAll("[data-choice]").forEach((item) => item.classList.remove("active"));
        choice.classList.add("active");
        group.dataset.answer = key;
        Object.keys(scores).forEach((scoreKey) => { scores[scoreKey] = 0; });
        quiz.querySelectorAll("[data-question]").forEach((question) => {
          if (question.dataset.answer) {
            scores[question.dataset.answer] = (scores[question.dataset.answer] || 0) + 1;
          }
        });
        const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (best && result && copy[best]) {
          result.hidden = false;
          resultTitle.textContent = copy[best].title;
          resultBody.textContent = copy[best].body;
          resultLink.href = copy[best].href;
        }
      });
    });
  }
})();
