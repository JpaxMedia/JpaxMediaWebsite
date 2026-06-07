const year = document.getElementById("year");
const form = document.getElementById("lead-form");
const success = document.getElementById("form-success");
const emailDraft = document.getElementById("email-draft");
const mobileCta = document.querySelector(".mobile-cta");

if (year) {
  year.textContent = new Date().getFullYear();
}

function encodeMailtoValue(value) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function getFormValue(data, key) {
  return String(data.get(key) || "").trim();
}

if (form && success && emailDraft) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const recipient = String(form.dataset.recipient || "").trim();
    const safeRecipient = recipient.includes("example.com") ? "" : recipient;
    const subject = `Property inquiry from ${getFormValue(data, "name") || "website visitor"}`;
    const bodyLines = [
      "New website inquiry",
      "",
      `Name: ${getFormValue(data, "name")}`,
      `Phone: ${getFormValue(data, "phone")}`,
      `Email: ${getFormValue(data, "email")}`,
      `Interest: ${getFormValue(data, "interest")}`,
      `Timeline: ${getFormValue(data, "timeline")}`,
      `Budget or payment range: ${getFormValue(data, "budget")}`,
      `Preferred area: ${getFormValue(data, "location")}`,
      "",
      "Message:",
      getFormValue(data, "message") || "No message provided.",
    ];

    emailDraft.href = `mailto:${safeRecipient}?subject=${encodeMailtoValue(subject)}&body=${encodeMailtoValue(bodyLines.join("\n"))}`;
    success.hidden = false;
    form.classList.add("submitted");
    success.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

if (mobileCta) {
  const updateMobileCta = () => {
    document.body.classList.toggle("show-mobile-cta", window.scrollY > 560);
  };

  updateMobileCta();
  window.addEventListener("scroll", updateMobileCta, { passive: true });
}
