const messages = {
  "hvac": {
    "cooling": "An AC call should capture whether the system runs, air temperature, thermostat setting, and recent service history.",
    "heating": "A no-heat call should capture system type, thermostat behavior, airflow, and whether any breaker has tripped.",
    "maintenance": "Maintenance requests should confirm system age, last service date, filter condition, and preferred time window.",
    "airflow": "Weak airflow can point to filters, duct issues, blower problems, or frozen coils; the intake should gather those clues."
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
