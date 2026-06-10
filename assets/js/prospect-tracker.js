(function () {
  if (window.JPAXProspectTrackerLoaded) return;
  window.JPAXProspectTrackerLoaded = true;

  // Internal opt-out: open any page once with ?jpax_ignore=1 and this browser
  // stops sending tracking events (?jpax_ignore=0 re-enables). Keeps JPAX's
  // own demo visits out of prospect signal scores. Shared flag with
  // jpax-site-intelligence.js.
  try {
    var ignoreParam = new URLSearchParams(window.location.search).get("jpax_ignore");
    if (ignoreParam === "1") localStorage.setItem("jpax_tracking_optout", "1");
    if (ignoreParam === "0") localStorage.removeItem("jpax_tracking_optout");
    if (localStorage.getItem("jpax_tracking_optout") === "1") return;
  } catch (e) { /* storage unavailable — track normally */ }

  var match = window.location.pathname.match(/^\/demos\/([^/]+)/);
  if (!match) return;

  var slug = match[1];
  var endpoint = "/api/prospect-track";
  var params = new URLSearchParams(window.location.search);
  var sentScrollDepths = {};
  var startTime = Date.now();

  var sessionId = getSessionId();
  var visitorId = getVisitorId();

  send("page_view", {
    title: document.title,
    referrer: document.referrer || "",
    screen: window.screen ? window.screen.width + "x" + window.screen.height : "",
    viewport: window.innerWidth + "x" + window.innerHeight
  });

  document.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var type = "";
    if (link.classList.contains("footer-cta") || href.indexOf("/free-website/") !== -1) type = "cta_click";
    if (href.indexOf("tel:") === 0) type = "tel_click";
    if (href.indexOf("mailto:") === 0) type = "mailto_click";
    if (!type) return;

    send(type, {
      targetUrl: link.href,
      targetText: link.textContent || ""
    }, true);
  }, { capture: true });

  window.addEventListener("scroll", throttle(function () {
    var depth = getScrollDepth();
    [25, 50, 75, 90].forEach(function (threshold) {
      if (depth >= threshold && !sentScrollDepths[threshold]) {
        sentScrollDepths[threshold] = true;
        send("scroll_depth", { scrollDepth: threshold });
      }
    });
  }, 600), { passive: true });

  [15, 45, 90].forEach(function (seconds) {
    window.setTimeout(function () {
      send("engaged_time", { engagedSeconds: seconds });
    }, seconds * 1000);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      send("visibility_end", {
        engagedSeconds: Math.round((Date.now() - startTime) / 1000),
        scrollDepth: getScrollDepth()
      }, true);
    }
  });

  function send(type, extra, preferBeacon) {
    var payload = Object.assign({
      type: type,
      slug: slug,
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

  function getSessionId() {
    var key = "jpax_pt_session";
    var current = sessionStorage.getItem(key);
    if (current) return current;
    current = makeId("s");
    sessionStorage.setItem(key, current);
    return current;
  }

  function getVisitorId() {
    var key = "jpax_pt_visitor";
    var current = localStorage.getItem(key);
    if (current) return current;
    current = makeId("v");
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

