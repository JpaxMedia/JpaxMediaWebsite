(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const body = document.body;

  /* ====================================================================
     Starfield + flight path canvas
     ==================================================================== */
  const canvas = document.querySelector("#space-field");
  const pointer = { x: 0, y: 0, active: false };

  if (canvas) {
    const ctx = canvas.getContext("2d");
    const stars = [];
    const layers = [
      { count: 0.45, speedY: 0.04, speedX: 0.01, size: [0.4, 0.9],  green: 0.18 },
      { count: 0.35, speedY: 0.14, speedX: 0.02, size: [0.7, 1.4],  green: 0.22 },
      { count: 0.20, speedY: 0.32, speedX: 0.03, size: [1.0, 2.0],  green: 0.32 },
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
        ? 110
        : Math.min(360, Math.floor((width * height) / 4400));
      stars.length = 0;

      layers.forEach((layer) => {
        const n = Math.floor(baseCount * layer.count);
        for (let i = 0; i < n; i += 1) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: layer.speedY,
            zx: layer.speedX,
            r: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
            vx: -0.04 + Math.random() * 0.08,
            vy: 0.6 + Math.random() * 0.6,
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
      glow.addColorStop(0.46, "rgba(56, 189, 248, 0.12)");
      glow.addColorStop(0.72, "rgba(74, 222, 128, 0.1)");
      glow.addColorStop(1, "rgba(4, 6, 11, 0.92)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizonY - height * 0.32, width, height * 0.36);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.32)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(width * 0.5 + px * 0.55, horizonY, width * 0.6, height * 0.16, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(74, 222, 128, 0.16)";
      ctx.beginPath();
      ctx.ellipse(width * 0.5 + px * 0.42, horizonY + 18, width * 0.75, height * 0.2, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    function drawFlightPath(px, py) {
      const launchX = width * 0.04 + px * 0.7;
      const launchY = height * 0.92 + py * 0.35;
      const apexX = width * 0.46 + px * 1.6;
      const apexY = height * 0.18 + py * 0.9;
      const exitX = width * 0.98 + px * 0.4;
      const exitY = height * 0.12 + py * 0.3;
      const pulse = prefersReducedMotion ? 0.4 : (Math.sin(tick * 0.022) + 1) / 2;

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(74, 222, 128, ${0.14 + pulse * 0.18})`;
      ctx.beginPath();
      ctx.moveTo(launchX, launchY);
      ctx.quadraticCurveTo(apexX, apexY, exitX, exitY);
      ctx.stroke();

      ctx.strokeStyle = "rgba(248, 250, 252, 0.28)";
      ctx.setLineDash([6, 12]);
      ctx.beginPath();
      ctx.moveTo(width * 0.12 + px, height * 0.78 + py * 0.2);
      ctx.quadraticCurveTo(width * 0.6 + px * 1.4, height * 0.32 + py, width * 0.94, height * 0.22);
      ctx.stroke();
      ctx.setLineDash([]);

      const t = prefersReducedMotion ? 0.55 : (tick % 480) / 480;
      const om = 1 - t;
      const mx = om * om * launchX + 2 * om * t * apexX + t * t * exitX;
      const my = om * om * launchY + 2 * om * t * apexY + t * t * exitY;
      ctx.fillStyle = "rgba(248, 250, 252, 0.96)";
      ctx.shadowColor = "rgba(74, 222, 128, 0.92)";
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(mx, my, 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(74, 222, 128, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      const trailT = Math.max(0, t - 0.06);
      const om2 = 1 - trailT;
      const tx = om2 * om2 * launchX + 2 * om2 * trailT * apexX + trailT * trailT * exitX;
      const ty = om2 * om2 * launchY + 2 * om2 * trailT * apexY + trailT * trailT * exitY;
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Semi-transparent fill so the body::before color glow bleeds through.
      const grd = ctx.createLinearGradient(0, 0, 0, height);
      grd.addColorStop(0, "rgba(2, 4, 10, 0.55)");
      grd.addColorStop(0.45, "rgba(5, 8, 15, 0.42)");
      grd.addColorStop(1, "rgba(1, 3, 7, 0.55)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      const px = pointer.active ? (pointer.x - width / 2) * 0.018 : 0;
      const py = pointer.active ? (pointer.y - height / 2) * 0.018 : 0;

      for (const star of stars) {
        if (!prefersReducedMotion) {
          star.x += star.vx * (star.z * 4) + px * 0.0035 * (star.z * 12);
          star.y += star.vy * star.z + py * 0.0035 * (star.z * 12);
          star.tw += 0.03 + star.z * 0.05;

          if (star.y > height + 8) star.y = -8;
          if (star.x < -8) star.x = width + 8;
          if (star.x > width + 8) star.x = -8;
        }

        const tw = 0.7 + 0.3 * Math.sin(star.tw);
        ctx.beginPath();
        ctx.fillStyle = star.g
          ? `rgba(74, 222, 128, ${0.65 * tw})`
          : `rgba(248, 250, 252, ${0.78 * tw})`;
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReducedMotion && star.z > 0.2 && star.r > 1.4) {
          ctx.beginPath();
          ctx.strokeStyle = star.g
            ? "rgba(74, 222, 128, 0.22)"
            : "rgba(226, 232, 240, 0.16)";
          ctx.lineWidth = 1;
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x - star.vx * 26, star.y - star.vy * 38 * star.z * 6);
          ctx.stroke();
        }
      }

      drawFlightPath(px, py);
      drawHorizon(px, py);

      ctx.beginPath();
      ctx.strokeStyle = "rgba(74, 222, 128, 0.22)";
      ctx.lineWidth = 1;
      ctx.ellipse(width * 0.5 + px, height * 0.5 + py, width * 0.34, height * 0.1, -0.18, 0, Math.PI * 2);
      ctx.stroke();

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
      const xRatio = (event.clientX / Math.max(width, 1)) - 0.5;
      const yRatio = (event.clientY / Math.max(height, 1)) - 0.5;
      root.style.setProperty("--field-x", `${(xRatio * 22).toFixed(2)}px`);
      root.style.setProperty("--field-y", `${(yRatio * 22).toFixed(2)}px`);
      root.style.setProperty("--tilt-x", `${(xRatio * 4).toFixed(2)}deg`);
      root.style.setProperty("--tilt-y", `${(yRatio * -3).toFixed(2)}deg`);
    }, { passive: true });
    window.addEventListener("pointerleave", () => {
      pointer.active = false;
      root.style.setProperty("--field-x", "0px");
      root.style.setProperty("--field-y", "0px");
      root.style.setProperty("--tilt-x", "0deg");
      root.style.setProperty("--tilt-y", "0deg");
    }, { passive: true });

    resize();
    draw();
  }

  /* ====================================================================
     Cursor reticle
     ==================================================================== */
  const reticle = document.querySelector("[data-cursor]");
  if (reticle && !window.matchMedia("(pointer: coarse)").matches) {
    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;
    let tx = rx;
    let ty = ry;

    window.addEventListener("pointermove", (event) => {
      tx = event.clientX;
      ty = event.clientY;
      body.classList.add("cursor-on");
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      body.classList.remove("cursor-on");
    }, { passive: true });

    const targetSelector = "a, button, [data-magnetic], [data-tilt], .profile-card, .hud-card, .fleet-card, .log-card, .lane-card, .seq-stage";
    document.addEventListener("pointerover", (event) => {
      if (event.target.closest(targetSelector)) {
        body.classList.add("cursor-target");
      }
    });
    document.addEventListener("pointerout", (event) => {
      if (event.target.closest(targetSelector)) {
        body.classList.remove("cursor-target");
      }
    });

    const animateReticle = () => {
      rx += (tx - rx) * 0.22;
      ry += (ty - ry) * 0.22;
      root.style.setProperty("--cursor-x", `${rx}px`);
      root.style.setProperty("--cursor-y", `${ry}px`);
      requestAnimationFrame(animateReticle);
    };
    animateReticle();
  }

  /* ====================================================================
     Mission clock — counts up from JPAX founding (Jan 1, 2024)
     ==================================================================== */
  const clockEl = document.querySelector("[data-mission-clock]");
  if (clockEl) {
    const epoch = new Date("2024-01-01T00:00:00Z").getTime();
    const tickClock = () => {
      const diff = Math.max(0, Date.now() - epoch);
      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      const pad = (n, l = 2) => String(n).padStart(l, "0");
      clockEl.textContent = `T+ ${pad(days, 3)}:${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    };
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* ====================================================================
     Magnetic CTA hover
     ==================================================================== */
  if (!prefersReducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      let raf = 0;
      el.addEventListener("pointermove", (event) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const dx = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
          const dy = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
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
     Card tilt on hover (light, performant)
     ==================================================================== */
  if (!prefersReducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      let raf = 0;
      el.addEventListener("pointermove", (event) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const cx = (event.clientX - rect.left) / rect.width - 0.5;
          const cy = (event.clientY - rect.top) / rect.height - 0.5;
          el.style.setProperty("--tilt-x", `${(cx * 6).toFixed(2)}deg`);
          el.style.setProperty("--tilt-y", `${(-cy * 6).toFixed(2)}deg`);
          raf = 0;
        });
      });
      el.addEventListener("pointerleave", () => {
        el.style.removeProperty("--tilt-x");
        el.style.removeProperty("--tilt-y");
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
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          const delay = Math.min(220, idx * 50);
          setTimeout(() => entry.target.classList.add("is-visible"), delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ====================================================================
     Animated counters
     ==================================================================== */
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length && "IntersectionObserver" in window) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.target || "0");
      const suffix = el.dataset.suffix || "";
      const out = el.querySelector("[data-counter-out]");
      if (!out) return;
      const isFloat = !Number.isInteger(target);
      const dur = 1400;
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
     Typewriter h1
     ==================================================================== */
  const tw = document.querySelector("[data-typewriter]");
  if (tw && !prefersReducedMotion) {
    const text = tw.textContent.trim();
    while (tw.firstChild) tw.removeChild(tw.firstChild);
    const out = document.createElement("span");
    out.className = "tw-out";
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    tw.appendChild(out);
    tw.appendChild(cursor);
    let i = 0;
    const interval = 28;
    const run = () => {
      if (i <= text.length) {
        out.textContent = text.slice(0, i);
        i += 1;
        setTimeout(run, interval + (Math.random() * 24));
      } else {
        setTimeout(() => { cursor.style.display = "none"; }, 1200);
      }
    };
    setTimeout(run, 380);
  }

  /* ====================================================================
     Quiz (kept from prior implementation)
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
