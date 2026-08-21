import {
  createDashboardSession,
  dashboardAuthConfigured,
  isAllowedDashboardEmail,
  jsonResponse,
  optionsResponse,
  readJson,
  verifyDashboardPassword
} from "../lib/supabase-site-intelligence.mjs";

export default async function handler(request) {
  if (request.method === "OPTIONS") return optionsResponse();
  if (request.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed." }, 405);

  if (!dashboardAuthConfigured()) {
    return jsonResponse({ ok: false, error: "Dashboard sign-in is not configured." }, 503);
  }

  let body;
  try {
    body = await readJson(request);
  } catch (error) {
    return jsonResponse({ ok: false, error: "Invalid request." }, error.status || 400);
  }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password || !isAllowedDashboardEmail(email) || !verifyDashboardPassword(password)) {
    return jsonResponse({ ok: false, error: "Invalid email or password." }, 401);
  }

  try {
    return jsonResponse({ ok: true, ...createDashboardSession(email) });
  } catch (error) {
    console.error("dashboard-login error", error);
    return jsonResponse({ ok: false, error: "Unable to create dashboard session." }, 500);
  }
}

export const config = {
  path: "/api/dashboard-login"
};
