import { getSiteDashboardData, isDashboardAuthorized, jsonResponse, optionsResponse } from "../lib/supabase-prospecting.mjs";

export default async function handler(request) {
  if (request.method === "OPTIONS") return optionsResponse();
  if (request.method !== "GET") return jsonResponse({ ok: false, error: "Method not allowed." }, 405);

  const auth = isDashboardAuthorized(request);
  if (!auth.ok) return jsonResponse({ ok: false, error: auth.message }, auth.status);

  try {
    const data = await getSiteDashboardData();
    return jsonResponse({ ok: true, ...data });
  } catch (error) {
    console.error("site-dashboard error", error);
    return jsonResponse({ ok: false, error: "Unable to load site dashboard." }, error.status || 500);
  }
}

export const config = {
  path: "/api/site-dashboard"
};
