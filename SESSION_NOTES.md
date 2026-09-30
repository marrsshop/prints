# Tim Marrs Print Shop — Session Notes

Running summary of setup, decisions and outstanding tasks. Update this at the end of each session.

**Last updated:** 30 September 2026

---

## Project Overview

Print shop for illustrator Tim Marrs. Plain HTML/CSS/JS, no frameworks. Same structure as Scott Garrett's site (`/Users/gaz/Desktop/CLAUDE/SCOTT`) — use it as the reference for any pattern, but note the differences below.

| What | Where |
|---|---|
| Live site | https://prints-9nt.pages.dev (custom domain not set up yet) |
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
- Grid images are **uncropped** — shown at whatever proportion Tim uploads. Tim uploads at A3 ratio so rows line up
- Detail panel shows the full image, not a square crop

---

## Logins

- **Tim → Sanity:** logs in with **GitHub**. There's no Sanity password, so password-reset emails never arrive. If locked out, reset the GitHub password instead.
- **Gaz → Sanity (Tim's project):** the **E-mail** account gary@garyneill.com (Administrator). This is a different Sanity account from the GitHub one Gaz uses for Scott's site.
- **Sanity CORS origins:** `https://prints-9nt.pages.dev`, `http://localhost:3002`

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

Edit files in the TIM folder → commit → push to GitHub → Cloudflare updates the live site in a minute or two. Bump the `?v=` number on `css/style.css` (currently **v=2**) in every HTML page when the CSS changes, so browsers don't show an old version.

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
2. **Stripe** — Tim creates a Stripe account; add the secret key to Cloudflare Pages environment variables; wire up `functions/api/checkout.js`. Success/cancel links must use the final domain.
3. **Custom domain: shop.timmarrs.co.uk** (on hold). Domain is registered at Network Solutions (Tim's account).
   1. Cloudflare Pages → `prints` → Custom domains → add `shop.timmarrs.co.uk` **first**.
   2. Network Solutions → Advanced DNS → add a **CNAME**: host `shop`, points to `prints-9nt.pages.dev`. Don't change nameservers or touch existing records (Tim's main site and email depend on them).
   3. Add `https://shop.timmarrs.co.uk` to Sanity CORS origins.

---

## Contacts

| Person | Role |
|---|---|
| Gaz | Built the site, technical contact |
| Tim Marrs | Site owner, illustrator |
