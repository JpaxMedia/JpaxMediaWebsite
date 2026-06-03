const messages = {
  "wash": {
    "house": "A house wash request should capture siding type, square footage, staining, and preferred timing.",
    "driveway": "Driveway requests should capture surface size, oil staining, slope, and whether sidewalks should be bundled.",
    "sidewalk": "Sidewalk cleaning should confirm length, staining, and whether the customer wants curb and entry areas included.",
    "soft": "Soft washing is best for siding, roofs, and delicate surfaces where pressure needs to be controlled."
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
