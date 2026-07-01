import { enrichSitePayload, jsonResponse, optionsResponse, readJson, rpc } from "../lib/supabase-prospecting.mjs";

const SITE_TRACK_CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400"
};

export default async function handler(request, context) {
  if (request.method === "OPTIONS") return optionsResponse(SITE_TRACK_CORS_HEADERS);
  if (request.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed." }, 405, SITE_TRACK_CORS_HEADERS);

  try {
    const body = await readJson(request);
    const payload = enrichSitePayload(request, context, body);
    const result = await rpc("jpax_record_site_event", { payload });
    if (!result?.ok) return jsonResponse({ ok: false, error: result?.message || "Unable to record site event." }, result?.status || 400, SITE_TRACK_CORS_HEADERS);
    return jsonResponse({ ok: true, id: result.id, score: result.score, status: result.status }, 200, SITE_TRACK_CORS_HEADERS);
  } catch (error) {
    console.error("site-track error", error);
    return jsonResponse({ ok: false, error: "Unable to record site event." }, error.status || 500, SITE_TRACK_CORS_HEADERS);
  }
}

export const config = {
  path: "/api/site-track"
};
