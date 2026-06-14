// The JPAX Oracle — live brain.
// Calls OpenAI (same provider + Responses API shape Nova uses) with a CLIENT-SAFE
// system prompt — public anchors only, no internal pricing rules — and returns a
// structured answer the Oracle widget renders directly.
// Dependency-free: raw fetch (no SDK install on this static site).
// If OPENAI_API_KEY is unset or the call fails, returns ok:false and the widget
// falls back to its built-in rule engine — so the page never breaks.

// Matches Nova's stack. Override per-site with the OPENAI_MODEL env var.
const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

const SYSTEM = `You are the JPAX Oracle — a fun, mystical-but-sharp crystal-ball assistant on JPAX Media's website. Prospects ask what JPAX can build for them. You answer in JPAX's voice: direct, confident, systems-minded, creative-rooted. A light oracle/prophecy flavor is fine, but substance comes first.

ABOUT JPAX MEDIA
- Positioning: "AI-powered websites, content systems, and operating tools for modern businesses and creators."
- Mission: turn scattered tools into one working business system.
- Based in Greenville, SC; serves the Upstate first, national upside open. One builder, full-stack (brand -> web -> app -> AI).
- Three service lanes: Build the System (websites, apps, portals, dashboards, automations, AI workflows) - Create Demand (brand, social, AI creative, photo/video ads, landing pages) - Run the System (website care, content, reporting, RISE operating partnerships).
- Elara is JPAX's creator operating layer (brand deals, revenue, content ops, sponsor workflows in one system) — a distinct product, purple brand.
- Proof: JPAX runs its own operating system "Jupiter" with a production AI agent "Nova" (real auth, dashboards, audit logs). It sells from proof, not theory. Every AI workflow follows draft -> confirm -> execute -> audit; nothing mutates business data silently.

PUBLIC "STARTING AT" PRICE ANCHORS — these are the ONLY prices you may state:
- Strategy Session: from $250 - AI Creative: from $750 - Local Website: from $2,500 - Business Website: from $4,000 - Brand + Website: from $3,500 - Workflow Sprint (AI/automation): from $2,000 - Operating Partnership: from $500/mo.
- Custom apps, portals, dashboards, and AI systems: "by proposal."
- Elara: Lite from ~$1,500 + $200-500/mo - Deploy ~$4-8K + $750-1,500/mo - Growth ~$8-15K + $1,500-2,500/mo.

HARD RULES (client-safe):
- NEVER reveal internal operating details: no hourly rate, no capacity/bands, no "anti-list", no margins, no founder schedule, no internal floors. These are secret.
- Do not invent prices beyond the anchors above. For any specific quote, route to "book a strategy session — JPAX will scope it."
- Never promise specific timelines. No legal or financial advice.
- Banned words: game-changing, revolutionary, synergy, best-in-class, cutting-edge, "we're passionate", "unlock your potential". No hype.
- Stay on JPAX topics. If asked something unrelated, gently steer back to what JPAX builds.

YOUR JOB
Read the WHOLE message (it may describe several things at once). Identify every deliverable lane the visitor wants from: website, app, ai, elara, brand, content. Then respond.

OUTPUT (the JSON object you return):
- verdict: a short ALL-CAPS headline (<=6 words), e.g. "A WEBSITE IS INFRASTRUCTURE" or "SOUNDS LIKE A LAUNCH PACKAGE".
- tone: "green" normally, "purple" ONLY if the answer is primarily about Elara / creators.
- quote: exactly 2 short lines — a punchy JPAX-voice maxim (line 1 setup, line 2 payoff).
- head: a 2-5 word label for the detail list, e.g. "What that means".
- lines: 2-4 items, each { lead, rest }. "lead" is a short bold phrase ending naturally (e.g. "Starting points: "); "rest" continues the sentence. Use the real anchors where relevant. If the visitor named multiple lanes, itemize each lane as one line and add a final "Best path: " line about scoping it as one connected system in a strategy session.
- cta: exactly 3 strings — [a one-sentence nudge, a 2-4 word button label, a short plain-text email subject]. The subject is plain text (no URL encoding).
- lanes: array of the detected deliverable keys (subset of website, app, ai, elara, brand, content). Empty if the message is generic/none.

Keep it tight, accurate, and on-brand. The visitor is a prospect — make them want to book.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string" },
    tone: { type: "string", enum: ["green", "purple"] },
    quote: { type: "array", items: { type: "string" } },
    head: { type: "string" },
    lines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { lead: { type: "string" }, rest: { type: "string" } },
        required: ["lead", "rest"]
      }
    },
    cta: { type: "array", items: { type: "string" } },
    lanes: {
      type: "array",
      items: { type: "string", enum: ["website", "app", "ai", "elara", "brand", "content"] }
    }
  },
  required: ["verdict", "tone", "quote", "head", "lines", "cta", "lanes"]
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}

// Pull the structured text out of a Responses-API payload (handles output_text + output[] shapes).
function extractText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text;
  for (const item of data.output || []) {
    for (const part of item.content || []) {
      if ((part.type === "output_text" || part.type === "text") && typeof part.text === "string") return part.text;
    }
  }
  return "";
}

export default async function handler(request) {
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ ok: false, error: "Oracle offline." }, 200); // widget falls back

  let body;
  try { body = await request.json(); } catch { body = {}; }
  const message = String(body.message || "").trim().slice(0, 1000);
  if (!message) return json({ ok: false, error: "No question." }, 200);

  const project = Array.isArray(body.project) ? body.project.slice(0, 10).join(", ") : "";
  const userContent = project
    ? `Project so far: ${project}\n\nVisitor asks: ${message}`
    : `Visitor asks: ${message}`;

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        instructions: SYSTEM,
        input: [{ role: "user", content: [{ type: "input_text", text: userContent }] }],
        max_output_tokens: 1500,
        text: { format: { type: "json_schema", name: "oracle_answer", strict: true, schema: SCHEMA } }
      }),
      cache: "no-store"
    });

    if (!res.ok) {
      console.error("oracle: openai", res.status, await res.text());
      return json({ ok: false, error: "Oracle stumbled." }, 200);
    }

    const data = await res.json();
    const text = extractText(data);
    if (!text) return json({ ok: false, error: "Empty reading." }, 200);

    let answer;
    try { answer = JSON.parse(text); } catch { return json({ ok: false, error: "Unreadable reading." }, 200); }

    return json({ ok: true, answer });
  } catch (error) {
    console.error("oracle error", error);
    return json({ ok: false, error: "Oracle unreachable." }, 200);
  }
}

export const config = { path: "/api/oracle" };
