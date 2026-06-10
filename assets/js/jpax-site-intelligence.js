(function () {
  if (window.JPAXSiteIntelligenceLoaded) return;
  window.JPAXSiteIntelligenceLoaded = true;

  if (window.location.pathname.indexOf("/prospect-dashboard") === 0) return;

  // Internal opt-out — same flag as prospect-tracker.js: one visit with
  // ?jpax_ignore=1 silences both trackers in this browser.
  try {
    var ignoreParam = new URLSearchParams(window.location.search).get("jpax_ignore");
    if (ignoreParam === "1") localStorage.setItem("jpax_tracking_optout", "1");
    if (ignoreParam === "0") localStorage.removeItem("jpax_tracking_optout");
    if (localStorage.getItem("jpax_tracking_optout") === "1") return;
  } catch (e) { /* storage unavailable — track normally */ }

  var endpoint = "/api/site-track";
  var params = new URLSearchParams(window.location.search);
  var sentScrollDepths = {};
  var startTime = Date.now();
  var sessionId = getSessionId();
  var visitorId = getVisitorId();

  send("site_page_view", {
    title: document.title,
    referrer: document.referrer || "",
    screen: window.screen ? window.screen.width + "x" + window.screen.height : "",
    viewport: window.innerWidth + "x" + window.innerHeight,
    conversion: isConversionPage(),
    conversionType: isConversionPage() ? "form_thank_you" : ""
  });

  document.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var eventType = "";
    if (href.indexOf("tel:") === 0) eventType = "site_tel_click";
    else if (href.indexOf("mailto:") === 0) eventType = "site_mailto_click";
    else if (isImportantLink(link, href)) eventType = "site_cta_click";

    if (!eventType) return;

    send(eventType, {
      targetUrl: link.href,
      targetText: link.textContent || ""
    }, true);
  }, { capture: true });

  window.addEventListener("scroll", throttle(function () {
    var depth = getScrollDepth();
    [25, 50, 75, 90].forEach(function (threshold) {
      if (depth >= threshold && !sentScrollDepths[threshold]) {
        sentScrollDepths[threshold] = true;
        send("site_scroll_depth", { scrollDepth: threshold });
      }
    });
  }, 700), { passive: true });

  [15, 45, 90].forEach(function (seconds) {
    window.setTimeout(function () {
      send("site_engaged_time", { engagedSeconds: seconds });
    }, seconds * 1000);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      send("site_visibility_end", {
        engagedSeconds: Math.round((Date.now() - startTime) / 1000),
        scrollDepth: getScrollDepth()
      }, true);
    }
  });

  function send(type, extra, preferBeacon) {
    var payload = Object.assign({
      type: type,
      path: window.location.pathname,
      url: window.location.href,
      rid: params.get("rid") || "",
      utmSource: params.get("utm_source") || "",
      utmMedium: params.get("utm_medium") || "",
      utmCampaign: params.get("utm_campaign") || "",
      sessionId: sessionId,
      visitorId: visitorId,
      language: navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || ""
    }, extra || {});

    var body = JSON.stringify(payload);
    if (preferBeacon && navigator.sendBeacon) {
      var blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(endpoint, blob)) return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body,
      keepalive: Boolean(preferBeacon)
    }).catch(function () {});
  }

  function isImportantLink(link, href) {
    var text = (link.textContent || "").toLowerCase();
    var classes = link.className || "";
    return href.indexOf("/free-website") !== -1 ||
      href.indexOf("/start") !== -1 ||
      href.indexOf("/pricing") !== -1 ||
      href.indexOf("/services") !== -1 ||
      href.indexOf("/work") !== -1 ||
      href.indexOf("/elara") !== -1 ||
      href.indexOf("/jupiter") !== -1 ||
      href.indexOf("/tradeos") !== -1 ||
      /\b(button|cta|nav-call|footer-cta)\b/.test(String(classes)) ||
      /start|book|claim|contact|get|pricing|services|work|demo|call|email|free/.test(text);
  }

  function isConversionPage() {
    var path = window.location.pathname.replace(/\/+$/, "");
    return path === "/free-website/thank-you";
  }

  function getSessionId() {
    var key = "jpax_si_session";
    var current = sessionStorage.getItem(key);
    if (current) return current;
    current = makeId("sis");
    sessionStorage.setItem(key, current);
    return current;
  }

  function getVisitorId() {
    var key = "jpax_si_visitor";
    var current = localStorage.getItem(key);
    if (current) return current;
    current = makeId("siv");
    localStorage.setItem(key, current);
    return current;
  }

  function makeId(prefix) {
    var cryptoObj = window.crypto || window.msCrypto;
    if (cryptoObj && cryptoObj.getRandomValues) {
      var values = new Uint32Array(2);
      cryptoObj.getRandomValues(values);
      return prefix + "-" + Date.now().toString(36) + "-" + values[0].toString(36) + values[1].toString(36);
    }
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  function getScrollDepth() {
    var doc = document.documentElement;
    var body = document.body;
    var scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
    var height = Math.max(body.scrollHeight, doc.scrollHeight, body.offsetHeight, doc.offsetHeight, body.clientHeight, doc.clientHeight);
    var viewport = window.innerHeight || doc.clientHeight || 1;
    var maxScrollable = Math.max(height - viewport, 1);
    return Math.max(0, Math.min(100, Math.round((scrollTop / maxScrollable) * 100)));
  }

  function throttle(fn, wait) {
    var last = 0;
    var timeout = null;
    return function () {
      var now = Date.now();
      var remaining = wait - (now - last);
      if (remaining <= 0) {
        last = now;
        fn();
      } else if (!timeout) {
        timeout = window.setTimeout(function () {
          timeout = null;
          last = Date.now();
          fn();
        }, remaining);
      }
    };
  }
})();
