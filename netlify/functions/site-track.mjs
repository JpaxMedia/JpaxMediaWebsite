import { enrichSitePayload, jsonResponse, optionsResponse, readJson, rpc } from "../lib/supabase-site-intelligence.mjs";

const SITE_TRACK_CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400"
};

// Best-effort per-instance rate limit (survives warm invocations). The durable
// per-visitor limit lives in the jpax_record_site_event RPC; this just sheds
// obvious floods before they cost a Supabase round-trip.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_WINDOW = 120;
const rateBuckets = new Map();

function isRateLimited(key) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const hits = (rateBuckets.get(key) || []).filter((time) => time > windowStart);
  hits.push(now);
  rateBuckets.set(key, hits);

  // Keep the map from growing unbounded across many distinct callers.
  if (rateBuckets.size > 5000) {
    for (const [bucketKey, bucketHits] of rateBuckets) {
      if (!bucketHits.some((time) => time > windowStart)) rateBuckets.delete(bucketKey);
    }
  }

  return hits.length > RATE_LIMIT_MAX_PER_WINDOW;
}

export default async function handler(request, context) {
  if (request.method === "OPTIONS") return optionsResponse(SITE_TRACK_CORS_HEADERS);
  if (request.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed." }, 405, SITE_TRACK_CORS_HEADERS);

  try {
    const body = await readJson(request);
    const payload = enrichSitePayload(request, context, body);

    // Bots get a cheerful 200 and no Supabase write at all.
    if (payload.bot) {
      return jsonResponse({ ok: true, ignored: true }, 200, SITE_TRACK_CORS_HEADERS);
    }

    const rateKey = payload.ipHash || payload.visitorId || "unknown";
    if (isRateLimited(rateKey)) {
      return jsonResponse({ ok: false, error: "Too many requests." }, 429, SITE_TRACK_CORS_HEADERS);
    }

    const result = await rpc("jpax_record_site_event", { payload });
    if (!result?.ok) return jsonResponse({ ok: false, error: result?.message || "Unable to record site event." }, result?.status || 400, SITE_TRACK_CORS_HEADERS);
    return jsonResponse({ ok: true, id: result.id, score: result.score, status: result.status }, 200, SITE_TRACK_CORS_HEADERS);
  } catch (error) {
    if (error?.status !== 413) console.error("site-track error", error);
    return jsonResponse({ ok: false, error: error?.status === 413 ? "Payload too large." : "Unable to record site event." }, error.status || 500, SITE_TRACK_CORS_HEADERS);
  }
}

export const config = {
  path: "/api/site-track"
};
