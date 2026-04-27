# Scott Garrett Site — Session Notes

Running summary of decisions, technical setup, and outstanding tasks. Update this at the end of each session.

---

## Project Overview

E-commerce site for artist Scott Garrett (garrettware). Built with plain HTML/CSS/JS — no frameworks. Hosted on Cloudflare Pages, connected to GitHub for auto-deployment.

- **Live site:** scottgarrettartist.com
- **Admin/CMS:** scottgarrettartist.com/admin
- **GitHub repo:** github.com/artofgarrett/artofgarrett (Scott owns it, Gaz is collaborator)
- **Local files:** /Users/gaz/Desktop/work/SCOTT

---

## Current Status (last updated: April 2026)

### Done
- Full shop with product grid, category filters, inline product detail panel
- Sticky header with logo (logo.png) and navigation
- Mobile responsive layout
- Site deployed to Scott's own Cloudflare account (not Gaz's)
- Custom domain: scottgarrettartist.com purchased and connected
- Decap CMS live at scottgarrettartist.com/admin — Scott logs in with GitHub (artofgarrett)
- CMS image upload widget — Scott can upload images directly from his computer (no GitHub needed)
- Stripe checkout working — cart → Cloudflare Pages Function → Stripe hosted checkout → success.html
- STRIPE_SECRET_KEY stored as encrypted environment variable in Cloudflare
- 89 products total: 41 ceramics, 14 prints (inc. test), 22 paintings, 12 collages
- All Big Cartel ceramics scraped and imported (sold-out items show with "Sold Out" label)
- Type scale CSS variables in place

### Still To Do
- [ ] Delete test product (£1 item Scott added for testing) from CMS
- [ ] Add A3/A2 size variant selector for 9 prints (£40/£80) — do alongside Stripe variants
- [ ] Add www subdomain (www.scottgarrettartist.com) — small job
- [ ] Migrate paintings, collages, remaining prints from Squarespace (need Squarespace admin access)
- [ ] Cancel Big Cartel — safe to do now (all ceramics migrated)
- [ ] Cancel Squarespace — only after Squarespace products are migrated

---

## Cloudflare Setup

- Site hosted on **Scott's** Cloudflare account
- GitHub repo: artofgarrett/artofgarrett — Scott owns it, Gaz is collaborator
- Environment variables in Cloudflare (Settings → Variables and Secrets):
  - `GITHUB_CLIENT_ID` — from the GitHub OAuth App (Plaintext)
  - `GITHUB_CLIENT_SECRET` — from the GitHub OAuth App (Plaintext)
  - `STRIPE_SECRET_KEY` — from Stripe dashboard (Secret/encrypted)

---

## Decap CMS Setup

Working at scottgarrettartist.com/admin. Scott logs in with his GitHub account (artofgarrett).

**How login works:**
1. Go to /admin
2. Click Login with GitHub
3. Small popup appears — click Authorize artofgarrett
4. Popup closes, CMS loads

**Technical setup (for reference if rebuilding on a new site):**
- GitHub OAuth App registered under artofgarrett GitHub account
  - Homepage URL: https://scottgarrettartist.com
  - Authorization callback URL: https://scottgarrettartist.com/api/callback
- Two Cloudflare Pages Functions: functions/api/auth.js and functions/api/callback.js
- GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET stored as Cloudflare environment variables
- admin/index.html must NOT include the Netlify Identity widget script
- **Critical:** The callback must implement Decap's two-phase handshake:
  1. Popup sends "authorizing:github" to opener
  2. Decap echoes "authorizing:github" back
  3. Popup sends "authorization:github:success:{token, provider}"
  Skipping steps 1-2 causes silent login failure in Safari

---

## Stripe Setup

Checkout is live. Flow:
1. Customer clicks Checkout on cart page
2. js/cart-page.js POSTs cart to /api/checkout (Cloudflare Pages Function)
3. functions/api/checkout.js creates a Stripe checkout session using STRIPE_SECRET_KEY
4. Customer redirected to Stripe-hosted payment page
5. On success, redirected to success.html (cart cleared)
6. On cancel, returned to cart.html

**Keys:**
- Publishable key (pk_live_...) — used in front-end (not currently needed as Stripe handles the UI)
- Secret key — stored encrypted in Cloudflare as STRIPE_SECRET_KEY

**Still to do:** 9 prints need A3 (£40) and A2 (£80) size variant selector

---

## Folder Structure

```
SCOTT/
├── index.html              — Main shop page
├── cart.html               — Cart page
├── about.html              — About page
├── contact.html            — Contact page
├── success.html            — Post-payment confirmation page
├── products.json           — All product data (89 products)
├── HANDOVER.md             — Full project handover document
├── GLOSSARY.md             — Plain English technical terms
├── SESSION_NOTES.md        — This file
├── admin/
│   ├── index.html          — Decap CMS entry point
│   └── config.yml          — CMS configuration
├── functions/
│   └── api/
│       ├── auth.js         — OAuth: redirects to GitHub
│       ├── callback.js     — OAuth: exchanges code for token, two-phase handshake
│       └── checkout.js     — Stripe: creates checkout session
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── cart.js
│   └── cart-page.js
└── images/
    └── (all product images + logo.png)
```

---

## Key Decisions & Conventions

- Scott owns all his own accounts (GitHub, Cloudflare, Stripe) — Gaz is collaborator only
- Products managed via Decap CMS, stored in products.json
- Images live in /images folder in the repo (not a CDN)
- No frameworks — plain HTML/CSS/JS only
- Cloudflare Pages for hosting (free), Cloudflare Pages Functions for server-side logic (Stripe, OAuth)
- Type scale uses CSS variables defined in :root in style.css
- Sold-out products show in the shop with "Sold Out" label — Add to Cart button is hidden
