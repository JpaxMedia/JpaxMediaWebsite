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

function signedReceiptHtml({
  proposalId,
  acceptedAt,
  fullName,
  title,
  businessName,
  email,
  proposalUrl,
  pricingUrl,
  notes,
  signature,
  ipAddress,
  userAgent,
}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Signed Acceptance Receipt - ${escapeHtml(proposalId)}</title>
  <style>
    @page { size: letter; margin: 0.45in; }
    * { box-sizing: border-box; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    body { margin: 0; color: #111827; font-family: Arial, sans-serif; line-height: 1.45; }
    .receipt { max-width: 8in; margin: 0 auto; }
    .top { display: flex; justify-content: space-between; gap: 20px; padding-bottom: 12px; border-bottom: 3px solid #047857; }
    .brand { color: #047857; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
    .muted { color: #475569; font-size: 12px; }
    h1 { margin: 26px 0 10px; color: #020617; font-size: 30px; line-height: 1.05; }
    h2 { margin: 26px 0 10px; color: #047857; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .card { min-height: 76px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; }
    .card span, .signature span { display: block; margin-bottom: 6px; color: #64748b; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
    .card strong { display: block; color: #020617; font-size: 14px; overflow-wrap: anywhere; }
    ul { margin: 0; padding-left: 18px; color: #334155; }
    .signature { margin-top: 12px; padding: 14px; border: 1px solid #cbd5e1; border-radius: 8px; }
    .signature-box { display: grid; place-items: center; min-height: 130px; margin: 10px 0 12px; padding: 14px; border: 1px dashed #94a3b8; border-radius: 8px; background: #fff; }
    .signature-box img { display: block; width: 100%; max-height: 118px; object-fit: contain; filter: brightness(0); }
    .note { color: #334155; }
    .no-print { margin-top: 18px; padding: 10px 14px; color: #fff; background: #047857; border: 0; border-radius: 999px; font-weight: 800; cursor: pointer; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <main class="receipt">
    <div class="top">
      <div>
        <div class="brand">JPAX Media LLC</div>
        <div class="muted">Signed Acceptance Receipt</div>
      </div>
      <div class="muted">jpaxmedia.com | julian@jpaxmedia.com</div>
    </div>

    <h1>Proposal Accepted</h1>
    <p class="note">This receipt records the online acceptance submitted for the Rodger C. Jarrell Real Estate & Mortgages proposal.</p>

    <h2>Acceptance Record</h2>
    <div class="grid">
      <div class="card"><span>Proposal ID</span><strong>${escapeHtml(proposalId)}</strong></div>
      <div class="card"><span>Accepted At</span><strong>${escapeHtml(acceptedAt)}</strong></div>
      <div class="card"><span>Signer</span><strong>${escapeHtml(fullName)}</strong></div>
      <div class="card"><span>Title / Role</span><strong>${escapeHtml(title || "Authorized Representative")}</strong></div>
      <div class="card"><span>Business</span><strong>${escapeHtml(businessName)}</strong></div>
      <div class="card"><span>Email</span><strong>${escapeHtml(email)}</strong></div>
    </div>

    <h2>Accepted Terms</h2>
    <ul>
      <li>Client confirmed authority to accept the proposal on behalf of the listed business.</li>
      <li>Client accepted the proposal scope, payment schedule, 90-day pricing terms, exclusions, and travel fee language.</li>
      <li>Client acknowledged the $1,650 upfront payment due before JPAX Media begins work.</li>
    </ul>

    <h2>Client Signature</h2>
    <div class="signature">
      <span>Drawn Signature</span>
      <div class="signature-box"><img alt="Client signature" src="data:image/png;base64,${signature}"></div>
      <strong>${escapeHtml(fullName)}</strong>
      <div class="muted">${escapeHtml(acceptedAt)}</div>
    </div>

    <h2>Record Links</h2>
    <p class="note">Proposal: <a href="${escapeHtml(proposalUrl)}">${escapeHtml(proposalUrl)}</a><br>Pricing: <a href="${escapeHtml(pricingUrl)}">${escapeHtml(pricingUrl)}</a></p>
    <p class="note">Submission IP: ${escapeHtml(ipAddress)}<br>User agent: ${escapeHtml(userAgent)}</p>
    <p class="note"><strong>Notes:</strong> ${escapeHtml(notes || "No notes provided.")}</p>
    <button class="no-print" onclick="window.print()">Print / Save PDF</button>
  </main>
</body>
</html>`;
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
  const printableReceipt = signedReceiptHtml({
    proposalId,
    acceptedAt,
    fullName,
    title,
    businessName,
    email,
    proposalUrl,
    pricingUrl,
    notes,
    signature,
    ipAddress,
    userAgent,
  });

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
    "A printable signed receipt is attached as an HTML file.",
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
      <p style="margin:18px 0 0;color:#94a3b8">Signature is attached as a PNG. A printable signed receipt is attached as an HTML file.</p>
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
        {
          filename: `${proposalId}-signed-receipt.html`,
          content: Buffer.from(printableReceipt).toString("base64"),
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
