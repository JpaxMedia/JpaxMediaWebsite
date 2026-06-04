const messages = {
  auto: {
    brakes: "Brake noise should start with a same-day inspection, pad check, rotor look, and clear repair quote.",
    engine: "A check engine visit works best when the customer can request diagnostics and describe symptoms before arrival.",
    oil: "Oil service customers want quick hours, phone access, and an easy maintenance reminder path.",
    ac: "AC issues need a simple intake: temperature problem, noise, leak signs, and whether it still blows air."
  },
  tire: {
    patch: "Fast path: call with tire size, vehicle model, and whether the tire still holds air.",
    replace: "Replacement quote: ask for tire size, budget preference, and whether one tire or a full set is needed.",
    balance: "Balancing visit: vibration speed, tire age, and recent rotation help the shop prep before arrival."
  },
  fence: {
    wood: "Wood privacy is ideal for backyards, pets, and full screening from neighbors.",
    aluminum: "Aluminum is a polished choice for pool areas, front yards, and low-maintenance curb appeal.",
    chain: "Chain-link is practical for large spaces, utility areas, and budget-conscious property lines."
  },
  season: {
    spring: "Spring is the best time to design planting beds, prep irrigation, and book before the rush.",
    summer: "Summer projects should focus on patios, shade, lighting, and drainage before heavy storms.",
    fall: "Fall refreshes are perfect for mulch, pruning, hardscape planning, and next-season installs."
  },
  drain: {
    slow: "Slow drains are best handled before they turn into a backup. A camera inspection can find the real cause.",
    backup: "A backup is urgent. The mobile page should push the phone number and emergency service path first.",
    odor: "Sewer odor may signal a vent, trap, or line issue. The site should prompt a professional check.",
    repeat: "Repeat clogs need diagnosis, not another temporary fix. Camera inspection is the right lead."
  }
};

const result = document.getElementById("toolResult");
document.querySelectorAll("[data-tool] .tool-choice").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest("[data-tool]");
    group.querySelectorAll(".tool-choice").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const tool = group.dataset.tool;
    const value = button.dataset.value;
    if (messages[tool] && messages[tool][value] && result) result.textContent = messages[tool][value];
  });
});

document.querySelectorAll(".ba-range").forEach((range) => {
  const frame = range.previousElementSibling;
  range.addEventListener("input", () => frame.style.setProperty("--pos", `${range.value}%`));
});

const sqftRange = document.getElementById("sqftRange");
if (sqftRange && result) {
  const label = document.getElementById("sqftValue");
  const update = () => {
    const sqft = Number(sqftRange.value);
    label.textContent = `${sqft} sq ft`;
    const yards = Math.ceil((sqft * 4 / 27) * 10) / 10;
    result.textContent = `A ${sqft} sq ft project at 4 inches is roughly ${yards} cubic yards before site conditions, access, and finish are confirmed.`;
  };
  sqftRange.addEventListener("input", update);
  update();
}

document.querySelectorAll(".checklist input").forEach((box) => {
  box.addEventListener("change", () => {
    const checked = [...document.querySelectorAll(".checklist input:checked")];
    if (!result) return;
    if (document.body.classList.contains("roofing")) {
      result.textContent = checked.length === 0
        ? "Choose any signs above and the page gives the homeowner a clear next step."
        : `${checked.length} warning sign${checked.length > 1 ? "s" : ""} selected. The page should push an inspection request and photo upload next.`;
    } else {
      const hours = Math.max(1.5, checked.length * 1.25).toFixed(1);
      result.textContent = `${checked.length || 1} area${checked.length === 1 ? "" : "s"} selected: plan for about ${hours} focused hours plus walkthrough time.`;
    }
  });
});

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".lang-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const lang = button.dataset.lang;
    document.querySelectorAll("[data-en]").forEach((el) => {
      el.textContent = el.dataset[lang];
    });
  });
});
