const messages = {
  "auto": {
    "brakes": "Brake concerns should start with pad, rotor, caliper, and road-safety checks before a repair quote.",
    "engine": "Diagnostic visits work best when the driver can share the vehicle, warning light, and symptoms before arrival.",
    "oil": "Oil and maintenance requests should make hours, phone access, and reminder timing easy to confirm.",
    "ac": "AC concerns need a simple intake: not cold, noise, leak signs, and whether air still moves.",
    "battery": "No-start calls should capture battery age, clicking sounds, and whether jump-starting helped.",
    "ride": "Rough ride issues usually start with suspension, tire wear, alignment, and steering checks.",
    "maintenance": "Maintenance visits work best when common services and a clear phone path are easy to find.",
    "diagnostic": "Diagnostic requests should capture symptoms, vehicle details, and whether the issue is safe to drive.",
    "comfort": "Heating and AC calls should capture temperature, fan behavior, and recent service history."
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
