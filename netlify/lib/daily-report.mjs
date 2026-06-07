import { getStore } from "@netlify/blobs";
import { getDashboardData } from "./prospect-store.mjs";
import { getSiteDashboardData } from "./site-store.mjs";

const TIME_ZONE = "America/New_York";
const REPORT_STORE = "jpax-daily-reports-v1";
const SITE_EVENT_STORE = "jpax-site-events-v1";
const PROSPECT_EVENT_STORE = "jpax-prospect-events-v1";
const DEFAULT_REPORT_TO = "julian@jpaxmedia.com";
const DEFAULT_REPORT_FROM = "JPAX Site Intelligence <reports@jpaxmedia.com>";
const DASHBOARD_URL = "https://jpaxmedia.com/prospect-dashboard/";

export function reportJsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export function reportOptionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type,x-dashboard-key",
      "access-control-max-age": "86400"
    }
  });
}

export function isReportAuthorized(request) {
  const expected = env("PROSPECT_DASHBOARD_KEY");
  if (!expected) return { ok: false, status: 503, message: "Dashboard key is not configured." };

  const provided = request.headers.get("x-dashboard-key") || "";
  if (provided !== expected) return { ok: false, status: 401, message: "Access denied." };

  return { ok: true };
}

export async function runDailyReportAgent(options = {}) {
  const now = options.now || new Date();
  const reportDate = cleanDateKey(options.date) || previousLocalDateKey(now);
  const localHour = localHourOf(now);
  const scheduled = options.mode === "scheduled";

  if (scheduled && localHour !== 7) {
    return {
      ok: true,
      skipped: true,
      reason: `Current ${TIME_ZONE} hour is ${localHour}; report sends at 7AM.`,
      reportDate
    };
  }

  const report = await buildDailyReport({ reportDate, generatedAt: now });
  const email = renderDailyReportEmail(report);
  const store = getStore(REPORT_STORE);
  const lockKey = `sent/${reportDate}.json`;

  if (options.send) {
    const existing = await store.get(lockKey, { type: "json", consistency: "strong" }).catch(() => null);
    if (existing && !options.force) {
      await persistPreview(store, report, email, { duplicate: true });
      return {
        ok: true,
        skipped: true,
        reason: `Daily report for ${reportDate} was already sent.`,
        reportDate,
        sentAt: existing.sentAt || "",
        subject: email.subject,
        dashboardUrl: DASHBOARD_URL
      };
    }

    const delivery = await sendReportEmail(email);
    await persistPreview(store, report, email, { delivery });

    if (delivery.ok) {
      await store.setJSON(lockKey, {
        reportDate,
        subject: email.subject,
        provider: delivery.provider,
        messageId: delivery.messageId || "",
        sentAt: new Date().toISOString(),
        to: report.recipient
      });
    }

    return {
      ok: delivery.ok,
      reportDate,
      subject: email.subject,
      dashboardUrl: DASHBOARD_URL,
      delivery,
      summary: publicReportSummary(report)
    };
  }

  await persistPreview(store, report, email, { preview: true });
  return {
    ok: true,
    reportDate,
    subject: email.subject,
    dashboardUrl: DASHBOARD_URL,
    preview: {
      html: email.html,
      text: email.text
    },
    summary: publicReportSummary(report)
  };
}

export async function buildDailyReport({ reportDate, generatedAt = new Date() }) {
  const [siteEvents, prospectEvents, siteDashboard, prospectDashboard] = await Promise.all([
    readEventsForLocalDate(SITE_EVENT_STORE, reportDate),
    readEventsForLocalDate(PROSPECT_EVENT_STORE, reportDate),
    getSiteDashboardData().catch(() => null),
    getDashboardData().catch(() => null)
  ]);

  const cleanSiteEvents = siteEvents.filter((event) => !event.bot);
  const cleanProspectEvents = prospectEvents.filter((event) => !event.bot);
  const site = summarizeSiteEvents(cleanSiteEvents);
  const prospects = summarizeProspectEvents(cleanProspectEvents);
  const recommendations = buildRecommendations(site, prospects);

  return {
    reportDate,
    reportDateLabel: formatDateLabel(reportDate),
    generatedAt: generatedAt.toISOString(),
    generatedAtLabel: formatDateTime(generatedAt),
    timezone: TIME_ZONE,
    recipient: env("DAILY_REPORT_TO") || DEFAULT_REPORT_TO,
    dashboardUrl: env("DAILY_REPORT_DASHBOARD_URL") || DASHBOARD_URL,
    site,
    prospects,
    totals: {
      siteEvents: cleanSiteEvents.length,
      prospectEvents: cleanProspectEvents.length,
      allEvents: cleanSiteEvents.length + cleanProspectEvents.length,
      pageViews: site.pageViews + prospects.pageViews,
      sessions: site.sessions + prospects.sessions,
      ctaClicks: site.ctaClicks + prospects.ctaClicks,
      phoneClicks: site.telClicks + prospects.telClicks,
      emailClicks: site.mailtoClicks + prospects.mailtoClicks,
      conversions: site.conversions,
      hotSignals: site.hotPages.length + prospects.hotProspects.length
    },
    rolling: {
      site: siteDashboard?.totals || {},
      prospects: prospectDashboard?.totals || {}
    },
    recommendations
  };
}

async function readEventsForLocalDate(storeName, reportDate) {
  const store = getStore(storeName);
  const keys = await listCandidateEventKeys(store, reportDate);
  const events = await Promise.all(
    keys.map(async (key) => store.get(key, { type: "json", consistency: "eventual" }).catch(() => null))
  );

  return events
    .filter(Boolean)
    .filter((event) => localDateKey(event.timestamp) === reportDate)
    .sort((a, b) => Date.parse(a.timestamp || 0) - Date.parse(b.timestamp || 0));
}

async function listCandidateEventKeys(store, reportDate) {
  const dateKeys = [
    shiftDateKey(reportDate, -1),
    reportDate,
    shiftDateKey(reportDate, 1)
  ];
  const keys = [];

  for (const dateKey of dateKeys) {
    for await (const page of store.list({ prefix: `events/${dateKey}/`, paginate: true })) {
      for (const blob of page.blobs || []) {
        keys.push(blob.key);
      }
    }
  }

  return keys;
}

function summarizeSiteEvents(events) {
  const pages = new Map();
  const sessions = new Map();
  const sources = new Map();

  for (const event of events) {
    const pageKey = event.path || event.pageName || "unknown";
    const page = pages.get(pageKey) || {
      path: event.path || "",
      pageName: event.pageName || event.title || "Unknown page",
      category: event.category || "Site Page",
      group: event.group || "other",
      views: 0,
      sessions: new Set(),
      ctaClicks: 0,
      telClicks: 0,
      mailtoClicks: 0,
      conversions: 0,
      maxScrollDepth: 0,
      maxEngagedSeconds: 0,
      sources: new Map(),
      lastSeen: "",
      lastAction: ""
    };

    if (event.sessionId) page.sessions.add(event.sessionId);
    if (event.type === "site_page_view") page.views += 1;
    if (event.type === "site_cta_click") page.ctaClicks += 1;
    if (event.type === "site_tel_click") page.telClicks += 1;
    if (event.type === "site_mailto_click") page.mailtoClicks += 1;
    if (event.conversion) page.conversions += 1;
    page.maxScrollDepth = Math.max(page.maxScrollDepth, event.scrollDepth || 0);
    page.maxEngagedSeconds = Math.max(page.maxEngagedSeconds, event.engagedSeconds || 0);
    page.lastSeen = event.timestamp || page.lastSeen;
    page.lastAction = readableEventType(event.type);

    const source = event.utmSource || sourceFromReferrer(event.referrer) || "direct";
    if (event.type === "site_page_view") {
      page.sources.set(source, (page.sources.get(source) || 0) + 1);
      sources.set(source, (sources.get(source) || 0) + 1);
    }

    pages.set(pageKey, page);

    if (event.sessionId) {
      const session = sessions.get(event.sessionId) || {
        sessionId: event.sessionId,
        visitorId: event.visitorId || "",
        pageViews: 0,
        events: 0,
        ctaClicks: 0,
        conversions: 0,
        source,
        device: event.device || "unknown",
        geo: event.geo || {},
        journey: [],
        firstSeen: event.timestamp,
        lastSeen: event.timestamp
      };
      session.events += 1;
      session.lastSeen = event.timestamp || session.lastSeen;
      session.source = session.source || source;
      session.device = event.device || session.device;
      session.geo = event.geo || session.geo;
      if (event.type === "site_page_view") {
        session.pageViews += 1;
        const last = session.journey[session.journey.length - 1];
        if (!last || last.path !== event.path) {
          session.journey.push({
            path: event.path,
            pageName: event.pageName || event.title || "Unknown page",
            timestamp: event.timestamp
          });
        }
      }
      if (event.type === "site_cta_click") session.ctaClicks += 1;
      if (event.conversion) session.conversions += 1;
      session.score = scoreSiteSession(session);
      sessions.set(event.sessionId, session);
    }
  }

  const pageList = [...pages.values()].map((page) => {
    const normalized = {
      ...page,
      sessions: page.sessions.size,
      sources: topFromMap(page.sources, 3)
    };
    const score = scoreSitePage(normalized);
    return {
      ...normalized,
      score,
      status: statusForScore(score)
    };
  }).sort(sortByScoreThenLastSeen);

  const sessionList = [...sessions.values()]
    .map((session) => ({ ...session, score: scoreSiteSession(session) }))
    .sort(sortByScoreThenLastSeen)
    .slice(0, 8);

  const pageViews = events.filter((event) => event.type === "site_page_view").length;

  return {
    pageViews,
    sessions: sessions.size,
    ctaClicks: events.filter((event) => event.type === "site_cta_click").length,
    telClicks: events.filter((event) => event.type === "site_tel_click").length,
    mailtoClicks: events.filter((event) => event.type === "site_mailto_click").length,
    conversions: events.filter((event) => event.conversion).length,
    topPages: pageList.slice(0, 8),
    hotPages: pageList.filter((page) => page.score >= 45).slice(0, 8),
    topSources: topFromMap(sources, 8),
    topSessions: sessionList,
    recentEvents: events.slice(-12).reverse().map(slimEvent)
  };
}

function summarizeProspectEvents(events) {
  const prospects = new Map();
  const sources = new Map();

  for (const event of events) {
    const slug = event.slug || "unknown";
    const prospect = prospects.get(slug) || {
      slug,
      name: event.prospectName || titleCase(slug.replace(/-/g, " ")),
      category: event.category || "",
      phone: event.phone || "",
      demoUrl: event.url || `https://jpaxmedia.com/demos/${slug}/`,
      pageViews: 0,
      sessions: new Set(),
      ctaClicks: 0,
      telClicks: 0,
      mailtoClicks: 0,
      maxScrollDepth: 0,
      maxEngagedSeconds: 0,
      sources: new Map(),
      lastSeen: "",
      lastAction: "",
      eventTrail: []
    };

    if (event.sessionId) prospect.sessions.add(event.sessionId);
    if (event.type === "page_view") prospect.pageViews += 1;
    if (event.type === "cta_click") prospect.ctaClicks += 1;
    if (event.type === "tel_click") prospect.telClicks += 1;
    if (event.type === "mailto_click") prospect.mailtoClicks += 1;
    prospect.maxScrollDepth = Math.max(prospect.maxScrollDepth, event.scrollDepth || 0);
    prospect.maxEngagedSeconds = Math.max(prospect.maxEngagedSeconds, event.engagedSeconds || 0);
    prospect.lastSeen = event.timestamp || prospect.lastSeen;
    prospect.lastAction = readableEventType(event.type);
    prospect.eventTrail.push(slimEvent(event));

    const source = event.utmSource || sourceFromReferrer(event.referrer) || "direct";
    if (event.type === "page_view") {
      prospect.sources.set(source, (prospect.sources.get(source) || 0) + 1);
      sources.set(source, (sources.get(source) || 0) + 1);
    }

    prospects.set(slug, prospect);
  }

  const prospectList = [...prospects.values()].map((prospect) => {
    const normalized = {
      ...prospect,
      sessions: prospect.sessions.size,
      sources: topFromMap(prospect.sources, 3)
    };
    const score = scoreProspectDay(normalized);
    return {
      ...normalized,
      score,
      status: statusForScore(score),
      nextStep: nextStepForProspect(normalized)
    };
  }).sort(sortByScoreThenLastSeen);

  return {
    pageViews: events.filter((event) => event.type === "page_view").length,
    sessions: uniqueCount(events.map((event) => event.sessionId)),
    ctaClicks: events.filter((event) => event.type === "cta_click").length,
    telClicks: events.filter((event) => event.type === "tel_click").length,
    mailtoClicks: events.filter((event) => event.type === "mailto_click").length,
    activeProspects: prospectList.length,
    hotProspects: prospectList.filter((prospect) => prospect.score >= 45).slice(0, 12),
    topProspects: prospectList.slice(0, 12),
    followUpQueue: prospectList.filter((prospect) => prospect.score >= 30 || prospect.ctaClicks || prospect.telClicks || prospect.mailtoClicks).slice(0, 12),
    topSources: topFromMap(sources, 8),
    recentEvents: events.slice(-12).reverse().map(slimEvent)
  };
}

function renderDailyReportEmail(report) {
  const subject = `JPAX Site Intelligence Daily Report - ${report.reportDateLabel}`;
  const preheader = buildPreheader(report);
  const html = renderHtml(report, subject, preheader);
  const text = renderText(report, subject);

  return {
    to: report.recipient,
    from: env("DAILY_REPORT_FROM") || DEFAULT_REPORT_FROM,
    subject,
    html,
    text
  };
}

async function sendReportEmail(email) {
  const resendKey = env("RESEND_API_KEY");
  if (resendKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${resendKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        from: email.from,
        to: splitRecipients(email.to),
        subject: email.subject,
        html: email.html,
        text: email.text
      })
    });

    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      provider: "resend",
      status: response.status,
      messageId: data.id || "",
      error: response.ok ? "" : data.message || data.error || "Resend email request failed."
    };
  }

  return {
    ok: false,
    provider: "none",
    error: "Email provider is not configured. Set RESEND_API_KEY."
  };
}

async function persistPreview(store, report, email, metadata = {}) {
  const key = `reports/${report.reportDate}.json`;
  await store.setJSON(key, {
    reportDate: report.reportDate,
    generatedAt: report.generatedAt,
    subject: email.subject,
    to: email.to,
    summary: publicReportSummary(report),
    metadata
  });
}

function renderHtml(report, subject, preheader) {
  const accent = "#4ADE80";
  const green2 = "#10B981";
  const dark = "#06080F";
  const dark2 = "#0C101C";
  const dark3 = "#0F172A";
  const border = "#1E2A3D";
  const text = "#E2E8F0";
  const muted = "#94A3B8";
  const faint = "#64748B";
  const white = "#F8FAFC";

  const kpis = [
    ["Total Views", report.totals.pageViews],
    ["Sessions", report.totals.sessions],
    ["CTA Clicks", report.totals.ctaClicks],
    ["Phone / Email", report.totals.phoneClicks + report.totals.emailClicks],
    ["Conversions", report.totals.conversions],
    ["Hot Signals", report.totals.hotSignals]
  ];

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;background:${dark};color:${text};font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${dark};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:880px;border:1px solid ${border};background:${dark2};border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 22px;border-bottom:2px solid ${accent};background:${dark};">
              <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${accent};font-weight:700;">JPAX Site Intelligence</div>
              <h1 style="margin:10px 0 6px;font-size:30px;line-height:1.08;color:${white};font-weight:800;">Daily Signal Report</h1>
              <div style="font-size:14px;color:${muted};">Yesterday: ${escapeHtml(report.reportDateLabel)} · Generated ${escapeHtml(report.generatedAtLabel)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  ${kpis.map(([label, value]) => `<td style="width:16.66%;padding:0 6px 12px 0;vertical-align:top;">
                    <div style="background:${dark3};border:1px solid ${border};border-top:3px solid ${accent};border-radius:8px;padding:14px 12px;">
                      <div style="font-size:24px;line-height:1;color:${accent};font-weight:800;">${escapeHtml(formatNumber(value))}</div>
                      <div style="margin-top:7px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${faint};font-weight:700;">${escapeHtml(label)}</div>
                    </div>
                  </td>`).join("")}
                </tr>
              </table>

              ${renderExecutiveSummary(report, { dark3, border, accent, text, muted, white })}
              ${renderRecommendations(report, { dark3, border, accent, text, muted, white })}
              ${renderProspectQueue(report, { dark3, border, accent, green2, text, muted, faint, white })}
              ${renderSitePages(report, { dark3, border, accent, green2, text, muted, faint, white })}
              ${renderSources(report, { dark3, border, accent, text, muted, faint, white })}
              ${renderJourneys(report, { dark3, border, accent, text, muted, faint, white })}

              <div style="margin-top:24px;padding:18px;background:${dark3};border:1px solid ${border};border-left:4px solid ${accent};border-radius:0 8px 8px 0;">
                <div style="font-size:14px;color:${white};font-weight:700;">Dashboard</div>
                <div style="margin-top:6px;font-size:13px;color:${muted};">Open the live dashboard for full page and prospect detail.</div>
                <a href="${escapeHtml(report.dashboardUrl)}" style="display:inline-block;margin-top:14px;background:${accent};color:${dark};text-decoration:none;font-weight:800;font-size:13px;padding:11px 14px;border-radius:6px;">Open JPAX Site Intelligence</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-top:1px solid ${border};font-size:12px;color:${faint};">
              JPAX Media LLC | Build. Rise. Scale. · This report uses first-party JPAX Site Intelligence and prospect demo events.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderExecutiveSummary(report, colors) {
  const topProspect = report.prospects.topProspects[0];
  const topPage = report.site.topPages[0];
  const rows = [
    topProspect ? `Top prospect signal: ${topProspect.name} (${topProspect.status}, score ${topProspect.score}).` : "No prospect demo visits recorded yesterday.",
    topPage ? `Top site page: ${topPage.pageName} (${topPage.views} views, ${topPage.ctaClicks} CTA clicks).` : "No JPAX site page views recorded yesterday.",
    report.totals.ctaClicks || report.totals.phoneClicks || report.totals.emailClicks
      ? `${report.totals.ctaClicks} CTA clicks, ${report.totals.phoneClicks} phone clicks, and ${report.totals.emailClicks} email clicks across all tracked surfaces.`
      : "No CTA, phone, or email clicks recorded yesterday."
  ];

  return sectionBlock("Executive Summary", rows.map((row) => `<li style="margin:0 0 8px;color:${colors.text};">${escapeHtml(row)}</li>`).join(""), colors, "ul");
}

function renderRecommendations(report, colors) {
  const items = report.recommendations.length
    ? report.recommendations.map((item) => `<li style="margin:0 0 8px;color:${colors.text};">${escapeHtml(item)}</li>`).join("")
    : `<li style="margin:0;color:${colors.text};">No urgent follow-up needed from yesterday's activity.</li>`;
  return sectionBlock("Recommended Actions", items, colors, "ul");
}

function renderProspectQueue(report, colors) {
  const prospects = report.prospects.followUpQueue;
  const body = prospects.length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
      ${tableHead(["Prospect", "Score", "Signals", "Next Step"], colors)}
    </tr>
    ${prospects.map((prospect) => `<tr>
      ${tableCell(`<strong style="color:${colors.white};">${escapeHtml(prospect.name)}</strong><br><span style="color:${colors.faint};">${escapeHtml(prospect.demoUrl)}</span>`, colors)}
      ${tableCell(`<span style="color:${colors.accent};font-weight:800;">${prospect.score}</span><br><span style="color:${colors.faint};">${escapeHtml(prospect.status)}</span>`, colors)}
      ${tableCell(`${prospect.pageViews} views · ${prospect.sessions} sessions<br>${prospect.ctaClicks} CTA · ${prospect.telClicks} phone · ${prospect.mailtoClicks} email`, colors)}
      ${tableCell(escapeHtml(prospect.nextStep), colors)}
    </tr>`).join("")}
  </table>` : `<p style="margin:0;color:${colors.muted};font-size:13px;">No prospects crossed the follow-up threshold yesterday.</p>`;

  return sectionBlock("Prospect Follow-Up Queue", body, colors);
}

function renderSitePages(report, colors) {
  const pages = report.site.topPages;
  const body = pages.length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
      ${tableHead(["Page", "Score", "Activity", "Source"], colors)}
    </tr>
    ${pages.map((page) => `<tr>
      ${tableCell(`<strong style="color:${colors.white};">${escapeHtml(page.pageName)}</strong><br><span style="color:${colors.faint};">${escapeHtml(page.path)}</span>`, colors)}
      ${tableCell(`<span style="color:${colors.accent};font-weight:800;">${page.score}</span><br><span style="color:${colors.faint};">${escapeHtml(page.status)}</span>`, colors)}
      ${tableCell(`${page.views} views · ${page.sessions} sessions<br>${page.ctaClicks} CTA · ${page.conversions} conversions`, colors)}
      ${tableCell(escapeHtml(page.sources[0]?.label || "direct"), colors)}
    </tr>`).join("")}
  </table>` : `<p style="margin:0;color:${colors.muted};font-size:13px;">No site page activity recorded yesterday.</p>`;

  return sectionBlock("Top JPAX Site Pages", body, colors);
}

function renderSources(report, colors) {
  const siteSources = report.site.topSources.map((source) => `${source.label}: ${source.value}`).join(" · ") || "No site sources";
  const prospectSources = report.prospects.topSources.map((source) => `${source.label}: ${source.value}`).join(" · ") || "No prospect sources";

  return sectionBlock("Traffic Sources", `
    <p style="margin:0 0 8px;color:${colors.text};font-size:13px;"><strong style="color:${colors.white};">Site:</strong> ${escapeHtml(siteSources)}</p>
    <p style="margin:0;color:${colors.text};font-size:13px;"><strong style="color:${colors.white};">Prospects:</strong> ${escapeHtml(prospectSources)}</p>
  `, colors);
}

function renderJourneys(report, colors) {
  const sessions = report.site.topSessions;
  const body = sessions.length ? sessions.map((session) => {
    const journey = session.journey.map((step) => step.pageName || step.path).filter(Boolean).slice(0, 5).join(" -> ");
    return `<div style="padding:10px 0;border-bottom:1px solid ${colors.border};">
      <div style="font-size:13px;color:${colors.white};font-weight:700;">${escapeHtml(session.source || "direct")} · ${session.pageViews} page views · score ${session.score}</div>
      <div style="margin-top:4px;font-size:12px;color:${colors.muted};">${escapeHtml(journey || "No page journey captured")}</div>
    </div>`;
  }).join("") : `<p style="margin:0;color:${colors.muted};font-size:13px;">No multi-page site journeys recorded yesterday.</p>`;

  return sectionBlock("Notable Site Journeys", body, colors);
}

function sectionBlock(title, body, colors, listTag = "") {
  const content = listTag === "ul"
    ? `<ul style="margin:0;padding-left:18px;">${body}</ul>`
    : body;

  return `<div style="margin-top:22px;background:${colors.dark3};border:1px solid ${colors.border};border-radius:8px;padding:18px;">
    <div style="font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:${colors.accent};font-weight:800;margin-bottom:12px;">${escapeHtml(title)}</div>
    ${content}
  </div>`;
}

function tableHead(labels, colors) {
  return labels.map((label) => `<th align="left" style="padding:10px 9px;background:#06080F;border-bottom:1px solid ${colors.border};color:${colors.accent};font-size:10px;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(label)}</th>`).join("");
}

function tableCell(content, colors) {
  return `<td style="padding:11px 9px;border-bottom:1px solid ${colors.border};color:${colors.text};font-size:12px;line-height:1.45;vertical-align:top;">${content}</td>`;
}

function renderText(report, subject) {
  const lines = [
    subject,
    `Yesterday: ${report.reportDateLabel}`,
    "",
    "Summary",
    `Total views: ${report.totals.pageViews}`,
    `Sessions: ${report.totals.sessions}`,
    `CTA clicks: ${report.totals.ctaClicks}`,
    `Phone clicks: ${report.totals.phoneClicks}`,
    `Email clicks: ${report.totals.emailClicks}`,
    `Conversions: ${report.totals.conversions}`,
    "",
    "Recommended actions",
    ...(report.recommendations.length ? report.recommendations.map((item) => `- ${item}`) : ["- No urgent follow-up needed from yesterday's activity."]),
    "",
    "Top prospects",
    ...(report.prospects.topProspects.length
      ? report.prospects.topProspects.slice(0, 8).map((prospect) => `- ${prospect.name}: score ${prospect.score}, ${prospect.pageViews} views, ${prospect.ctaClicks} CTA, ${prospect.telClicks} phone, ${prospect.mailtoClicks} email. ${prospect.nextStep}`)
      : ["- No prospect demo visits recorded yesterday."]),
    "",
    "Top site pages",
    ...(report.site.topPages.length
      ? report.site.topPages.slice(0, 8).map((page) => `- ${page.pageName}: score ${page.score}, ${page.views} views, ${page.ctaClicks} CTA, ${page.conversions} conversions. ${page.path}`)
      : ["- No JPAX site page views recorded yesterday."]),
    "",
    `Dashboard: ${report.dashboardUrl}`
  ];

  return lines.join("\n");
}

function buildRecommendations(site, prospects) {
  const actions = [];

  for (const prospect of prospects.followUpQueue.slice(0, 5)) {
    actions.push(`${prospect.name}: ${prospect.nextStep}`);
  }

  for (const page of site.hotPages.slice(0, 3)) {
    if (page.conversions || page.ctaClicks) {
      actions.push(`Review ${page.pageName}: ${page.ctaClicks} CTA clicks and ${page.conversions} conversions yesterday.`);
    } else if (page.views >= 5) {
      actions.push(`Check ${page.pageName}: higher traffic with no conversion signal yet.`);
    }
  }

  return dedupe(actions).slice(0, 8);
}

function nextStepForProspect(prospect) {
  if (prospect.telClicks) return "Call or text first; they tapped the phone CTA.";
  if (prospect.mailtoClicks) return "Email first; they tapped the email CTA.";
  if (prospect.ctaClicks) return "Prioritize follow-up; they clicked a primary CTA.";
  if (prospect.maxEngagedSeconds >= 45) return "Follow up with a specific note; they spent meaningful time on the demo.";
  if (prospect.maxScrollDepth >= 75) return "Follow up lightly; they saw most of the page.";
  if (prospect.pageViews > 1 || prospect.sessions > 1) return "Monitor and consider a short check-in.";
  return "Monitor.";
}

function buildPreheader(report) {
  const top = report.prospects.topProspects[0]?.name || report.site.topPages[0]?.pageName || "No high-priority signal";
  return `${report.totals.pageViews} views, ${report.totals.sessions} sessions, ${report.totals.ctaClicks} CTA clicks. Top signal: ${top}.`;
}

function publicReportSummary(report) {
  return {
    reportDate: report.reportDate,
    reportDateLabel: report.reportDateLabel,
    generatedAt: report.generatedAt,
    totals: report.totals,
    topProspects: report.prospects.topProspects.slice(0, 5).map((prospect) => ({
      name: prospect.name,
      score: prospect.score,
      status: prospect.status,
      pageViews: prospect.pageViews,
      ctaClicks: prospect.ctaClicks,
      nextStep: prospect.nextStep
    })),
    topPages: report.site.topPages.slice(0, 5).map((page) => ({
      pageName: page.pageName,
      path: page.path,
      score: page.score,
      status: page.status,
      views: page.views,
      ctaClicks: page.ctaClicks,
      conversions: page.conversions
    })),
    recommendations: report.recommendations
  };
}

function scoreSitePage(page) {
  return Math.min(
    100,
    page.views * 6 +
    page.sessions * 8 +
    page.ctaClicks * 22 +
    page.telClicks * 18 +
    page.mailtoClicks * 18 +
    page.conversions * 34 +
    Math.floor(page.maxScrollDepth / 10) +
    Math.min(Math.floor(page.maxEngagedSeconds / 20) * 4, 16)
  );
}

function scoreSiteSession(session) {
  return Math.min(100, session.pageViews * 10 + session.ctaClicks * 28 + session.conversions * 40 + Math.min(session.events * 2, 16));
}

function scoreProspectDay(prospect) {
  return Math.min(
    100,
    prospect.pageViews * 10 +
    prospect.sessions * 12 +
    prospect.ctaClicks * 34 +
    prospect.telClicks * 28 +
    prospect.mailtoClicks * 28 +
    Math.floor(prospect.maxScrollDepth / 10) +
    Math.min(Math.floor(prospect.maxEngagedSeconds / 15) * 5, 18)
  );
}

function statusForScore(score) {
  if (score >= 70) return "hot";
  if (score >= 35) return "warm";
  if (score > 0) return "watch";
  return "cold";
}

function sortByScoreThenLastSeen(a, b) {
  if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
  return Date.parse(b.lastSeen || 0) - Date.parse(a.lastSeen || 0);
}

function slimEvent(event) {
  return {
    type: event.type,
    label: readableEventType(event.type),
    timestamp: event.timestamp,
    time: formatTime(event.timestamp),
    path: event.path || "",
    pageName: event.pageName || event.prospectName || event.title || "",
    targetText: event.targetText || "",
    targetUrl: event.targetUrl || "",
    scrollDepth: event.scrollDepth || 0,
    engagedSeconds: event.engagedSeconds || 0
  };
}

function readableEventType(type = "") {
  return type
    .replace(/^site_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sourceFromReferrer(referrer) {
  if (!referrer) return "";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host || host === "jpaxmedia.com") return "internal";
    return host;
  } catch {
    return "";
  }
}

function topFromMap(map, limit) {
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit);
}

function uniqueCount(values) {
  return new Set(values.filter(Boolean)).size;
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}

function localDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
}

function previousLocalDateKey(now) {
  const currentLocal = localDateKey(now);
  return shiftDateKey(currentLocal, -1);
}

function localHourOf(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    hour12: false
  }).formatToParts(date);

  return Number(part(parts, "hour"));
}

function shiftDateKey(dateKey, amount) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(date);
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function cleanDateKey(value) {
  const text = typeof value === "string" ? value.trim() : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function part(parts, type) {
  return parts.find((item) => item.type === type)?.value || "";
}

function titleCase(value) {
  return String(value || "").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function splitRecipients(value) {
  return String(value || DEFAULT_REPORT_TO)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function env(name) {
  return globalThis.Netlify?.env?.get?.(name) || process.env[name] || "";
}
