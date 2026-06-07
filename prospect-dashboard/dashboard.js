var SESSION_STORAGE_KEY = "jpax_dashboard_session";
var SESSION_EMAIL_KEY = "jpax_dashboard_email";
var LEGACY_KEY_STORAGE_KEY = "jpax_prospect_dashboard_key";

var state = {
  prospectData: null,
  siteData: null,
  session: readStoredSession(),
  view: "site",
  search: "",
  status: "all",
  selectedSlug: "",
  selectedPage: ""
};

var loginPanel = document.getElementById("loginPanel");
var dashboardPanel = document.getElementById("dashboardPanel");
var loginForm = document.getElementById("loginForm");
var loginError = document.getElementById("loginError");
var loginEmail = document.getElementById("loginEmail");
var loginPassword = document.getElementById("loginPassword");
var loginSubmit = document.getElementById("loginSubmit");
var metricGrid = document.getElementById("metricGrid");
var prospectList = document.getElementById("prospectList");
var eventList = document.getElementById("eventList");
var updatedAt = document.getElementById("updatedAt");
var searchInput = document.getElementById("searchInput");
var statusTabs = document.getElementById("statusTabs");
var viewTabs = document.getElementById("viewTabs");
var queueCount = document.getElementById("queueCount");
var queueKicker = document.getElementById("queueKicker");
var queueTitle = document.getElementById("queueTitle");
var signalHeadline = document.getElementById("signalHeadline");
var detailKicker = document.getElementById("detailKicker");
var detailName = document.getElementById("detailName");
var detailStatus = document.getElementById("detailStatus");
var detailBody = document.getElementById("detailBody");
var activityTitle = document.getElementById("activityTitle");
var toast = document.getElementById("toast");

configureStatusTabs();
hydrateLoginForm();
localStorage.removeItem(LEGACY_KEY_STORAGE_KEY);

if (isSessionUsable(state.session)) {
  loadDashboard();
} else {
  clearStoredSession(false);
}

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  await signIn();
});

document.getElementById("refreshButton").addEventListener("click", loadDashboard);

document.getElementById("logoutButton").addEventListener("click", function () {
  clearStoredSession(false);
  state.prospectData = null;
  state.siteData = null;
  state.selectedSlug = "";
  state.selectedPage = "";
  dashboardPanel.hidden = true;
  loginPanel.hidden = false;
  loginPassword.value = "";
});

searchInput.addEventListener("input", function () {
  state.search = searchInput.value.trim().toLowerCase();
  render();
});

viewTabs.addEventListener("click", function (event) {
  var button = event.target.closest("button[data-view]");
  if (!button) return;
  state.view = button.dataset.view;
  state.status = "all";
  configureStatusTabs();
  setActiveViewButton();
  render();
});

statusTabs.addEventListener("click", function (event) {
  var button = event.target.closest("button[data-status]");
  if (!button) return;
  state.status = button.dataset.status;
  Array.from(statusTabs.querySelectorAll("button")).forEach(function (tab) {
    tab.classList.toggle("active", tab === button);
  });
  render();
});

prospectList.addEventListener("click", function (event) {
  var card = event.target.closest("[data-key]");
  if (!card) return;
  if (state.view === "site") state.selectedPage = card.dataset.key;
  else state.selectedSlug = card.dataset.key;
  render();
});

detailBody.addEventListener("click", function (event) {
  var copyButton = event.target.closest("[data-copy]");
  if (!copyButton) return;
  copyToClipboard(copyButton.dataset.copy);
});

async function signIn() {
  var email = loginEmail.value.trim().toLowerCase();
  var password = loginPassword.value;

  loginError.textContent = "";
  if (!email || !password) {
    loginError.textContent = "Enter your email and password.";
    return;
  }

  loginSubmit.disabled = true;
  loginSubmit.textContent = "Signing in";

  try {
    var response = await fetch("/api/dashboard-login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ email: email, password: password })
    });
    var data = await readJsonResponse(response);
    if (!response.ok || !data.ok || !data.token) throw new Error(data.error || "Invalid email or password.");

    state.session = {
      token: data.token,
      email: data.email || email,
      expiresAt: data.expiresAt || ""
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state.session));
    localStorage.setItem(SESSION_EMAIL_KEY, state.session.email);
    localStorage.removeItem(LEGACY_KEY_STORAGE_KEY);
    loginPassword.value = "";
    await loadDashboard();
  } catch (error) {
    clearStoredSession(false);
    dashboardPanel.hidden = true;
    loginPanel.hidden = false;
    loginError.textContent = error.message;
  } finally {
    loginSubmit.disabled = false;
    loginSubmit.textContent = "Sign in";
  }
}

async function loadDashboard() {
  if (!isSessionUsable(state.session)) {
    clearStoredSession(false);
    dashboardPanel.hidden = true;
    loginPanel.hidden = false;
    return;
  }

  loginError.textContent = "";
  try {
    var headers = { "x-dashboard-session": state.session.token };
    var responses = await Promise.all([
      fetch("/api/prospect-dashboard", { headers: headers, cache: "no-store" }),
      fetch("/api/site-dashboard", { headers: headers, cache: "no-store" })
    ]);
    var prospectData = await readJsonResponse(responses[0]);
    var siteData = await readJsonResponse(responses[1]);
    if (responses[0].status === 401 || responses[1].status === 401) {
      clearStoredSession(false);
      throw new Error("Session expired. Sign in again.");
    }
    if (!responses[0].ok || !prospectData.ok) throw new Error(prospectData.error || "Prospect dashboard unavailable.");
    if (!responses[1].ok || !siteData.ok) throw new Error(siteData.error || "Site intelligence unavailable.");

    state.prospectData = prospectData;
    state.siteData = siteData;
    if (!state.selectedSlug) state.selectedSlug = pickDefaultProspect(prospectData.prospects || []);
    if (!state.selectedPage) state.selectedPage = pickDefaultPage(siteData.pages || []);
    loginPanel.hidden = true;
    dashboardPanel.hidden = false;
    render();
  } catch (error) {
    dashboardPanel.hidden = true;
    loginPanel.hidden = false;
    loginError.textContent = error.message;
  }
}

function hydrateLoginForm() {
  var storedEmail = state.session?.email || localStorage.getItem(SESSION_EMAIL_KEY) || "julian@jpaxmedia.com";
  loginEmail.value = storedEmail;
}

function readStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function isSessionUsable(session) {
  if (!session || !session.token) return false;
  if (!session.expiresAt) return true;
  var expiresAt = Date.parse(session.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > Date.now() + 10000;
}

function clearStoredSession(clearEmail) {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEY_STORAGE_KEY);
  if (clearEmail) localStorage.removeItem(SESSION_EMAIL_KEY);
  state.session = null;
}

async function readJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function render() {
  if (!state.prospectData || !state.siteData) return;
  setActiveViewButton();
  if (state.view === "site") renderSiteView();
  else renderProspectView();
}

function renderSiteView() {
  searchInput.placeholder = "Search page, category, path";
  setPanelLabels("High-intent pages", "Pages by intent", "Operator Insight", "Select a page", "Site activity");

  var pages = sortSignals(state.siteData.pages || []);
  var selected = pages.find(function (page) { return page.path === state.selectedPage; }) || pages[0];
  if (selected) state.selectedPage = selected.path;

  renderSiteHeadline(pages);
  renderSiteMetrics(state.siteData.totals || {}, pages);
  renderSitePages(pages);
  renderSiteDetail(selected);
  renderEvents(state.siteData.recentEvents || [], "site");
  updatedAt.textContent = state.siteData.generatedAt ? "Last sync " + formatTime(state.siteData.generatedAt) : "Live";
}

function renderProspectView() {
  searchInput.placeholder = "Search business, city, service";
  setPanelLabels("Priority prospects", "Prospects by intent", "Operator Insight", "Select a prospect", "Prospect activity");

  var prospects = sortSignals(state.prospectData.prospects || []);
  var selected = prospects.find(function (prospect) { return prospect.slug === state.selectedSlug; }) || prospects[0];
  if (selected) state.selectedSlug = selected.slug;

  renderProspectHeadline(prospects);
  renderProspectMetrics(state.prospectData.totals || {}, prospects);
  renderProspects(prospects);
  renderProspectDetail(selected);
  renderEvents(state.prospectData.recentEvents || [], "prospect");
  updatedAt.textContent = state.prospectData.generatedAt ? "Last sync " + formatTime(state.prospectData.generatedAt) : "Live";
}

function configureStatusTabs() {
  var tabs = state.view === "site"
    ? [["all", "All"], ["marketing", "Marketing"], ["offers", "Offers"], ["products", "Products"], ["demos", "Demos"], ["content", "Content"]]
    : [["all", "All"], ["hot", "Hot"], ["warm", "Warm"], ["watch", "Watch"], ["cold", "Cold"]];

  statusTabs.innerHTML = tabs.map(function (tab) {
    return '<button type="button" data-status="' + escapeAttr(tab[0]) + '" class="' + (state.status === tab[0] ? "active" : "") + '">' + escapeHtml(tab[1]) + '</button>';
  }).join("");
}

function setActiveViewButton() {
  Array.from(viewTabs.querySelectorAll("button[data-view]")).forEach(function (button) {
    button.classList.toggle("active", button.dataset.view === state.view);
  });
}

function setPanelLabels(queueLabel, queueHeading, detailLabel, detailFallback, activityHeading) {
  queueKicker.textContent = queueLabel;
  queueTitle.textContent = queueHeading;
  detailKicker.textContent = detailLabel;
  if (!detailName.textContent) detailName.textContent = detailFallback;
  activityTitle.textContent = activityHeading;
}

function renderSiteHeadline(pages) {
  var conversions = (state.siteData.totals || {}).conversions || 0;
  var hot = pages.filter(function (item) { return item.status === "hot"; }).length;
  var active = pages.filter(function (item) { return item.lastSeen || (item.pageViews || 0) > 0; }).length;
  if (conversions) signalHeadline.textContent = conversions + " verified conversion signal" + plural(conversions);
  else if (hot) signalHeadline.textContent = hot + " high-intent page" + plural(hot) + " heating up";
  else if (active) signalHeadline.textContent = active + " active page" + plural(active) + " under watch";
  else signalHeadline.textContent = "Waiting for site-wide signal";
}

function renderProspectHeadline(prospects) {
  var hot = prospects.filter(function (item) { return item.status === "hot"; }).length;
  var warm = prospects.filter(function (item) { return item.status === "warm"; }).length;
  var active = prospects.filter(function (item) { return item.lastSeen || (item.pageViews || 0) > 0; }).length;
  if (hot) signalHeadline.textContent = hot + " hot prospect" + plural(hot) + " ready for follow-up";
  else if (warm) signalHeadline.textContent = warm + " warm prospect" + plural(warm) + " building intent";
  else if (active) signalHeadline.textContent = active + " active prospect" + plural(active) + " under watch";
  else signalHeadline.textContent = "Waiting for first prospect signal";
}

function renderSiteMetrics(totals, pages) {
  renderMetrics([
    metric("Pages", totals.activePages || pages.length || 0, "tracked"),
    metric("Views", totals.pageViews || 0, "total"),
    metric("Sessions", totals.sessions || 0, "unique"),
    metric("CTA", totals.ctaClicks || 0, "actions"),
    metric("Conversions", totals.conversions || 0, "strict"),
    metric("Hot Pages", totals.hotPages || countStatus(pages, "hot"), "priority")
  ]);
}

function renderProspectMetrics(totals, prospects) {
  renderMetrics([
    metric("Tracked", totals.trackedProspects || prospects.length || 0, "prospects"),
    metric("Active", totals.activeProspects || 0, "visited"),
    metric("Hot", totals.hotProspects || countStatus(prospects, "hot"), "urgent"),
    metric("Warm", totals.warmProspects || countStatus(prospects, "warm"), "watch"),
    metric("Views", totals.pageViews || 0, "total"),
    metric("CTA", totals.ctaClicks || 0, "actions")
  ]);
}

function metric(label, value, note) {
  return { label: label, value: value, note: note };
}

function renderMetrics(items) {
  metricGrid.innerHTML = items.map(function (item, index) {
    return [
      '<article class="metric">',
        '<span>' + escapeHtml(item.label) + '</span>',
        '<strong>' + escapeHtml(String(item.value)) + '</strong>',
        '<small>' + escapeHtml(item.note) + '</small>',
        '<div class="mini-chart" aria-hidden="true">' + miniChart(index + Number(item.value || 0)) + '</div>',
      '</article>'
    ].join("");
  }).join("");
}

function renderSitePages(pages) {
  var filtered = filterSitePages(pages);
  queueCount.textContent = filtered.length + " visible";

  if (!filtered.length) {
    prospectList.innerHTML = '<div class="empty-state">No pages match the current filter.</div>';
    return;
  }

  prospectList.innerHTML = [
    '<div class="signal-table-head" aria-hidden="true">',
      '<span>Page</span><span>Views</span><span>Sessions</span><span>CTA</span><span>Conv.</span><span>Signal</span>',
    '</div>',
    filtered.slice(0, 12).map(function (page, index) {
      var active = page.path === state.selectedPage ? " active" : "";
      var status = page.status || "cold";
      return [
        '<button class="signal-row' + active + '" type="button" data-key="' + escapeAttr(page.path) + '">',
          '<span class="rank">' + escapeHtml(String(index + 1)) + '</span>',
          '<span class="signal-main">',
            '<strong>' + escapeHtml(page.pageName || page.path) + '</strong>',
            '<small>' + escapeHtml(page.path || page.category || "Site page") + '</small>',
          '</span>',
          stat("Views", page.pageViews || 0),
          stat("Sessions", page.sessionCount || 0),
          stat("CTA", page.ctaClicks || 0),
          stat("Conv.", page.conversionCount || 0),
          '<span class="signal-status">',
            '<span class="mini-trend" aria-hidden="true">' + miniChart(index + (page.score || 0)) + '</span>',
            '<span class="status-chip ' + escapeAttr(status) + '">' + escapeHtml(status) + " " + escapeHtml(String(page.score || 0)) + '</span>',
          '</span>',
        '</button>'
      ].join("");
    }).join("")
  ].join("");
}

function renderProspects(prospects) {
  var filtered = filterProspects(prospects);
  queueCount.textContent = filtered.length + " visible";

  if (!filtered.length) {
    prospectList.innerHTML = '<div class="empty-state">No prospects match the current filter.</div>';
    return;
  }

  prospectList.innerHTML = [
    '<div class="signal-table-head" aria-hidden="true">',
      '<span>Prospect</span><span>Views</span><span>Sessions</span><span>CTA</span><span>Phone</span><span>Signal</span>',
    '</div>',
    filtered.slice(0, 12).map(function (prospect, index) {
      var active = prospect.slug === state.selectedSlug ? " active" : "";
      var status = prospect.status || "cold";
      var location = [prospect.category, prospect.city].filter(Boolean).join(" / ") || prospect.slug;
      return [
        '<button class="signal-row' + active + '" type="button" data-key="' + escapeAttr(prospect.slug) + '">',
          '<span class="rank">' + escapeHtml(String(index + 1)) + '</span>',
          '<span class="signal-main">',
            '<strong>' + escapeHtml(prospect.name || prospect.slug) + '</strong>',
            '<small>' + escapeHtml(location) + '</small>',
          '</span>',
          stat("Views", prospect.pageViews || 0),
          stat("Sessions", prospect.sessionCount || 0),
          stat("CTA", prospect.ctaClicks || 0),
          stat("Phone", prospect.telClicks || 0),
          '<span class="signal-status">',
            '<span class="mini-trend" aria-hidden="true">' + miniChart(index + (prospect.score || 0)) + '</span>',
            '<span class="status-chip ' + escapeAttr(status) + '">' + escapeHtml(status) + " " + escapeHtml(String(prospect.score || 0)) + '</span>',
          '</span>',
        '</button>'
      ].join("");
    }).join("")
  ].join("");
}

function renderSiteDetail(page) {
  if (!page) {
    renderEmptyDetail("Select a page", "No site activity has been recorded yet.");
    return;
  }

  var status = page.status || "cold";
  var trackingLink = buildSiteTrackingLink(page);
  detailName.textContent = page.pageName || page.path;
  detailStatus.className = "status-chip " + status;
  detailStatus.textContent = status + " " + (page.score || 0);

  detailBody.innerHTML = [
    operatorScanner(page.score || 0),
    '<div class="operator-read">',
      '<span class="micro-label">Recommendation</span>',
      '<p>' + escapeHtml(nextSiteAction(page)) + '</p>',
    '</div>',
    '<div class="detail-grid">',
      detailStat("Views", page.pageViews || 0),
      detailStat("Sessions", page.sessionCount || 0),
      detailStat("CTA clicks", page.ctaClicks || 0),
      detailStat("Conversions", page.conversionCount || 0),
      detailStat("Max scroll", (page.maxScrollDepth || 0) + "%"),
      detailStat("Engaged", (page.maxEngagedSeconds || 0) + "s"),
    '</div>',
    '<div class="action-stack">',
      '<a class="open-button" href="' + escapeAttr(page.path || "/") + '" target="_blank" rel="noopener">Open page</a>',
      '<button class="copy-button" type="button" data-copy="' + escapeAttr(trackingLink) + '">Copy tracked link</button>',
    '</div>',
    '<div class="detail-foot">',
      '<span>Last seen</span><strong>' + escapeHtml(page.lastSeen ? formatTime(page.lastSeen) : "No visits yet") + '</strong>',
      '<span>Source / RID</span><strong>' + escapeHtml(page.lastRid || page.lastReferrer || "No source yet") + '</strong>',
    '</div>'
  ].join("");
}

function renderProspectDetail(prospect) {
  if (!prospect) {
    renderEmptyDetail("Select a prospect", "No prospect selected.");
    return;
  }

  var status = prospect.status || "cold";
  var trackingLink = buildProspectTrackingLink(prospect);
  var location = [prospect.category, prospect.city].filter(Boolean).join(" / ") || prospect.slug;
  detailName.textContent = prospect.name || prospect.slug;
  detailStatus.className = "status-chip " + status;
  detailStatus.textContent = status + " " + (prospect.score || 0);

  detailBody.innerHTML = [
    operatorScanner(prospect.score || 0),
    '<div class="operator-read">',
      '<span class="micro-label">Recommendation</span>',
      '<p>' + escapeHtml(nextProspectAction(prospect)) + '</p>',
      '<small>' + escapeHtml(location) + '</small>',
    '</div>',
    '<div class="detail-grid">',
      detailStat("Views", prospect.pageViews || 0),
      detailStat("Sessions", prospect.sessionCount || 0),
      detailStat("CTA clicks", prospect.ctaClicks || 0),
      detailStat("Phone clicks", prospect.telClicks || 0),
      detailStat("Max scroll", (prospect.maxScrollDepth || 0) + "%"),
      detailStat("Engaged", (prospect.maxEngagedSeconds || 0) + "s"),
    '</div>',
    '<div class="action-stack">',
      '<a class="open-button" href="' + escapeAttr(prospect.demoUrl || "/demos/" + prospect.slug + "/") + '" target="_blank" rel="noopener">Open demo</a>',
      '<button class="copy-button" type="button" data-copy="' + escapeAttr(trackingLink) + '">Copy tracked link</button>',
    '</div>',
    '<div class="detail-foot">',
      '<span>Last seen</span><strong>' + escapeHtml(prospect.lastSeen ? formatTime(prospect.lastSeen) : "No visits yet") + '</strong>',
      '<span>RID / source</span><strong>' + escapeHtml(prospect.lastRid || "No campaign ID yet") + '</strong>',
    '</div>'
  ].join("");
}

function renderEmptyDetail(title, message) {
  detailName.textContent = title;
  detailStatus.className = "status-chip cold";
  detailStatus.textContent = "cold";
  detailBody.innerHTML = '<div class="empty-state">' + escapeHtml(message) + '</div>';
}

function renderEvents(events, mode) {
  if (!events.length) {
    eventList.innerHTML = '<div class="empty-state">No events recorded yet.</div>';
    return;
  }

  eventList.innerHTML = events.slice(0, 18).map(function (event) {
    var title = mode === "site" ? (event.pageName || event.title || event.path) : (event.prospectName || event.slug || "Unknown prospect");
    var detail = event.targetText || event.targetUrl || event.path || "";
    var geo = event.geo ? [event.geo.city, event.geo.region, event.geo.country].filter(Boolean).join(", ") : "";
    var meta = [formatTime(event.timestamp), event.device, geo, detail].filter(Boolean).join(" / ");
    return [
      '<article class="event-row">',
        '<span class="event-dot" aria-hidden="true"></span>',
        '<div>',
          '<p class="event-type">' + escapeHtml(labelEvent(event.type)) + '</p>',
          '<h3>' + escapeHtml(title) + '</h3>',
          '<p class="event-meta">' + escapeHtml(meta) + '</p>',
        '</div>',
      '</article>'
    ].join("");
  }).join("");
}

function filterSitePages(pages) {
  return pages.filter(function (page) {
    var haystack = [page.pageName, page.path, page.category, page.group].join(" ").toLowerCase();
    var matchesSearch = !state.search || haystack.indexOf(state.search) !== -1;
    var matchesStatus = state.status === "all" || page.group === state.status;
    return matchesSearch && matchesStatus;
  });
}

function filterProspects(prospects) {
  return prospects.filter(function (prospect) {
    var haystack = [prospect.name, prospect.slug, prospect.category, prospect.city].join(" ").toLowerCase();
    var matchesSearch = !state.search || haystack.indexOf(state.search) !== -1;
    var matchesStatus = state.status === "all" || prospect.status === state.status;
    return matchesSearch && matchesStatus;
  });
}

function sortSignals(items) {
  return items.slice().sort(function (a, b) {
    return numberValue(b.score) - numberValue(a.score) ||
      numberValue(b.ctaClicks) - numberValue(a.ctaClicks) ||
      numberValue(b.pageViews) - numberValue(a.pageViews) ||
      Date.parse(b.lastSeen || 0) - Date.parse(a.lastSeen || 0);
  });
}

function pickDefaultProspect(prospects) {
  if (!Array.isArray(prospects) || !prospects.length) return "";
  var sorted = sortSignals(prospects);
  return sorted.find(function (item) { return item.status === "hot"; })?.slug ||
    sorted.find(function (item) { return item.status === "warm"; })?.slug ||
    sorted.find(function (item) { return item.lastSeen; })?.slug ||
    sorted[0].slug;
}

function pickDefaultPage(pages) {
  if (!Array.isArray(pages) || !pages.length) return "";
  var sorted = sortSignals(pages);
  return sorted.find(function (item) { return item.status === "hot"; })?.path ||
    sorted.find(function (item) { return item.status === "warm"; })?.path ||
    sorted.find(function (item) { return item.lastSeen; })?.path ||
    sorted[0].path;
}

function nextSiteAction(page) {
  if ((page.conversionCount || 0) > 0) return "Protect this path. It is producing verified conversion activity.";
  if ((page.ctaClicks || 0) > 0) return "Inspect the CTA path. Visitors are taking action from this page.";
  if ((page.sessionCount || 0) > 2) return "Consider strengthening the offer or CTA. Repeat sessions are building.";
  if ((page.pageViews || 0) > 0) return "Watch this page for repeat sessions, CTA clicks, and source patterns.";
  return "No read yet. Send or promote this page with a tracked link.";
}

function nextProspectAction(prospect) {
  if ((prospect.ctaClicks || 0) > 0) return "Send a direct follow-up. They clicked the claim CTA.";
  if ((prospect.sessionCount || 0) > 1) return "Follow up while the demo is fresh. They came back more than once.";
  if ((prospect.pageViews || 0) > 0) return "Watch for a second visit or CTA click before pushing harder.";
  return "Send the tracked outreach link when this prospect enters the sprint.";
}

function buildSiteTrackingLink(page) {
  var base = "https://jpaxmedia.com" + (page.path || "/");
  var date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  var slug = (page.path || "home").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "home";
  var rid = "site-" + slug.toLowerCase() + "-" + date;
  var joiner = base.indexOf("?") === -1 ? "?" : "&";
  return base + joiner + "rid=" + encodeURIComponent(rid) + "&utm_source=jpax&utm_medium=direct&utm_campaign=site-intelligence";
}

function buildProspectTrackingLink(prospect) {
  var base = prospect.demoUrl || "https://jpaxmedia.com/demos/" + prospect.slug + "/";
  var date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  var rid = prospect.slug + "-" + date;
  var joiner = base.indexOf("?") === -1 ? "?" : "&";
  return base + joiner + "rid=" + encodeURIComponent(rid) + "&utm_source=outreach&utm_medium=direct&utm_campaign=upstate-sprint";
}

function operatorScanner(score) {
  return [
    '<div class="operator-scanner" aria-hidden="true">',
      '<div class="scanner-core"><span>' + escapeHtml(String(Math.max(0, Math.min(100, score)))) + '</span></div>',
    '</div>'
  ].join("");
}

function miniChart(seed) {
  var base = Math.abs(Number(seed) || 1);
  var heights = [35, 52, 42, 68, 48, 75, 46, 64, 55, 82];
  return heights.map(function (height, index) {
    var adjusted = 22 + ((height + base + index * 9) % 58);
    return '<i style="height:' + adjusted + '%"></i>';
  }).join("");
}

function copyToClipboard(value) {
  if (!value) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(function () {
      showToast("Tracked link copied");
    }).catch(function () {
      fallbackCopy(value);
    });
  } else {
    fallbackCopy(value);
  }
}

function fallbackCopy(value) {
  var input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
  showToast("Tracked link copied");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(function () {
    toast.classList.remove("visible");
  }, 1800);
}

function stat(label, value) {
  return '<span class="stat"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(String(value)) + '</strong></span>';
}

function detailStat(label, value) {
  return '<div class="detail-stat"><span class="micro-label">' + escapeHtml(label) + '</span><strong>' + escapeHtml(String(value)) + '</strong></div>';
}

function labelEvent(type) {
  return String(type || "").replace(/^site_/, "").replace(/_/g, " ");
}

function countStatus(items, status) {
  return items.filter(function (item) { return item.status === status; }).length;
}

function numberValue(value) {
  var number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatTime(value) {
  if (!value) return "-";
  var date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function plural(count) {
  return count === 1 ? "" : "s";
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, function (char) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char];
  });
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
