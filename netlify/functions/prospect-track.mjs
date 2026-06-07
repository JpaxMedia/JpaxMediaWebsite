import { enrichEventPayload, jsonResponse, optionsResponse, readJson, rpc } from "../lib/supabase-prospecting.mjs";

export default async function handler(request, context) {
  if (request.method === "OPTIONS") return optionsResponse();
  if (request.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed." }, 405);

  try {
    const body = await readJson(request);
    const payload = enrichEventPayload(request, context, body);
    const result = await rpc("jpax_record_prospect_event", { payload });
    if (!result?.ok) return jsonResponse({ ok: false, error: result?.message || "Unable to record prospect event." }, result?.status || 400);
    return jsonResponse({ ok: true, id: result.id, score: result.score, status: result.status });
  } catch (error) {
    console.error("prospect-track error", error);
    return jsonResponse({ ok: false, error: "Unable to record prospect event." }, error.status || 500);
  }
}

export const config = {
  path: "/api/prospect-track"
};
