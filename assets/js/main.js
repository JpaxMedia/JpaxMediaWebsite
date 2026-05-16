(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.querySelector("#space-field");
  const pointer = { x: 0, y: 0, active: false };

  if (canvas) {
    const ctx = canvas.getContext("2d");
    const stars = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let raf = 0;
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

      const count = prefersReducedMotion ? 95 : Math.min(260, Math.floor((width * height) / 5600));
      stars.length = 0;

      for (let i = 0; i < count; i += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 0.35 + Math.random() * 1.25,
          r: 0.55 + Math.random() * 1.55,
          vx: -0.08 + Math.random() * 0.16,
          vy: 0.12 + Math.random() * 0.36,
          g: Math.random() > 0.7,
        });
      }
    }

    function drawFlightPath(px, py) {
      const launchX = width * 0.12 + px * 0.7;
      const launchY = height * 0.88 + py * 0.35;
      const apexX = width * 0.48 + px * 1.6;
      const apexY = height * 0.22 + py * 0.9;
      const exitX = width * 0.94 + px * 0.4;
      const exitY = height * 0.16 + py * 0.3;
      const pulse = prefersReducedMotion ? 0.42 : (Math.sin(tick * 0.025) + 1) / 2;

      ctx.save();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = `rgba(74, 222, 128, ${0.16 + pulse * 0.22})`;
      ctx.beginPath();
      ctx.moveTo(launchX, launchY);
      ctx.quadraticCurveTo(apexX, apexY, exitX, exitY);
      ctx.stroke();

      ctx.strokeStyle = "rgba(248, 250, 252, 0.34)";
      ctx.setLineDash([7, 12]);
      ctx.beginPath();
      ctx.moveTo(width * 0.18 + px, height * 0.76 + py * 0.2);
      ctx.quadraticCurveTo(width * 0.58 + px * 1.4, height * 0.34 + py, width * 0.88, height * 0.28);
      ctx.stroke();
      ctx.setLineDash([]);

      const t = prefersReducedMotion ? 0.55 : (tick % 360) / 360;
      const oneMinus = 1 - t;
      const markerX = oneMinus * oneMinus * launchX + 2 * oneMinus * t * apexX + t * t * exitX;
      const markerY = oneMinus * oneMinus * launchY + 2 * oneMinus * t * apexY + t * t * exitY;
      ctx.fillStyle = "rgba(248, 250, 252, 0.92)";
      ctx.shadowColor = "rgba(74, 222, 128, 0.86)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(markerX, markerY, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawHorizon(px, py) {
      const horizonY = height * 0.96 + py * 0.22;

      ctx.save();
      const glow = ctx.createLinearGradient(0, horizonY - height * 0.22, 0, height);
      glow.addColorStop(0, "rgba(56, 189, 248, 0)");
      glow.addColorStop(0.48, "rgba(56, 189, 248, 0.11)");
      glow.addColorStop(0.72, "rgba(74, 222, 128, 0.1)");
      glow.addColorStop(1, "rgba(6, 8, 15, 0.88)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizonY - height * 0.28, width, height * 0.34);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(width * 0.5 + px * 0.55, horizonY, width * 0.58, height * 0.15, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(74, 222, 128, 0.15)";
      ctx.beginPath();
      ctx.ellipse(width * 0.5 + px * 0.42, horizonY + 18, width * 0.75, height * 0.2, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      const grd = ctx.createLinearGradient(0, 0, 0, height);
      grd.addColorStop(0, "#03050A");
      grd.addColorStop(0.45, "#06080F");
      grd.addColorStop(1, "#020407");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      const px = pointer.active ? (pointer.x - width / 2) * 0.018 : 0;
      const py = pointer.active ? (pointer.y - height / 2) * 0.018 : 0;

      for (const star of stars) {
        if (!prefersReducedMotion) {
          star.x += star.vx * star.z + px * 0.002 * star.z;
          star.y += star.vy * star.z + py * 0.002 * star.z;

          if (star.y > height + 8) star.y = -8;
          if (star.x < -8) star.x = width + 8;
          if (star.x > width + 8) star.x = -8;
        }

        ctx.beginPath();
        ctx.fillStyle = star.g ? "rgba(74, 222, 128, 0.82)" : "rgba(248, 250, 252, 0.82)";
        ctx.arc(star.x + px * star.z, star.y + py * star.z, star.r, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReducedMotion && star.z > 1.1) {
          ctx.beginPath();
          ctx.strokeStyle = star.g ? "rgba(74, 222, 128, 0.22)" : "rgba(226, 232, 240, 0.16)";
          ctx.lineWidth = 1;
          ctx.moveTo(star.x + px * star.z, star.y + py * star.z);
          ctx.lineTo(star.x + px * star.z - star.vx * 28, star.y + py * star.z - star.vy * 42);
          ctx.stroke();
        }
      }

      drawFlightPath(px, py);
      drawHorizon(px, py);

      ctx.beginPath();
      ctx.strokeStyle = "rgba(74, 222, 128, 0.24)";
      ctx.lineWidth = 1;
      ctx.ellipse(width * 0.5 + px, height * 0.48 + py, width * 0.32, height * 0.09, -0.18, 0, Math.PI * 2);
      ctx.stroke();

      if (!prefersReducedMotion) {
        tick += 1;
        raf = requestAnimationFrame(draw);
      }
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      const root = document.documentElement;
      const xRatio = (event.clientX / Math.max(width, 1)) - 0.5;
      const yRatio = (event.clientY / Math.max(height, 1)) - 0.5;
      root.style.setProperty("--field-x", `${(xRatio * 18).toFixed(2)}px`);
      root.style.setProperty("--field-y", `${(yRatio * 18).toFixed(2)}px`);
      root.style.setProperty("--tilt-x", `${(xRatio * 4).toFixed(2)}deg`);
      root.style.setProperty("--tilt-y", `${(yRatio * -3).toFixed(2)}deg`);
    }, { passive: true });
    window.addEventListener("pointerleave", () => {
      pointer.active = false;
      const root = document.documentElement;
      root.style.setProperty("--field-x", "0px");
      root.style.setProperty("--field-y", "0px");
      root.style.setProperty("--tilt-x", "0deg");
      root.style.setProperty("--tilt-y", "0deg");
    }, { passive: true });

    resize();
    draw();
  }

  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("open");
        document.body.classList.remove("menu-open");
      });
    });
  }

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

  const quiz = document.querySelector("[data-quiz]");

  if (quiz) {
    const choices = quiz.querySelectorAll("[data-choice]");
    const result = quiz.querySelector("[data-result]");
    const resultTitle = quiz.querySelector("[data-result-title]");
    const resultBody = quiz.querySelector("[data-result-body]");
    const resultLink = quiz.querySelector("[data-result-link]");
    const scores = {};
    const copy = {
      website: {
        title: "Website Foundation",
        body: "Start with a clearer owned website, stronger local trust, and the structure to route leads into the right next step.",
        href: "services.html#starting-points",
      },
      brandweb: {
        title: "Brand + Web Foundation",
        body: "You need the identity and the web system together: sharper positioning, stronger visuals, and a site that supports the business.",
        href: "services.html#starting-points",
      },
      content: {
        title: "Content System",
        body: "Your next system is a repeatable demand engine: content calendar, creative assets, campaign pages, and performance visibility.",
        href: "services.html#create-demand",
      },
      workflow: {
        title: "Workflow Sprint",
        body: "Your pressure is operational. A focused sprint can connect intake, dashboards, automation, and internal tools.",
        href: "services.html#workflow",
      },
      creator: {
        title: "Creator System",
        body: "Elara is the right path when content, sponsor ideas, posting rhythm, and revenue visibility need one operating layer.",
        href: "elara.html",
      },
      partner: {
        title: "Operating Partnership",
        body: "You need ongoing support: reporting, site management, content systems, and operating improvements after launch.",
        href: "services.html#run",
      },
    };

    choices.forEach((choice) => {
      choice.addEventListener("click", () => {
        const group = choice.closest("[data-question]");
        const key = choice.dataset.choice;

        group.querySelectorAll("[data-choice]").forEach((item) => item.classList.remove("active"));
        choice.classList.add("active");
        group.dataset.answer = key;

        Object.keys(scores).forEach((scoreKey) => {
          scores[scoreKey] = 0;
        });

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
