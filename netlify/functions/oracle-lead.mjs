// JPAX Oracle — lead capture.
// A visitor who builds a project in the Oracle leaves name + email. This:
//   1) emails THE PROSPECT an instant branded "game plan" (their services + how JPAX helps),
//   2) emails JULIAN a lead alert (so no lead is ever lost, even if the table doesn't exist),
//   3) best-effort logs the lead to Supabase (oracle_leads) for a dashboard.
// All via env already set on the Netlify site (RESEND_API_KEY, *_EMAIL_FROM, SUPABASE_*).
// Honeypot + entered-address-only sending keep a public endpoint from being abused.

const JPAX_EMAIL = "julian@jpaxmedia.com";

const LANE_INFO = {
  website: { label: "Website", blurb: "A professional site — or a site wired into your operations.", anchor: "from $3,500" },
  app:     { label: "Custom app / portal", blurb: "A login, dashboard, or operating tool that runs part of your business.", anchor: "by proposal" },
  ai:      { label: "AI & automation", blurb: "Governed workflows that remove the manual, repetitive work.", anchor: "sprints from $5,000" },
  elara:   { label: "Creator system (Elara)", blurb: "Brand deals, revenue, content ops, and sponsors in one place.", anchor: "from $2,500 setup" },
  brand:   { label: "Brand & identity", blurb: "Logo, colors, and messaging that make you look like a real company.", anchor: "from $8,000 with a site" },
  content: { label: "Content, social & ads", blurb: "Social, short-form video, and ad creative run as a system.", anchor: "from $950" }
};

function esc(v = "") {
  return String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254; }

function prospectEmailHtml(name, lanes) {
  const rows = lanes.map((k) => {
    const info = LANE_INFO[k]; if (!info) return "";
    return `<tr>
      <td style="padding:14px 16px;border-bottom:1px solid #E2E8F0;vertical-align:top;">
        <div style="font-weight:700;color:#0F172A;font-size:15px;">${esc(info.label)}</div>
        <div style="color:#475569;font-size:13.5px;margin-top:3px;line-height:1.5;">${esc(info.blurb)}</div>
      </td>
      <td style="padding:14px 16px;border-bottom:1px solid #E2E8F0;text-align:right;white-space:nowrap;vertical-align:top;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:12.5px;color:#0F172A;font-weight:600;">${esc(info.anchor)}</span>
      </td>
    </tr>`;
  }).join("");
  const hi = name ? `Hi ${esc(name)},` : "Hi there,";
  return `<!doctype html><html><body style="margin:0;background:#0C101C;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:0 0 32px;">
    <div style="background:#06080F;padding:28px 24px 22px;text-align:center;">
      <div style="font-family:'Chakra Petch',Arial,sans-serif;font-size:22px;font-weight:700;color:#F8FAFC;letter-spacing:.5px;">The JPAX <span style="color:#4ADE80;">Oracle</span></div>
      <div style="color:#94A3B8;font-size:12px;margin-top:6px;letter-spacing:.06em;text-transform:uppercase;">Your game plan</div>
    </div>
    <div style="background:#FFFFFF;padding:28px 24px;">
      <p style="color:#0F172A;font-size:15px;line-height:1.6;margin:0 0 14px;">${hi}</p>
      <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 20px;">Thanks for consulting the Oracle. Based on what you described, here's what JPAX would build for you — and where things start:</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;">${rows}</table>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:20px 0 6px;">The smart move is to scope these as <strong>one connected system</strong> in a short strategy session — so your site, content, and tools actually work together instead of as separate pieces.</p>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:14px 16px;margin:18px 0;">
        <strong style="color:#166534;">Julian will personally reply within 24 hours</strong>
        <span style="color:#15803D;font-size:14px;"> to map out the right next step. Just reply to this email with anything you'd add.</span>
      </div>
      <a href="https://jpaxmedia.com/start" style="display:inline-block;background:#10B981;color:#04130b;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:9px;font-size:14px;">Tell JPAX more →</a>
      <p style="color:#94A3B8;font-size:12px;line-height:1.6;margin:22px 0 0;">JPAX Media LLC · Build. Rise. Scale. · Greenville, SC<br>AI-powered websites, content systems &amp; operating tools.</p>
    </div>
  </div></body></html>`;
}

function alertEmailHtml(name, email, lanes, message) {
  const list = lanes.map((k) => `<li>${esc((LANE_INFO[k] || {}).label || k)}</li>`).join("");
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0F172A;">
    <h2 style="margin:0 0 6px;">🔮 New Oracle lead</h2>
    <p style="margin:0 0 12px;color:#475569;">From the Oracle on jpaxmedia.com</p>
    <p><strong>Name:</strong> ${esc(name) || "(not given)"}<br>
       <strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
    <p><strong>Services they stacked:</strong></p>
    <ul>${list || "<li>(none detected)</li>"}</ul>
    ${message ? `<p><strong>Note:</strong> ${esc(message)}</p>` : ""}
    <p style="color:#64748B;font-size:13px;">Reply directly to this email to reach them. A branded game-plan email was already sent to the prospect.</p>
  </body></html>`;
}

async function sendEmail({ apiKey, from, to, subject, html, replyTo }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) })
  });
  if (!res.ok) console.error("oracle-lead: resend", res.status, await res.text());
  return res.ok;
}

async function logToSupabase(row) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/oracle_leads`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row)
    });
    if (!res.ok) console.error("oracle-lead: supabase", res.status, await res.text());
  } catch (e) { console.error("oracle-lead: supabase insert failed", e); }
}

export default async function handler(request) {
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);

  let body;
  try { body = await request.json(); } catch { body = {}; }

  // Honeypot — bots fill hidden fields. Pretend success, send nothing.
  if (String(body.website || "").trim()) return json({ ok: true });

  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim().slice(0, 80);
  const message = String(body.message || "").trim().slice(0, 600);
  const lanes = Array.isArray(body.lanes)
    ? [...new Set(body.lanes.filter((k) => LANE_INFO[k]))].slice(0, 6)
    : [];

  if (!validEmail(email)) return json({ ok: false, error: "Please enter a valid email." }, 200);
  if (!lanes.length) return json({ ok: false, error: "Ask the Oracle about a service first." }, 200);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PROPOSAL_ACCEPTANCE_EMAIL_FROM
    || process.env.DAILY_REPORT_FROM
    || "JPAX Media <onboarding@resend.dev>";

  if (!apiKey) {
    // No email provider configured — still log, and tell the widget to fall back to mailto.
    await logToSupabase({ name, email, lanes, message, source: "oracle", user_agent: request.headers.get("user-agent") || "" });
    return json({ ok: false, error: "Email is not configured." }, 200);
  }

  // Send the prospect's game plan + Julian's alert in parallel; log best-effort.
  const [prospectOk] = await Promise.all([
    sendEmail({ apiKey, from, to: email, replyTo: JPAX_EMAIL,
      subject: "Your JPAX game plan 🔮", html: prospectEmailHtml(name, lanes) }),
    sendEmail({ apiKey, from, to: JPAX_EMAIL, replyTo: email,
      subject: `🔮 New Oracle lead: ${name || email}`, html: alertEmailHtml(name, email, lanes, message) }),
    logToSupabase({ name, email, lanes, message, source: "oracle", user_agent: request.headers.get("user-agent") || "" })
  ]);

  if (!prospectOk) return json({ ok: false, error: "Could not send right now." }, 200);
  return json({ ok: true });
}

export const config = { path: "/api/oracle-lead" };
