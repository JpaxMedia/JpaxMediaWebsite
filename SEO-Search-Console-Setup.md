# JPAX Media — Google Search Console Setup & Verification

A step-by-step guide to verifying `jpaxmedia.com` in Google Search Console (GSC)
and submitting your sitemap so Google starts crawling and indexing the new pages.

**Time needed:** ~10–15 minutes (plus DNS propagation wait).
**You'll need:** a Google account, and access to wherever your domain DNS is managed
(e.g. Netlify DNS, GoDaddy, Namecheap, Cloudflare, Google Domains/Squarespace).

---

## Step 1 — Open Search Console & add the property

1. Go to **https://search.google.com/search-console**
2. Sign in with the Google account you want to own the analytics
   (ideally the same one tied to your Google Business Profile).
3. Click **Add property** (top-left property dropdown → "+ Add property").
4. Choose the **Domain** option (left box), **not** "URL prefix".
   - **Why Domain?** It covers every version at once — `http`, `https`,
     `www`, and non-`www` — so you never have to add them separately.
   - Type: `jpaxmedia.com`  (no `https://`, no `www`)
5. Click **Continue**.

---

## Step 2 — Verify via DNS TXT record

Google will show you a **TXT record** that looks like:

```
google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Copy that whole string. Then add it to your DNS:

### Where to add it (find your registrar/DNS host)
- **Netlify DNS** (likely, since the site deploys on Netlify):
  Netlify dashboard → **Domains** → `jpaxmedia.com` → **DNS records** →
  **Add new record**.
- Otherwise: log in to your domain registrar (GoDaddy / Namecheap /
  Cloudflare / Squarespace, etc.) and find **DNS settings / DNS records**.

### The record to create
| Field | Value |
|---|---|
| **Type** | `TXT` |
| **Name / Host** | `@`  (means the root domain; some hosts want it blank or `jpaxmedia.com`) |
| **Value / Content** | `google-site-verification=XXXX…` (the full string Google gave you) |
| **TTL** | Default (e.g. 3600) is fine |

Save the record.

### Finish verification
- Back in Search Console, click **Verify**.
- DNS can take a few minutes to a few hours to propagate. If it fails the
  first time, **wait 15–30 minutes and click Verify again** — this is normal.
- ✅ Done when you see **"Ownership verified."**

> Keep the TXT record in your DNS forever — removing it un-verifies you.

---

## Step 3 — Submit your sitemap

1. In Search Console, select the `jpaxmedia.com` property.
2. Left menu → **Sitemaps**.
3. Under "Add a new sitemap", enter:  `sitemap.xml`
   (the full URL will read `https://jpaxmedia.com/sitemap.xml`)
4. Click **Submit**.
5. Status should become **"Success"** within minutes to a day, showing
   **19 discovered URLs**.

---

## Step 4 — Request indexing for your priority pages (jump the queue)

Don't wait for Google to crawl on its own. For each important page:

1. Paste the full URL into the **search bar at the top** of Search Console
   (the "Inspect any URL" box).
2. Wait for the inspection to load → click **Request Indexing**.
3. Repeat for each of these (do the top 4 today):

```
https://jpaxmedia.com/
https://jpaxmedia.com/web-design-for-service-businesses-greenville.html
https://jpaxmedia.com/greenville-ai-website-design.html
https://jpaxmedia.com/custom-dashboards-greenville.html
https://jpaxmedia.com/greenville-business-automation.html
https://jpaxmedia.com/blog/southern-pavers-case-study.html
https://jpaxmedia.com/work.html
```

> There's a daily limit (~10–ish) on manual indexing requests — that's fine,
> you only have a handful of priority pages.

---

## Step 5 — What to check over the next 1–4 weeks

- **Pages report** (Indexing → Pages): confirm pages move to **"Indexed."**
  New pages typically index within a few days to ~2 weeks.
- **Performance report:** after ~1–2 weeks you'll start seeing
  **impressions** (you showed up in search) and **clicks**. Watch which
  **queries** you appear for — that tells you what's working.
- **Don't panic about position at first.** New pages often enter the index
  ranking low, then climb as Google gathers signals (links, engagement,
  reviews). Real local movement usually shows over **4–12 weeks**.

---

## Quick reference

| Item | Value |
|---|---|
| Property type | **Domain** |
| Domain | `jpaxmedia.com` |
| Verification | DNS **TXT** record (`@` / root) |
| Sitemap to submit | `sitemap.xml` |
| Live sitemap URL | https://jpaxmedia.com/sitemap.xml |
| robots.txt | https://jpaxmedia.com/robots.txt (already references the sitemap) |

---

## After Search Console — next highest-impact moves

1. **Google Business Profile** — fully complete it (categories, service area:
   Greenville + Upstate SC, services, photos, website link) and **start
   collecting reviews**. This is the single biggest local-ranking lever.
2. **Local citations** — list the business with the **exact same**
   Name / Address / Phone (NAP) on a few directories (Chamber of Commerce,
   Yelp, Bing Places, Apple Business Connect).
3. **Local phone number** — consider a Greenville **864** line and make it
   consistent across the site, schema, and GBP (currently the site uses an
   860 area code).

---
*Generated for JPAX Media. Keep this file for reference.*
