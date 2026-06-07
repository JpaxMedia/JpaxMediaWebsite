import { enrichSitePayload, jsonResponse, optionsResponse, readJson, rpc } from "../lib/supabase-prospecting.mjs";

export default async function handler(request, context) {
  if (request.method === "OPTIONS") return optionsResponse();
  if (request.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed." }, 405);

  try {
    const body = await readJson(request);
    const payload = enrichSitePayload(request, context, body);
    const result = await rpc("jpax_record_site_event", { payload });
    if (!result?.ok) return jsonResponse({ ok: false, error: result?.message || "Unable to record site event." }, result?.status || 400);
    return jsonResponse({ ok: true, id: result.id, score: result.score, status: result.status });
  } catch (error) {
    console.error("site-track error", error);
    return jsonResponse({ ok: false, error: "Unable to record site event." }, error.status || 500);
  }
}

export const config = {
  path: "/api/site-track"
};
