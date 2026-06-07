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

function signatureImage(dataUrl = "") {
  const match = String(dataUrl).match(/^data:image\/jpe?g;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return {
    base64: match[1],
    bytes: Buffer.from(match[1], "base64"),
  };
}

function pdfEscape(value = "") {
  return String(value)
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, " ")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replace(/\r?\n/g, "\\n");
}

function jpegDimensions(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error("Invalid JPEG signature image.");
  }

  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    offset += 2;

    if (marker === 0xd9 || marker === 0xda) break;
    const segmentLength = bytes.readUInt16BE(offset);
    const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

    if (frameMarkers.has(marker)) {
      return {
        height: bytes.readUInt16BE(offset + 3),
        width: bytes.readUInt16BE(offset + 5),
      };
    }

    offset += segmentLength;
  }

  throw new Error("Could not read JPEG signature dimensions.");
}

function wrapText(value = "", maxLength = 78) {
  const words = String(value || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function addText(commands, text, x, y, size = 10, font = "F1") {
  commands.push(`BT /${font} ${size} Tf ${x} ${y} Td (${pdfEscape(text)}) Tj ET`);
}

function addWrappedText(commands, text, x, y, maxLength = 78, lineHeight = 13, size = 10, font = "F1") {
  const lines = wrapText(text, maxLength);
  lines.forEach((line, index) => addText(commands, line, x, y - index * lineHeight, size, font));
  return y - lines.length * lineHeight;
}

function addCard(commands, label, value, x, y, width, height) {
  commands.push("0.80 0.84 0.88 RG 0.9 w");
  commands.push(`${x} ${y} ${width} ${height} re S`);
  addText(commands, label.toUpperCase(), x + 10, y + height - 17, 7, "F2");
  addWrappedText(commands, value, x + 10, y + height - 33, 32, 11, 9, "F1");
}

function pdfObject(id, body) {
  return { id, body };
}

function buildPdf(objects) {
  const chunks = [Buffer.from("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n", "binary")];
  const offsets = [0];
  let length = chunks[0].length;

  objects.forEach((object) => {
    offsets[object.id] = length;
    const start = Buffer.from(`${object.id} 0 obj\n`, "binary");
    const body = Buffer.isBuffer(object.body) ? object.body : Buffer.from(object.body, "binary");
    const end = Buffer.from("\nendobj\n", "binary");
    chunks.push(start, body, end);
    length += start.length + body.length + end.length;
  });

  const xrefOffset = length;
  const rows = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  for (let id = 1; id <= objects.length; id += 1) {
    rows.push(`${String(offsets[id]).padStart(10, "0")} 00000 n `);
  }
  rows.push("trailer", `<< /Size ${objects.length + 1} /Root 1 0 R >>`, "startxref", String(xrefOffset), "%%EOF");
  chunks.push(Buffer.from(`${rows.join("\n")}\n`, "binary"));
  return Buffer.concat(chunks);
}

function signedReceiptPdf({
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
  receiptLabel = "Client Copy",
  includeAudit = false,
}) {
  const dimensions = jpegDimensions(signature.bytes);
  const commands = [];

  commands.push("1 1 1 rg 0 0 612 792 re f");
  commands.push("0 0 0 rg");
  commands.push("0.02 0.48 0.34 RG 2 w 54 734 m 558 734 l S");
  addText(commands, "JPAX Media LLC", 54, 748, 10, "F2");
  addText(commands, `Signed Acceptance Receipt - ${receiptLabel}`, 54, 724, 10, "F1");
  addText(commands, "jpaxmedia.com | julian@jpaxmedia.com", 378, 748, 8, "F1");
  addText(commands, "Proposal Accepted", 54, 690, 24, "F2");
  addWrappedText(
    commands,
    includeAudit
      ? "This internal JPAX record includes acceptance details, audit information, and the client signature."
      : "This client-facing PDF records the online acceptance submitted for the Rodger C. Jarrell Real Estate & Mortgages proposal.",
    54,
    668,
    92,
    13,
    10,
    "F1",
  );

  addText(commands, "ACCEPTANCE RECORD", 54, 632, 11, "F2");
  addCard(commands, "Proposal ID", proposalId, 54, 574, 244, 46);
  addCard(commands, "Accepted At", acceptedAt, 314, 574, 244, 46);
  addCard(commands, "Signer", fullName, 54, 516, 244, 46);
  addCard(commands, "Title / Role", title || "Authorized Representative", 314, 516, 244, 46);
  addCard(commands, "Business", businessName, 54, 458, 244, 46);
  addCard(commands, "Email", email, 314, 458, 244, 46);

  addText(commands, "ACCEPTED TERMS", 54, 420, 11, "F2");
  addWrappedText(commands, "- Client confirmed authority to accept the proposal on behalf of the listed business.", 70, 401, 92, 12, 9, "F1");
  addWrappedText(commands, "- Client accepted the proposal scope, payment schedule, 90-day pricing terms, exclusions, and travel fee language.", 70, 377, 92, 12, 9, "F1");
  addWrappedText(commands, "- Client acknowledged $1,650 due now to begin: $950 website deposit, $500 first-month management deposit, and $200 Facebook Business / Meta setup.", 70, 341, 92, 12, 9, "F1");
  addWrappedText(commands, "- Remaining first-month management balance of $500 is due after the first month of service is completed.", 70, 305, 92, 12, 9, "F1");

  addText(commands, "CLIENT SIGNATURE", 54, 270, 11, "F2");
  commands.push("0.58 0.64 0.72 RG 1 w 54 124 504 130 re S");
  const maxSignatureWidth = 450;
  const maxSignatureHeight = 96;
  const scale = Math.min(maxSignatureWidth / dimensions.width, maxSignatureHeight / dimensions.height);
  const signatureWidth = Math.round(dimensions.width * scale);
  const signatureHeight = Math.round(dimensions.height * scale);
  const signatureX = Math.round(54 + (504 - signatureWidth) / 2);
  const signatureY = Math.round(142 + (96 - signatureHeight) / 2);
  commands.push(`q ${signatureWidth} 0 0 ${signatureHeight} ${signatureX} ${signatureY} cm /Sig Do Q`);
  addText(commands, fullName, 66, 103, 11, "F2");
  addText(commands, acceptedAt, 66, 88, 9, "F1");

  addText(commands, "RECORD LINKS", 54, 64, 10, "F2");
  addWrappedText(commands, `Proposal: ${proposalUrl}`, 54, 50, 96, 10, 7, "F1");
  addWrappedText(commands, `Pricing: ${pricingUrl}`, 54, 38, 96, 10, 7, "F1");

  if (includeAudit) {
    addText(commands, "JPAX INTERNAL AUDIT", 54, 26, 8, "F2");
    addWrappedText(commands, `Submission IP: ${ipAddress}`, 54, 16, 96, 8, 6, "F1");
    addWrappedText(commands, `User agent: ${compact(userAgent, 140)}`, 54, 8, 96, 8, 6, "F1");
  }

  const content = Buffer.from(commands.join("\n"), "binary");
  const imageObject = Buffer.concat([
    Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${dimensions.width} /Height ${dimensions.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${signature.bytes.length} >>\nstream\n`, "binary"),
    signature.bytes,
    Buffer.from("\nendstream", "binary"),
  ]);

  return buildPdf([
    pdfObject(1, "<< /Type /Catalog /Pages 2 0 R >>"),
    pdfObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    pdfObject(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Sig 7 0 R >> >> /Contents 6 0 R >>"),
    pdfObject(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
    pdfObject(5, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"),
    pdfObject(6, Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`, "binary"), content, Buffer.from("\nendstream", "binary")])),
    pdfObject(7, imageObject),
  ]);
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
  const signature = signatureImage(payload.signature_data_url);

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
  let clientPdf;
  let internalPdf;
  try {
    const receiptPayload = {
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
    };

    clientPdf = signedReceiptPdf({
      ...receiptPayload,
      receiptLabel: "Client Copy",
      includeAudit: false,
    });

    internalPdf = signedReceiptPdf({
      ...receiptPayload,
      receiptLabel: "JPAX Internal Record",
      includeAudit: true,
    });
  } catch {
    return jsonResponse(400, { ok: false, message: "Could not prepare the signed PDF. Please clear and redraw the signature." });
  }

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
    `Payment acknowledgement: ${payload.payment_acknowledgement || "not checked"} ($1,650 due now to begin: $950 website deposit, $500 first-month management deposit, $200 Facebook Business / Meta setup)`,
    "Remaining first-month management balance: $500 due after the first month of service is completed.",
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
    "Attached PDFs:",
    "- Client-facing signed acceptance PDF",
    "- JPAX internal signed acceptance PDF with audit details",
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
        <p style="margin:0;color:#e2e8f0">Acknowledged $1,650 due now to begin: ${escapeHtml(payload.payment_acknowledgement || "not checked")}</p>
        <p style="margin:0;color:#e2e8f0">$1,650 breakdown: $950 website deposit, $500 first-month management deposit, $200 Facebook Business / Meta setup.</p>
        <p style="margin:0;color:#e2e8f0">Remaining first-month management balance: $500 due after the first month of service is completed.</p>
      </div>
      <div style="border:1px solid #1e2a3d;border-radius:8px;padding:16px;background:#0c101c;margin:18px 0">
        <p style="margin:0 0 8px;color:#94a3b8">Audit Trail</p>
        <p style="margin:0;color:#e2e8f0">Submission IP: ${escapeHtml(ipAddress)}</p>
        <p style="margin:0;color:#e2e8f0">User agent: ${escapeHtml(userAgent)}</p>
      </div>
      <p style="margin:18px 0;color:#cbd5e1"><strong>Notes:</strong> ${escapeHtml(notes || "No notes provided.")}</p>
      <p style="margin:18px 0 0"><a style="color:#4ade80;font-weight:800" href="${escapeHtml(proposalUrl)}">Open proposal</a></p>
      <p style="margin:6px 0 0"><a style="color:#4ade80;font-weight:800" href="${escapeHtml(pricingUrl)}">Open pricing sheet</a></p>
      <p style="margin:18px 0 0;color:#94a3b8">Attached: client-facing signed acceptance PDF and JPAX internal signed acceptance PDF with audit details.</p>
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
          filename: `${proposalId}-client-signed-acceptance.pdf`,
          content: clientPdf.toString("base64"),
        },
        {
          filename: `${proposalId}-jpax-internal-signed-acceptance.pdf`,
          content: internalPdf.toString("base64"),
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
