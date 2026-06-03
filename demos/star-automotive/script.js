const messages = {
  "auto": {
    "brakes": "Brake concerns should start with pad, rotor, caliper, and road-safety checks before a repair quote.",
    "engine": "Diagnostic visits work best when the driver can share the vehicle, warning light, and symptoms before arrival.",
    "oil": "Oil and maintenance requests should make hours, phone access, and reminder timing easy to confirm.",
    "ac": "AC concerns need a simple intake: not cold, noise, leak signs, and whether air still moves.",
    "battery": "No-start calls should capture battery age, clicking sounds, and whether jump-starting helped.",
    "ride": "Rough ride issues usually start with suspension, tire wear, alignment, and steering checks.",
    "maintenance": "Maintenance visits convert best when the site shows common services and a clear phone path.",
    "diagnostic": "Diagnostic requests should capture symptoms, vehicle details, and whether the issue is safe to drive.",
    "comfort": "Heating and AC calls should capture temperature, fan behavior, and recent service history."
  },
  "fence": {
    "wood": "Wood privacy works well for backyards, pets, and full screening from nearby properties.",
    "aluminum": "Aluminum is a clean option for front yards, pools, and lower-maintenance curb appeal.",
    "chain": "Chain-link is practical for larger spaces, utility areas, and budget-conscious property lines.",
    "repair": "Fence repair requests should capture damaged sections, gate problems, and whether posts are loose."
  },
  "clean": {
    "home": "Home cleaning requests should capture rooms, timing, pets, and whether recurring service is needed.",
    "deep": "Deep cleaning should focus on kitchens, bathrooms, baseboards, buildup, and move-ready details.",
    "move": "Move-out cleaning needs square footage, appliance condition, deadline, and access instructions.",
    "office": "Office cleaning should confirm workstations, restrooms, entry areas, and preferred after-hours timing.",
    "recurring": "Recurring service should confirm frequency, priority rooms, preferred day windows, and special surfaces."
  },
  "tire": {
    "muffler": "Muffler requests should capture the noise, vehicle type, and whether the exhaust issue started suddenly.",
    "tires": "Tire calls should start with tire size, vehicle model, and whether one tire or a full set is needed.",
    "vibration": "Vibration issues often need tire balance, alignment, and wear checks before parts are quoted.",
    "brakes": "Brake concerns should start with sound, stopping feel, and whether the warning light is on."
  },
  "muffler": {
    "loud": "A loud exhaust request should start with vehicle details, when the sound started, and whether the car is safe to drive.",
    "rattle": "Rattle issues should capture whether the sound happens at idle, acceleration, braking, or over bumps.",
    "leak": "Exhaust smell can be urgent. A clear site should push the phone call and inspection path first.",
    "quote": "Quote calls should capture vehicle year, make, model, and the part of the exhaust needing service."
  },
  "language": {
    "en": "English service flow: services, trust proof, and a tap-to-call path are visible immediately.",
    "es": "Flujo en espa\u00f1ol: servicios claros, prueba local y llamada r\u00e1pida desde el tel\u00e9fono.",
    "brakes": "Brake requests should be easy to explain before the vehicle arrives.",
    "diagnostic": "Diagnostic requests should capture symptoms, warning lights, and vehicle details."
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
