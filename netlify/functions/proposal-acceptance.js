const JPAX_EMAIL = "julian@jpaxmedia.com";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .trim();
}

function compact(value = "", max = 2400) {
  const cleaned = String(value).replace(/\s+/g, " ").trim();
  return cleaned.length > max ? `${cleaned.slice(0, max).trim()}...` : cleaned;
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function signatureBase64(dataUrl = "") {
  const match = String(dataUrl).match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  return match ? match[1] : "";
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, message: "Method not allowed." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.PROPOSAL_ACCEPTANCE_EMAIL_FROM ||
    process.env.CLIENT_INVITE_EMAIL_FROM ||
    process.env.NOVA_MORNING_EMAIL_FROM ||
    "JPAX Media <onboarding@resend.dev>";
  const to = process.env.PROPOSAL_ACCEPTANCE_EMAIL_TO || JPAX_EMAIL;

  if (!apiKey) {
    return jsonResponse(500, { ok: false, message: "Missing email configuration." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { ok: false, message: "Invalid JSON." });
  }

  if (payload["bot-field"]) {
    return jsonResponse(200, { ok: true, message: "Accepted." });
  }

  const fullName = compact(payload.full_name, 160);
  const email = compact(payload.email, 180);
  const businessName = compact(payload.business_name, 220);
  const signature = signatureBase64(payload.signature_data_url);

  if (!fullName || !email || !businessName || !signature) {
    return jsonResponse(400, { ok: false, message: "Missing required acceptance fields." });
  }

  const acceptedAt = payload.accepted_at || new Date().toISOString();
  const title = compact(payload.title, 160);
  const notes = compact(payload.notes, 1800);
  const proposalId = compact(payload.proposal_id || "PROP-BUILD-001", 80);
  const proposalUrl = compact(payload.proposal_url || "https://jpaxmedia.com/client/rodger-jarrell/proposal.html", 320);
  const pricingUrl = compact(payload.pricing_url || "https://jpaxmedia.com/client/rodger-jarrell/pricing.html", 320);
  const forwardedFor = compact(event.headers["x-forwarded-for"] || "", 240);
  const ipAddress = compact(event.headers["x-nf-client-connection-ip"] || forwardedFor.split(",")[0] || "Not provided", 120);
  const userAgent = compact(event.headers["user-agent"] || "Not provided", 420);

  const text = [
    "Rodger Jarrell proposal accepted",
    "",
    `Proposal ID: ${proposalId}`,
    `Accepted at: ${acceptedAt}`,
    `Name: ${fullName}`,
    `Title / role: ${title || "Not provided"}`,
    `Business: ${businessName}`,
    `Email: ${email}`,
    "",
    "Confirmations:",
    `Authorized to accept: ${payload.authorized_to_accept || "not checked"}`,
    `Proposal acceptance: ${payload.proposal_acceptance || "not checked"}`,
    `Payment acknowledgement: ${payload.payment_acknowledgement || "not checked"}`,
    "",
    "Audit trail:",
    `Submission IP: ${ipAddress}`,
    `User agent: ${userAgent}`,
    "",
    `Proposal: ${proposalUrl}`,
    `Pricing: ${pricingUrl}`,
    "",
    "Notes:",
    notes || "No notes provided.",
    "",
    "Signature is attached as a PNG.",
  ].join("\n");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#06080f;color:#e2e8f0;padding:24px;line-height:1.5">
      <p style="margin:0 0 8px;color:#4ade80;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">JPAX Media Proposal Acceptance</p>
      <h1 style="margin:0 0 12px;color:#f8fafc;font-size:24px">Rodger Jarrell proposal accepted</h1>
      <div style="border:1px solid #1e2a3d;border-radius:8px;padding:16px;background:#0c101c;margin:18px 0">
        <p style="margin:0 0 8px;color:#94a3b8">Proposal ID</p>
        <p style="margin:0 0 14px;color:#f8fafc;font-weight:800">${escapeHtml(proposalId)}</p>
        <p style="margin:0 0 8px;color:#94a3b8">Accepted at</p>
        <p style="margin:0 0 14px;color:#f8fafc;font-weight:800">${escapeHtml(acceptedAt)}</p>
        <p style="margin:0 0 8px;color:#94a3b8">Signer</p>
        <p style="margin:0 0 14px;color:#f8fafc;font-weight:800">${escapeHtml(fullName)}</p>
        <p style="margin:0 0 8px;color:#94a3b8">Business</p>
        <p style="margin:0 0 14px;color:#f8fafc;font-weight:800">${escapeHtml(businessName)}</p>
        <p style="margin:0 0 8px;color:#94a3b8">Email</p>
        <p style="margin:0;color:#f8fafc;font-weight:800">${escapeHtml(email)}</p>
      </div>
      <div style="border:1px solid #1e2a3d;border-radius:8px;padding:16px;background:#0c101c;margin:18px 0">
        <p style="margin:0 0 8px;color:#94a3b8">Confirmations</p>
        <p style="margin:0;color:#e2e8f0">Authorized: ${escapeHtml(payload.authorized_to_accept || "not checked")}</p>
        <p style="margin:0;color:#e2e8f0">Accepted proposal: ${escapeHtml(payload.proposal_acceptance || "not checked")}</p>
        <p style="margin:0;color:#e2e8f0">Acknowledged $1,650 due upfront: ${escapeHtml(payload.payment_acknowledgement || "not checked")}</p>
      </div>
      <div style="border:1px solid #1e2a3d;border-radius:8px;padding:16px;background:#0c101c;margin:18px 0">
        <p style="margin:0 0 8px;color:#94a3b8">Audit Trail</p>
        <p style="margin:0;color:#e2e8f0">Submission IP: ${escapeHtml(ipAddress)}</p>
        <p style="margin:0;color:#e2e8f0">User agent: ${escapeHtml(userAgent)}</p>
      </div>
      <p style="margin:18px 0;color:#cbd5e1"><strong>Notes:</strong> ${escapeHtml(notes || "No notes provided.")}</p>
      <p style="margin:18px 0 0"><a style="color:#4ade80;font-weight:800" href="${escapeHtml(proposalUrl)}">Open proposal</a></p>
      <p style="margin:6px 0 0"><a style="color:#4ade80;font-weight:800" href="${escapeHtml(pricingUrl)}">Open pricing sheet</a></p>
      <p style="margin:18px 0 0;color:#94a3b8">Signature is attached as a PNG.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "jpax-proposal-acceptance",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Proposal accepted: ${businessName}`,
      text,
      html,
      attachments: [
        {
          filename: `${proposalId}-signature.png`,
          content: signature,
        },
      ],
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return jsonResponse(502, {
      ok: false,
      message: body.message || body.error || `Resend returned ${response.status}.`,
    });
  }

  return jsonResponse(200, { ok: true, id: body.id });
};
