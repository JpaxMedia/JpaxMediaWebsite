# JPAX Pixel — Install & Operations SOP

*Internal reference. Last updated 2026-07-01.*

The JPAX Pixel is JPAX's own first-party intent-tracking script — a self-hosted equivalent of a Facebook Pixel. Drop one tag on a website, and every visit reports page views, engagement, and conversion signals into Supabase, surfaced in Jupiter's **Signals** console at `score.jpaxmedia.com/signals`.

It is multi-site aware: the same script can run on jpaxmedia.com and on any client site, and each site shows up separately in Signals.

---

## 1. Install (any site)

Add this one line before the closing `</body>` tag on every page you want tracked:

```html
<script src="https://jpaxmedia.com/assets/js/jpax-site-intelligence.js" defer></script>
```

That's the whole install. Site identity is derived automatically from the browser's Origin — you do **not** configure a site key. `client-a.com` shows up as `client-a.com`, `jpaxmedia.com` as `jpaxmedia.com`. Nothing to set per client.

### Requirements / gotchas

- **The client's Content Security Policy must allow the collector.** If the site sends a `Content-Security-Policy` header, it needs `connect-src https://jpaxmedia.com` (and `script-src https://jpaxmedia.com` for the script itself). Without it the pixel loads but silently can't send events. This is the #1 reason a client install shows no data.
- The script is tiny, `defer`-loaded, and fails silent — it will never break the client's site or block rendering.
- Storage-blocked browsers (cookies off, some embedded webviews) still track; the pixel falls back to a per-pageview ID instead of dying.

---

## 2. What it captures

| Event | Fires when |
|---|---|
| `site_page_view` | Every page load |
| `site_cta_click` | Click on a CTA / important link (pricing, contact, book, start, services, etc.) |
| `site_tel_click` | Click on a `tel:` link |
| `site_mailto_click` | Click on a `mailto:` link |
| `site_scroll_depth` | Visitor passes 25 / 50 / 75 / 90% scroll |
| `site_engaged_time` | 15 / 45 / 90 seconds of *visible* engaged time (backgrounded tabs don't count) |
| `site_visibility_end` | Visitor leaves / hides the tab (final scroll + engaged time) |

Also captured per event: path, referrer, UTM params, a tracked-link `rid`, session + visitor IDs, device type, coarse geo (city/region/country), language, timezone, and a **hashed** IP (never the raw IP).

**Conversions:** any page whose path ends in `/thank-you` counts as a verified conversion automatically.

### What it does NOT capture

- No names, emails, or phone numbers of visitors (unless *they* type them into a form the site already has).
- No raw IP addresses — only a salted one-way hash.
- No which-company-visited resolution. This is intent analytics, not identity resolution (not Leadfeeder/RB2B).

---

## 3. Attributing a specific lead

The pixel tells you *a visitor* is showing intent. To tie activity to a *known* person, send them a **tracked link** — Jupiter's Signals detail panel has a "Copy tracked link" button that appends `rid=...&utm_*` params. When that person browses, their `rid` shows up on the events, so you know it was them.

---

## 4. Verifying an install

1. Open the client page in a normal browser tab.
2. Go to `score.jpaxmedia.com/signals`, hit **Refresh**.
3. The client's site should appear as its own site chip; the page you visited shows a `site_page_view`.
4. If nothing shows after ~30s: check the browser console for CSP errors, confirm the script tag is present in the live HTML, and confirm the page isn't under a `/demos` path on jpaxmedia.com (those are intentionally ignored).

---

## 5. How the data flows

```
Visitor browser
  → jpax-site-intelligence.js (fires events)
  → POST https://jpaxmedia.com/api/site-track   (Netlify Function = the collector)
  → jpax_record_site_event RPC                  (Supabase, service-role only)
  → Signals console at score.jpaxmedia.com      (Jupiter reads via jpax_site_dashboard)
```

The collector lives on jpaxmedia.com's Netlify deploy. **It is a shared dependency** — if that deploy is down, tracking pauses on *all* sites (client sites keep working normally; they just record nothing). Acceptable for now; revisit if the Pixel becomes a paid product.

---

## 6. Security model (what's enforced)

- **Site identity is spoof-proof.** It's derived from the browser Origin header, not from anything the page can set. A script with no browser Origin (curl, bots) is bucketed under `unknown-site` and can never overwrite a real site's data.
- **Bots are dropped** before they hit the database.
- **Rate limited** to 120 events/min per visitor, at both the collector and the database.
- **Request bodies capped** at 10 KB.
- **IPs are hashed** with a server-only salt (`PROSPECT_HASH_SALT` in Netlify).
- The ingest and read RPCs are **service-role only** — never exposed to the public/anon key.

---

## 7. Privacy / client disclosure

Because the pixel sets a persistent visitor ID, hashes IPs, and captures coarse geo on the *client's* site, the client's privacy policy should disclose analytics tracking. Give clients the opt-out: appending `?jpax_ignore=1` to any URL silences tracking in that browser.

---

## 8. Files (where this lives)

Website repo (`JpaxMediaWebsite`):
- `assets/js/jpax-site-intelligence.js` — the pixel script
- `netlify/functions/site-track.mjs` — the collector endpoint
- `netlify/lib/supabase-prospecting.mjs` — enrichment, origin logic, rate limit, IP hash

Jupiter repo (`jupiter-agent`):
- `supabase/migrations/20260701231423_jpax_pixel_ingestion_hardening.sql` — ingest RPC + indexes
- `src/components/signals/signals-console.tsx` — the Signals UI
- `src/lib/signals/` — normalization + types

---

*JPAX Media LLC | Build. Rise. Scale.*
