# Scott Garrett — Site Handover Document

## Overview

This is a custom-built e-commerce website for artist Scott Garrett, consolidating two existing sites:
- **garrettware.bigcartel.com** — ceramics and prints (fully migrated)
- **scottgarrett.squarespace.com/shop** — paintings, collages and prints (pending migration)

The site is built with plain HTML, CSS and JavaScript — no frameworks, no subscriptions. It is designed to be hosted on **Cloudflare Pages** (free) with payments handled by **Stripe** (no monthly fee, small % per transaction).

---

## Current Status

### Done
- All 24 Big Cartel products scraped and migrated (images, descriptions, prices)
- Site built and running locally — shop, product pages, cart
- Mobile responsive (two-column grid on phone, three-column on desktop)
- Hover overlay on product images (desktop)
- Category filters: Ceramics, Paintings, Collages, Prints

### Still To Do
- [ ] Get admin access to scottgarrett.squarespace.com — scrape Paintings, Collages, Prints
- [ ] Scott to create a Stripe account at stripe.com
- [ ] Wire up Stripe checkout (Cloudflare Worker already planned)
- [ ] About page
- [ ] Contact page
- [ ] Deploy to Cloudflare Pages
- [ ] Connect a domain
- [ ] Add Decap CMS so Scott can manage products himself

---

## Folder Structure

```
SCOTT/
├── index.html          — Main shop page
├── product.html        — Individual product page
├── cart.html           — Cart page
├── about.html          — About page (not yet built)
├── contact.html        — Contact page (not yet built)
├── products.json       — All product data (the file to edit when adding/changing products)
├── HANDOVER.md         — This document
├── GLOSSARY.md         — Plain English explanations of all technical terms
├── css/
│   └── style.css       — All visual styling
├── js/
│   ├── main.js         — Loads and renders products on the shop page
│   ├── product.js      — Loads and renders a single product page
│   ├── cart.js         — Cart logic (add, remove, count) shared across all pages
│   └── cart-page.js    — Renders the cart page and handles checkout button
└── images/
    ├── ceramics/       — 20 ceramic product images
    ├── paintings/      — Empty, pending Squarespace access
    ├── collages/       — Empty, pending Squarespace access
    └── prints/         — 4 print images (more to come from Squarespace)
```

---

## How Products Work

All products live in **products.json** in the root folder. Each product looks like this:

```json
{
  "id": "fish-rx",
  "name": "Fish RX",
  "category": "ceramics",
  "price": 65,
  "available": true,
  "description": "Fish and Slips!\n\nTerracotta clay...",
  "images": ["images/ceramics/fish-rx.jpg"]
}
```

**To add a product:** copy an existing entry, change the values, add the image to the correct folder.
**To mark as sold out:** change `"available": true` to `"available": false`.
**To change a price:** update the `"price"` number (no £ sign, just the number).
**Categories must be one of:** `ceramics`, `paintings`, `collages`, `prints`

---

## Squarespace Migration (Next Step)

When admin access to scottgarrett.squarespace.com is available:

1. Log into Squarespace admin
2. For each product: copy description, note price, download all product images
3. Save images into the correct subfolder (`images/paintings/`, `images/collages/`, `images/prints/`)
4. Add each product as a new entry in `products.json`
5. Name image files consistently, e.g. `time-now-for-ghosts.jpg`

Products to migrate from Squarespace:
- **Paintings** (~16 items, £350–£800)
- **Collages** (~10 items, £140)
- **Prints** (~8 items, from £40) — merge with existing Big Cartel prints

---

## Stripe Setup (Next Step)

1. Scott creates an account at **stripe.com** (needs bank details for payouts)
2. From the Stripe dashboard, get the **Publishable Key** and **Secret Key**
3. A Cloudflare Worker will be added to handle checkout sessions securely
4. The checkout button in `js/cart-page.js` will be updated to call that Worker

Note: This Stripe account should be entirely Scott's — separate from any other Stripe account.

---

## Hosting on Cloudflare Pages (Future Step)

1. Push the SCOTT folder to a GitHub repository (Scott should own this)
2. Log into Cloudflare → Pages → Connect to GitHub → select the repo
3. No build command needed — it's a static site
4. Every time the GitHub repo is updated, the live site updates automatically
5. Connect a custom domain through Cloudflare DNS

---

## CMS for Scott — Live and Working

**Decap CMS** is set up and working at `artofgarrett.pages.dev/admin`.

Scott logs in with his GitHub account (`artofgarrett`). No code editing required — he can add products, update descriptions, change prices and upload images through a browser interface. Changes save to GitHub and the live site updates within ~60 seconds.

### How the login works
1. Go to `artofgarrett.pages.dev/admin`
2. Click **Login with GitHub**
3. A small popup appears asking to authorise — click **Authorize artofgarrett**
4. The popup closes and the CMS loads

### Technical setup (for reference if rebuilding)
- GitHub OAuth App registered under the `artofgarrett` GitHub account
- Authorization callback URL: `https://artofgarrett.pages.dev/api/callback`
- Two Cloudflare Pages Functions handle the OAuth flow: `functions/api/auth.js` and `functions/api/callback.js`
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` stored as environment variables in Cloudflare Pages settings
- **Important:** The callback must implement Decap's two-phase handshake — send `"authorizing:github"` first, wait for the echo, then send the token. Skipping this causes silent login failure (especially in Safari).
- The `admin/index.html` must NOT include the Netlify Identity widget script — it conflicts with GitHub OAuth.

---

## Running Locally

To view the site on your own machine, run this in Terminal:

```
python3 -m http.server 3002 --directory /Users/gaz/Desktop/SCOTT
```

Then open **http://localhost:3002** in your browser.

---

## Contacts

| Person | Role |
|--------|------|
| Gaz | Built the site, point of contact for technical changes |
| Scott Garrett | Site owner, artist |

