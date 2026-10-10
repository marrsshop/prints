# Tim Marrs Print Shop — Session Notes

Running summary of setup, decisions and outstanding tasks. Update this at the end of each session.

**Last updated:** 30 September 2026

---

## Project Overview

Print shop for illustrator Tim Marrs. Plain HTML/CSS/JS, no frameworks. Same structure as Scott Garrett's site (`/Users/gaz/Desktop/CLAUDE/SCOTT`) — use it as the reference for any pattern, but note the differences below.

| What | Where |
|---|---|
| Live site | **https://shop.timmarrs.co.uk** (also still at https://prints-9nt.pages.dev) |
| Sanity Studio (where Tim edits prints) | https://tim-marrs.sanity.studio — **no `www`**, the www version gives a certificate error |
| GitHub repo | github.com/marrsshop/prints (Tim owns it, Gaz is collaborator) |
| Cloudflare Pages project | `prints` — auto-deploys from the `main` branch |
| Sanity project | ID `i4ddie4h`, dataset `production` |
| Local site | `/Users/gaz/Desktop/CLAUDE/TIM/` |
| Local studio | `/Users/gaz/Desktop/CLAUDE/TIM/studio/` |
| Local preview | launch.json entry "Tim Marrs Site", port 3002 |
| Cart storage key | `tim-cart` |

---

## Differences from Scott's site

- Text logo (`site-title--text` class), no image
- No categories at all — no filter bar, and none in the studio
- Grid: 3 across on desktop, 2 on tablet (under 960px), 1 on mobile
- Page background is 20% black grey (`#cccccc`, the `--paper` colour)
- Grid images are **uncropped** — shown at whatever proportion Tim uploads. Tim uploads at A3 ratio so rows line up
- Detail panel shows the full image, not a square crop
- **Fade-up reveal on the grid** (from Cadence "Fade-up Grid", cadence.rubenstom.com — free for commercial use). Each row fades + rises 60px together as it scrolls into view. Desktop: 2s, waits until the row is ~30% up the screen. Mobile (≤560px): 1.2s, starts ~12% up. "Reduce motion" users get the fade without the rise. Settings: `--reveal-speed` in css/style.css; `rootMargin` in `revealOnScroll()` in js/main.js. Image width/height come from the Sanity URL so cards have their real size before images load (needed for the reveal to work).
- Shop always opens at the top on refresh (scroll position not restored)
- No name/price captions under prints (mobile captions removed 10 Oct 2026)

---

## Logins

- **Tim → Sanity:** logs in with **GitHub**. There's no Sanity password, so password-reset emails never arrive. If locked out, reset the GitHub password instead.
- **Gaz → Sanity (Tim's project):** the **E-mail** account gary@garyneill.com (Administrator). This is a different Sanity account from the GitHub one Gaz uses for Scott's site.
- **Sanity CORS origins:** `https://shop.timmarrs.co.uk`, `https://prints-9nt.pages.dev`, `http://localhost:3002`

---

## Sanity Studio

Left-hand menu:
- **Prints** — all prints; drag to set the order they appear on the site. If some are greyed out, use **⋯ → Reset Order** at the top right of the list.
- **🗑 Delete Prints** — red Delete button next to each print (permanent).

To take a print off the site without deleting it: open it, tick **Hidden**, Publish. Untick **Available** to show it as Sold Out.

Older prints may show a harmless "Unknown field: category" note — leftover from when categories existed.

### Deploying studio changes

Claude can't deploy the studio — Gaz runs it in the Mac **Terminal** app:

```
cd /Users/gaz/Desktop/CLAUDE/TIM/studio && npx sanity@latest deploy
```

The Sanity command line must be logged in as the **E-mail** account. If it says *"missing required grant sanity.project.read"*, it's logged in as the wrong (GitHub/Scott) account:

```
npx sanity@latest logout
npx sanity@latest login      ← choose "E-mail / password"
```

Switch back (log in with GitHub) before working on Scott's studio.

---

## Website changes

Edit files in the TIM folder → commit → push to GitHub → Cloudflare updates the live site in a minute or two. Bump the `?v=` number on `css/style.css` (see the `?v=` numbers in index.html — they've moved on since) in every HTML page when the CSS changes, so browsers don't show an old version.

---

## Done

- Site built, deployed to Cloudflare Pages
- Sanity connected; studio live at tim-marrs.sanity.studio
- Categories removed — single Prints list (30 Sep 2026)
- Grid images uncropped (30 Sep 2026)
- GitHub pushing working
- Tim can log into Sanity (via GitHub)
- Tim has cleared out the example prints (only "TEST PIECE" left as of 30 Sep 2026). The original 10 scraped examples are still in `products.json` for reference

## Still to do

1. **Tim adds the prints** in the studio (A3 proportions).
2. **Payments — SumUp: LIVE ✅ (first real payment 9 Oct 2026)**
   - How it works: cart page collects name/email/UK address → `functions/api/checkout.js` re-prices everything from Sanity (never trusts the browser), saves the order in Cloudflare KV, creates a SumUp **Hosted Checkout** and sends the customer there → SumUp redirects back to `success.html?ref=…`, which asks `functions/api/order-status.js`; SumUp also calls `functions/api/sumup-webhook.js`. Both confirm with SumUp's API, then email Tim + the customer (via Resend) once. Shared code: `functions/_lib/orders.js`.
   - Postage: free, UK only. Orders email: tim@timmarrs.co.uk. Customer gets a confirmation.
   - SumUp merchant code: **MNC178ZE** (MARRS LIMITED). No API key created yet.
   - ✓ KV namespace `tim-orders` created; bound as **ORDERS** on both Production and Preview (8 Oct).
   - ✓ SumUp sandbox "TIM MARRS PRINTS TEST" (merchant code **MB557Y5J**) — key + code in Cloudflare **Preview** variables. Test copy: https://checkout-test.prints-9nt.pages.dev (branch `checkout-test`). Full test order paid with test card 4200 0000 0000 0091 ✓ (8 Oct). SumUp shows its own success page; customer clicks "Back to merchant website". Safari card autofill blocks typing test cards — untick Safari → Settings → AutoFill → Credit cards while testing.
   - ✓ Sanity CORS also allows `https://*.prints-9nt.pages.dev` (test copies).
   - ✓ Resend account (login tim@timmarrs.co.uk, team "timmarrs"), domain timmarrs.co.uk **Verified**, region Ireland. DNS added at DreamHost: TXT `resend._domainkey`, CNAME `send` → send.forge.rmta.net, CNAME `rsend` → rsend-euw1.forge.rmta.net, TXT `_dmarc` = `v=DMARC1; p=none;`. "Enable Receiving" left OFF (Tim's mail MX untouched). API key "tim shop" (sending access).
   - ✓ Cloudflare vars on **both** Production and Preview: `RESEND_API_KEY` (secret), `ORDER_EMAIL=tim@timmarrs.co.uk`, `FROM_EMAIL=Tim Marrs <shop@timmarrs.co.uk>`.
   - ✓ Sandbox order with emails (9 Oct, TM-261009-Y34W2Q, £90): customer confirmation landed in inbox (not spam); Tim's "New order" email arrived too.
   - ✓ Live SumUp key ("shop live") + `SUMUP_MERCHANT_CODE=MNC178ZE` saved in Cloudflare **Production** (9 Oct).
   - **ON/OFF SWITCH:** checkout only takes payments when `CHECKOUT_ENABLED=true`. Set on **Preview only** (test copy). Live shop shows "Checkout isn't switched on yet" until Tim's design is final.
   - ✓ **Went live 9 Oct 2026:** `CHECKOUT_ENABLED=true` added to Production; real £1 test order ("TEST – do not buy", A4) paid to MARRS LIMITED, transaction TAAA6TP2EVM. (First attempt declined — card overdrawn, not a site problem.) Fixed bug: buy panel crashed for prints with no description.
   - Two real £1 test orders (TM-261009-13W5IN, TM-261009-11WC1N), both paid, not refunded (Gaz's choice). All 4 emails delivered (Resend → Emails log). Test print deleted.
   - **Tim decided 9 Oct: shop stays ON.**
   - To switch the shop OFF again: delete `CHECKOUT_ENABLED` from Production, then rebuild.
   - (Original go-live recipe:) Cloudflare → prints → Settings → **Production** → Variables → add Text `CHECKOUT_ENABLED` = `true` → then push any commit to `main` (or Deployments → retry latest) so it rebuilds → £1 "TEST – do not buy" print in Sanity → buy with a real card → refund in SumUp (Sales → payment → Refund) → delete the test print.
   - Local test: launch.json "Tim Marrs Checkout Test" (wrangler pages dev, port 8789, fake key).
   - Leftovers from Scott's site not used here: `functions/api/auth.js`, `functions/api/callback.js`, `admin/` (Decap CMS login).
3. ✅ **Custom domain: shop.timmarrs.co.uk** — LIVE 8 Oct 2026 (kept for reference)
   - Domain is *registered* at Network Solutions, but its **DNS is at DreamHost** (nameservers ns1–3.dreamhost.com; DreamHost also hosts the main site at www.timmarrs.co.uk). Email runs through a separate provider (MX records `*.ik2.*`). Don't change nameservers at Network Solutions — it would break the main site and email.
   - ✓ Cloudflare Pages → `prints` → Custom domains → `shop.timmarrs.co.uk` added via "My DNS provider" / CNAME setup.
   - ✓ DreamHost (panel.dreamhost.com, Tim's login) → timmarrs.co.uk → DNS → add custom record: Name `shop`, Type `CNAME`, Value `prints-9nt.pages.dev`.
   - ✓ Back in Cloudflare, click **Check DNS records**; wait for **Active**.
   - ✓ Added `https://shop.timmarrs.co.uk` to Sanity CORS: `cd studio && npx sanity@latest cors add https://shop.timmarrs.co.uk --no-credentials`
   - Network Solutions Web Forwarding expired (billing) — **not needed**: DreamHost already redirects timmarrs.co.uk → https://www.timmarrs.co.uk. Tim updated his payment card 8 Oct 2026.
   - Cloudflare login doesn't work in the Claude app's built-in browser (bot check) — use Safari.

---

## Contacts

| Person | Role |
|---|---|
| Gaz | Built the site, technical contact |
| Tim Marrs | Site owner, illustrator |
