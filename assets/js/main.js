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

    function resize() {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const count = prefersReducedMotion ? 70 : Math.min(180, Math.floor((width * height) / 8200));
      stars.length = 0;

      for (let i = 0; i < count; i += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 0.35 + Math.random() * 1.25,
          r: 0.5 + Math.random() * 1.3,
          vx: -0.05 + Math.random() * 0.1,
          vy: 0.08 + Math.random() * 0.28,
          g: Math.random() > 0.78,
        });
      }
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
        ctx.fillStyle = star.g ? "rgba(74, 222, 128, 0.72)" : "rgba(248, 250, 252, 0.72)";
        ctx.arc(star.x + px * star.z, star.y + py * star.z, star.r, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReducedMotion && star.z > 1.1) {
          ctx.beginPath();
          ctx.strokeStyle = star.g ? "rgba(74, 222, 128, 0.14)" : "rgba(226, 232, 240, 0.1)";
          ctx.lineWidth = 1;
          ctx.moveTo(star.x + px * star.z, star.y + py * star.z);
          ctx.lineTo(star.x + px * star.z - star.vx * 28, star.y + py * star.z - star.vy * 42);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.strokeStyle = "rgba(74, 222, 128, 0.12)";
      ctx.lineWidth = 1;
      ctx.ellipse(width * 0.5 + px, height * 0.48 + py, width * 0.28, height * 0.08, -0.18, 0, Math.PI * 2);
      ctx.stroke();

      if (!prefersReducedMotion) {
        raf = requestAnimationFrame(draw);
      }
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }, { passive: true });
    window.addEventListener("pointerleave", () => {
      pointer.active = false;
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
