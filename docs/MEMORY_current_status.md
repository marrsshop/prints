---
name: Scott Garrett site — current status and next steps
description: Live site status, what's working, what's outstanding as of April 2026
type: project
originSessionId: 203b424e-8038-46cc-8d35-108335d2fbce
---
Site is live at **scottgarrettartist.com** (custom domain connected and active).

## What's working
- Full shop with product grid, category filters, inline product detail panel
- Sticky header with logo and navigation
- Decap CMS live at scottgarrettartist.com/admin — Scott logs in with GitHub (artofgarrett account)
- CMS image upload widget — Scott uploads images directly from his computer
- Stripe checkout live — cart → Cloudflare Pages Function → Stripe hosted checkout → success page
- 89 products: 41 ceramics (all Big Cartel items including sold-out), 14 prints (inc. test), 22 paintings, 12 collages
- Site hosted on Scott's own Cloudflare account

## Outstanding tasks (in priority order)
1. **Delete test product** — Scott added a £1 test item; delete it from CMS once checkout tested
2. **A3/A2 size variants for 9 prints** — £40/£80 pricing, needs a size selector in the product detail panel
3. **Add www subdomain** — www.scottgarrettartist.com not yet set up (small job)
4. **Migrate Squarespace products** — paintings, collages, remaining prints (need admin access to scottgarrett.squarespace.com)
5. **Cancel Big Cartel** — safe now, all ceramics migrated
6. **Cancel Squarespace** — only after Squarespace products migrated

## Cloudflare setup
- Site on Scott's Cloudflare account
- GitHub repo: artofgarrett/artofgarrett — Scott owns it, Gaz is collaborator
- Environment variables in Cloudflare: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, STRIPE_SECRET_KEY
- GitHub OAuth App URLs updated to scottgarrettartist.com
