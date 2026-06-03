const messages = {
  "tire": {
    "muffler": "Muffler requests should capture the noise, vehicle type, and whether the exhaust issue started suddenly.",
    "tires": "Tire calls should start with tire size, vehicle model, and whether one tire or a full set is needed.",
    "vibration": "Vibration issues often need tire balance, alignment, and wear checks before parts are quoted.",
    "brakes": "Brake concerns should start with sound, stopping feel, and whether the warning light is on."
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
