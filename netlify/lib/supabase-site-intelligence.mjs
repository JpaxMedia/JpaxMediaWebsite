import { createHash, createHmac, timingSafeEqual } from "node:crypto";

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

export function optionsResponse(extraHeaders = {}) {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type,x-dashboard-key,x-dashboard-session,authorization",
      "access-control-max-age": "86400",
      ...extraHeaders
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
  if (!url || !key) throw new Error("Supabase site intelligence environment is not configured.");

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

export async function getSiteDashboardData() {
  const data = await rpc("jpax_site_dashboard");
  return normalizeSiteConversions(data);
}

// Cap request bodies so a hostile client can't stuff megabytes of JSON into
// the pipeline (raw payloads used to be stored verbatim in Supabase).
const MAX_JSON_BODY_BYTES = 10_000;

export async function readJson(request, maxBytes = MAX_JSON_BODY_BYTES) {
  let text = "";
  try {
    text = await request.text();
  } catch {
    return {};
  }

  if (text.length > maxBytes) {
    const error = new Error("Payload too large.");
    error.status = 413;
    throw error;
  }

  try {
    return text ? JSON.parse(text) : {};
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
  // Canonicalize the path so a page tracked with and without a trailing slash
  // (e.g. "/oracle" vs "/oracle/") aggregates as one row, never two.
  const path = canonicalSitePath(payload.path);

  // SECURITY: site identity is derived from the browser's Origin header,
  // which a page cannot forge. Payload-claimed siteKey/siteHost/siteOrigin
  // are display hints at best. Non-browser senders (no valid Origin) are
  // bucketed under "unknown-site" so they can never pollute or overwrite a
  // real site's rows in Supabase.
  const requestOrigin = normalizeRequestOrigin(request.headers.get("origin"));
  const originHost = requestOrigin ? cleanSiteHost(requestOrigin) : "";

  const siteHost = originHost || cleanSiteHost(payload.siteHost || hostFromUrl(payload.url) || "unknown-site", "unknown-site");
  const siteKey = originHost ? cleanSiteKey(originHost) : "unknown-site";
  const siteOrigin = requestOrigin || `https://${siteHost}`;

  const meta = pageMeta(path, payload.title || "", siteKey);
  const conversion = isStrictConversionPath(path);
  return {
    ...payload,
    requestOrigin,
    siteKey,
    siteHost,
    siteOrigin,
    path,
    conversion,
    conversionType: conversion ? "form_thank_you" : "",
    pageName: payload.pageName || meta.pageName,
    category: payload.category || meta.category,
    group: payload.group || meta.group
  };
}

function normalizeRequestOrigin(value) {
  const origin = String(value || "").trim().toLowerCase().replace(/\/+$/, "");
  // "null" (sandboxed iframes, file://) and anything that isn't a plain
  // https?://host origin is treated as absent.
  return /^https?:\/\/[^/\s]+$/.test(origin) ? origin.slice(0, 240) : "";
}

function canonicalSitePath(value) {
  const path = String(value || "/").split("?")[0].split("#")[0].replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

function cleanSiteHost(value, fallback = "jpaxmedia.com") {
  return String(value || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/^www\./, "")
    .slice(0, 180) || fallback;
}

function cleanSiteKey(value) {
  return cleanSiteHost(value)
    .replace(/[^a-z0-9._:-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180) || "jpaxmedia.com";
}

function hostFromUrl(value) {
  try {
    return new URL(String(value || "")).hostname;
  } catch {
    return "";
  }
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

function pageMeta(path, title, siteKey = "jpaxmedia.com") {
  const cleanTitle = cleanText(title, 120).replace(/\s*[|–-]\s*JPAX.*$/i, "").trim();
  // The rules below describe jpaxmedia.com's information architecture.
  // Client sites get neutral metadata — their /pricing is not a JPAX
  // "Offer Page."
  if (siteKey !== "jpaxmedia.com") {
    return { pageName: cleanTitle || titleFromPath(path), category: "Client Site Page", group: "marketing" };
  }
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
  // Prefer a dedicated salt; fall back to secrets that are already server-only
  // so the hash is never brute-forceable with a public/guessable salt.
  const salt =
    process.env.SITE_INTELLIGENCE_HASH_SALT ||
    process.env.PROSPECT_HASH_SALT ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.PROSPECT_DASHBOARD_KEY ||
    "jpax";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24);
}

function isStrictConversionEvent(event) {
  return event?.type === "site_page_view" && isStrictConversionPath(event.path);
}

function isStrictConversionPath(path) {
  return /\/thank-you$/.test(String(path || "").replace(/\/+$/, ""));
}

function numberValue(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function sum(items, key) {
  return items.reduce((total, item) => total + numberValue(item[key]), 0);
}
