import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { prospects as prospectDirectory } from "./prospect-directory.mjs";

const DASHBOARD_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

export function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders }
  });
}

export function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type,x-dashboard-key,x-dashboard-session,authorization",
      "access-control-max-age": "86400"
    }
  });
}

export function isDashboardAuthorized(request) {
  const session = verifyDashboardSession(dashboardSessionFromRequest(request));
  if (session.ok) return { ok: true, email: session.email };

  const expected = dashboardLegacyKey();
  const provided = request.headers.get("x-dashboard-key") || "";
  if (expected && provided && safeEqualString(provided, expected)) return { ok: true, legacy: true };

  if (!dashboardAuthConfigured()) {
    return { ok: false, status: 503, message: "Dashboard sign-in is not configured." };
  }

  return { ok: false, status: 401, message: "Access denied." };
}

export function dashboardAuthConfigured() {
  return Boolean(dashboardLoginPassword() && dashboardSessionSecret());
}

export function dashboardLoginPassword() {
  return process.env.DASHBOARD_PASSWORD || process.env.PROSPECT_DASHBOARD_KEY || "";
}

export function createDashboardSession(email) {
  if (!dashboardSessionSecret()) throw new Error("Dashboard session signing is not configured.");

  const normalizedEmail = normalizeEmail(email);
  const expiresAtMs = Date.now() + DASHBOARD_SESSION_TTL_MS;
  const payload = base64UrlEncode(JSON.stringify({
    email: normalizedEmail,
    exp: expiresAtMs
  }));

  return {
    token: `${payload}.${signDashboardPayload(payload)}`,
    email: normalizedEmail,
    expiresAt: new Date(expiresAtMs).toISOString()
  };
}

export function isAllowedDashboardEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  const allowed = allowedDashboardEmails();
  if (!normalizedEmail) return false;
  if (allowed.includes("*")) return true;
  return allowed.includes(normalizedEmail);
}

export function verifyDashboardPassword(password) {
  const expected = dashboardLoginPassword();
  return Boolean(expected) && safeEqualString(password || "", expected);
}

function dashboardLegacyKey() {
  return process.env.PROSPECT_DASHBOARD_KEY || "";
}

function dashboardSessionSecret() {
  return process.env.DASHBOARD_SESSION_SECRET || process.env.PROSPECT_DASHBOARD_KEY || process.env.DASHBOARD_PASSWORD || "";
}

function allowedDashboardEmails() {
  const configured = process.env.DASHBOARD_ALLOWED_EMAILS || "julian@jpaxmedia.com";
  return configured.split(/[,\s]+/).map(normalizeEmail).filter(Boolean);
}

function dashboardSessionFromRequest(request) {
  const directToken = request.headers.get("x-dashboard-session") || "";
  if (directToken) return directToken;

  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function verifyDashboardSession(token) {
  const value = String(token || "").trim();
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !dashboardSessionSecret()) return { ok: false };
  if (!safeEqualString(signature, signDashboardPayload(payload))) return { ok: false };

  try {
    const session = JSON.parse(base64UrlDecode(payload));
    if (!session?.email || !Number.isFinite(session.exp)) return { ok: false };
    if (session.exp <= Date.now()) return { ok: false };
    if (!isAllowedDashboardEmail(session.email)) return { ok: false };
    return { ok: true, email: normalizeEmail(session.email), expiresAt: new Date(session.exp).toISOString() };
  } catch {
    return { ok: false };
  }
}

function signDashboardPayload(payload) {
  return createHmac("sha256", dashboardSessionSecret()).update(payload).digest("base64url");
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function safeEqualString(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function rpc(name, args = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase prospecting environment is not configured.");

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(args)
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { message: text };
  }

  if (!response.ok) {
    const error = new Error(body?.message || body?.error || `Supabase RPC ${name} failed.`);
    error.status = response.status;
    error.details = body;
    throw error;
  }

  return body;
}

export async function getDashboardData() {
  const data = await rpc("jpax_prospect_dashboard");
  return mergeProspectDirectory(data);
}

export async function getSiteDashboardData() {
  const data = await rpc("jpax_site_dashboard");
  return normalizeSiteConversions(data);
}

export function mergeProspectDirectory(data = {}) {
  const eventProspects = Array.isArray(data.prospects) ? data.prospects : [];
  const prospects = new Map();

  for (const prospect of prospectDirectory) {
    prospects.set(prospect.slug, {
      ...prospectDefaults(prospect.slug),
      ...prospect
    });
  }

  for (const prospect of eventProspects) {
    const slug = cleanSlug(prospect.slug || slugFromDemoUrl(prospect.demoUrl || prospect.url || ""));
    if (!slug) continue;

    const directoryProspect = prospects.get(slug) || {};
    prospects.set(slug, {
      ...prospectDefaults(slug),
      ...directoryProspect,
      ...prospect,
      slug,
      name: directoryProspect.name || prospect.name || titleFromPath(slug),
      category: directoryProspect.category || prospect.category || "",
      city: directoryProspect.city || prospect.city || "",
      phone: directoryProspect.phone || prospect.phone || "",
      demoUrl: directoryProspect.demoUrl || prospect.demoUrl || `https://jpaxmedia.com/demos/${slug}/`,
      funnelUrl: directoryProspect.funnelUrl || prospect.funnelUrl || `https://jpaxmedia.com/free-website/?prospect=${slug}`,
      score: numberValue(prospect.score),
      status: prospect.status || statusForScore(numberValue(prospect.score)),
      pageViews: numberValue(prospect.pageViews),
      sessionCount: numberValue(prospect.sessionCount || prospect.sessions),
      ctaClicks: numberValue(prospect.ctaClicks),
      telClicks: numberValue(prospect.telClicks),
      mailtoClicks: numberValue(prospect.mailtoClicks),
      maxScrollDepth: numberValue(prospect.maxScrollDepth),
      maxEngagedSeconds: numberValue(prospect.maxEngagedSeconds),
      eventTrail: Array.isArray(prospect.eventTrail) ? prospect.eventTrail : [],
      sources: Array.isArray(prospect.sources) ? prospect.sources : []
    });
  }

  const mergedProspects = [...prospects.values()].sort(sortProspects);
  return {
    ...data,
    totals: mergeProspectTotals(data.totals || {}, mergedProspects),
    prospects: mergedProspects
  };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function enrichEventPayload(request, context, body) {
  const userAgent = request.headers.get("user-agent") || "";
  return {
    ...body,
    device: detectDevice(userAgent),
    bot: isLikelyBot(userAgent),
    geo: cleanGeo(context?.geo),
    ipHash: hashIp(context?.ip || request.headers.get("x-nf-client-connection-ip") || "")
  };
}

export function enrichSitePayload(request, context, body) {
  const payload = enrichEventPayload(request, context, body);
  const meta = pageMeta(payload.path || "/", payload.title || "");
  const conversion = isStrictConversionPath(payload.path);
  return {
    ...payload,
    conversion,
    conversionType: conversion ? "form_thank_you" : "",
    pageName: payload.pageName || meta.pageName,
    category: payload.category || meta.category,
    group: payload.group || meta.group
  };
}

export function normalizeSiteConversions(data = {}) {
  const pages = Array.isArray(data.pages) ? data.pages.map((page) => {
    const conversionCount = isStrictConversionPath(page.path)
      ? numberValue(page.conversionCount ?? page.conversions ?? page.pageViews ?? page.views)
      : 0;

    return {
      ...page,
      conversionCount,
      conversions: conversionCount
    };
  }) : [];

  const recentEvents = Array.isArray(data.recentEvents) ? data.recentEvents.map((event) => ({
    ...event,
    conversion: isStrictConversionEvent(event),
    conversionType: isStrictConversionEvent(event) ? "form_thank_you" : ""
  })) : [];

  return {
    ...data,
    totals: {
      ...(data.totals || {}),
      conversions: sum(pages, "conversionCount")
    },
    pages,
    recentEvents
  };
}

function pageMeta(path, title) {
  const cleanTitle = cleanText(title, 120).replace(/\s*[|–-]\s*JPAX.*$/i, "").trim();
  if (String(path).startsWith("/demos/")) return { pageName: cleanTitle || titleFromPath(path), category: "Prospect Demo", group: "demos" };
  if (String(path).startsWith("/free-website/thank-you")) return { pageName: "Free Website Sprint Thank You", category: "Sprint Funnel", group: "offers" };
  if (String(path).startsWith("/free-website")) return { pageName: "Free Website Sprint", category: "Sprint Offer", group: "offers" };
  if (String(path).startsWith("/pricing") || String(path).startsWith("/start")) return { pageName: cleanTitle || titleFromPath(path), category: "Offer Page", group: "offers" };
  if (String(path).startsWith("/elara") || String(path).startsWith("/jupiter") || String(path).startsWith("/tradeos")) return { pageName: cleanTitle || titleFromPath(path), category: "Product Page", group: "products" };
  if (String(path).startsWith("/blog")) return { pageName: cleanTitle || titleFromPath(path), category: "Content", group: "content" };
  if (String(path).startsWith("/oracle")) return { pageName: "The Oracle", category: "Interactive Tool", group: "tools" };
  if (String(path).startsWith("/roast")) return { pageName: "Roast Machine", category: "Interactive Tool", group: "tools" };
  if (String(path).startsWith("/visibility-score")) return { pageName: "Visibility Score", category: "Interactive Tool", group: "tools" };
  return { pageName: cleanTitle || titleFromPath(path), category: "Marketing Page", group: "marketing" };
}

function titleFromPath(path) {
  if (path === "/") return "JPAX Media";
  const part = String(path).split("/").filter(Boolean).pop() || "page";
  return part.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanText(value, max = 120) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanGeo(geo) {
  if (!geo) return {};
  return {
    city: cleanText(geo.city, 80),
    region: cleanText(geo.subdivision?.name || geo.region, 80),
    country: cleanText(geo.country?.name || geo.country, 80)
  };
}

function detectDevice(userAgent) {
  const value = String(userAgent || "").toLowerCase();
  if (/bot|crawl|spider|slurp|preview|facebookexternalhit|linkedinbot|twitterbot/.test(value)) return "bot";
  if (/mobile|iphone|android/.test(value)) return "mobile";
  if (/ipad|tablet/.test(value)) return "tablet";
  return "desktop";
}

function isLikelyBot(userAgent) {
  return detectDevice(userAgent) === "bot";
}

function hashIp(ip) {
  if (!ip) return "";
  const salt = process.env.PROSPECT_HASH_SALT || process.env.PROSPECT_DASHBOARD_KEY || "jpax";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24);
}

function isStrictConversionEvent(event) {
  return event?.type === "site_page_view" && isStrictConversionPath(event.path);
}

function isStrictConversionPath(path) {
  return String(path || "").replace(/\/+$/, "") === "/free-website/thank-you";
}

function prospectDefaults(slug) {
  return {
    slug,
    name: titleFromPath(slug),
    category: "",
    city: "",
    phone: "",
    demoUrl: `https://jpaxmedia.com/demos/${slug}/`,
    funnelUrl: `https://jpaxmedia.com/free-website/?prospect=${slug}`,
    score: 0,
    status: "cold",
    pageViews: 0,
    sessionCount: 0,
    ctaClicks: 0,
    telClicks: 0,
    mailtoClicks: 0,
    maxScrollDepth: 0,
    maxEngagedSeconds: 0,
    lastSeen: "",
    lastRid: "",
    lastReferrer: "",
    eventTrail: [],
    sources: []
  };
}

function mergeProspectTotals(totals, prospects) {
  return {
    ...totals,
    trackedProspects: prospects.length,
    activeProspects: prospects.filter((prospect) => Boolean(prospect.lastSeen)).length,
    hotProspects: prospects.filter((prospect) => prospect.status === "hot").length,
    warmProspects: prospects.filter((prospect) => prospect.status === "warm").length,
    pageViews: numberValue(totals.pageViews ?? sum(prospects, "pageViews")),
    sessions: numberValue(totals.sessions ?? sum(prospects, "sessionCount")),
    ctaClicks: numberValue(totals.ctaClicks ?? sum(prospects, "ctaClicks")),
    telClicks: numberValue(totals.telClicks ?? sum(prospects, "telClicks")),
    mailtoClicks: numberValue(totals.mailtoClicks ?? sum(prospects, "mailtoClicks"))
  };
}

function sortProspects(a, b) {
  return statusRank(a.status) - statusRank(b.status) ||
    numberValue(b.score) - numberValue(a.score) ||
    dateValue(b.lastSeen) - dateValue(a.lastSeen) ||
    String(a.name || a.slug).localeCompare(String(b.name || b.slug));
}

function statusForScore(score) {
  if (score >= 70) return "hot";
  if (score >= 35) return "warm";
  if (score > 0) return "watch";
  return "cold";
}

function statusRank(status) {
  if (status === "hot") return 0;
  if (status === "warm") return 1;
  if (status === "watch") return 2;
  if (status === "cold") return 4;
  return 3;
}

function numberValue(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function dateValue(value) {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? time : 0;
}

function sum(items, key) {
  return items.reduce((total, item) => total + numberValue(item[key]), 0);
}

function cleanSlug(value) {
  return String(value || "").trim().replace(/^\/?demos\//, "").replace(/\/.*$/, "");
}

function slugFromDemoUrl(url) {
  const match = String(url || "").match(/\/demos\/([^/?#]+)/);
  return match ? match[1] : "";
}
