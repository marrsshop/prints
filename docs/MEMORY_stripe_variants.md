---
name: Scott Garrett site — print size variants for Stripe
description: Several prints have A3/A2 size variants that need proper Stripe variant handling when checkout is built
type: project
---

Several prints in products.json have two size options that are currently handled with a note in the description and a contact email. When Stripe is set up, these need proper variant selectors wired to different Stripe prices.

**Affected products (all in the `prints` category):**
- Cabin Print — Black/Red (`cabin-print-black-red`)
- Cabin Print — Blue/Yellow (`cabin-print-blue-yellow`)
- Cabin Print — Brown/Blue (`cabin-print-brown-blue`)
- Cabin Print — Aqua/Yellow (`cabin-print-aqua-yellow`)
- Air Beast (`air-beast-sq`)
- Earth Beast (`earth-beast-print`)
- Stone Head 1 (`stone-head-1`)
- Stone Head 2 (`stone-head-2`)
- Stone Head 3 (`stone-head-3`)

**Variants for all of the above:**
- A3 (42cm x 29.7cm) — £40
- A2 (59.4cm x 42cm) — £80

**Why:** Stripe requires a separate price ID per variant. The product detail page will need a size selector dropdown, and the cart/checkout will need to pass the correct price ID to the Cloudflare Worker.

**How to apply:** When wiring up Stripe checkout for the Scott site, flag this before building the checkout flow so variant support is built in from the start rather than retrofitted.
