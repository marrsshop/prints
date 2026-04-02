# Glossary of Terms

Plain English explanations of every technical term used in this project.

---

## The Files

**HTML** (e.g. `index.html`)
The structure of a web page — think of it as the skeleton. It defines what's on the page: the header, the product grid, the buttons. It doesn't control how things look (that's CSS) or how they behave (that's JavaScript).

**CSS** (`css/style.css`)
Controls how everything looks — colours, fonts, spacing, layout. If you want to change the size of the product images or the colour of a button, that's done here.

**JavaScript** (`js/` folder)
Makes the page do things — loading products from the JSON file, filtering by category, adding items to the cart. Without JavaScript the site would just sit there doing nothing.

**JSON** (`products.json`)
A simple text file that stores all the product data in a structured format. It's what the site reads to know what products to display. You can open it in any text editor. See the HANDOVER document for how to edit it.

**Localhost**
A way of viewing the site on your own computer before it's live on the internet. When you run the local server and visit `http://localhost:3002`, you're viewing the files on your own machine, not a live website. Nobody else can see it.

---

## Hosting & Deployment

**Cloudflare Pages**
A free service from Cloudflare that hosts the website files and makes them accessible on the internet. It connects to GitHub — every time the code is updated on GitHub, the live site updates automatically.

**Cloudflare Workers**
A way of running small bits of server-side code on Cloudflare's network without needing your own server. Used in this project to handle Stripe payment requests securely. Also free up to a generous limit.

**Cloudflare R2**
Cloudflare's file storage service — like a hard drive in the cloud. Could be used to store product images if the number of images becomes too large to keep in the GitHub repo. Free tier is generous.

**GitHub**
A website that stores code and tracks changes to it over time. Think of it as Dropbox for code, but with a full history of every change ever made. Scott will own the repository (the project folder) on GitHub.

**Repository (Repo)**
The project folder on GitHub. Contains all the code and files for the site.

**Deploy / Deployment**
The process of taking the code on your computer (or GitHub) and making it live on the internet.

**Static Site**
A website made of plain files (HTML, CSS, JavaScript, images) that don't need a database or server to run. This site is static. It's simpler, faster, cheaper to host, and more secure than a dynamic site.

**Domain / Custom Domain**
The web address people type to visit the site (e.g. `scottgarrett.com`). Domains are purchased separately (from providers like Cloudflare, Namecheap, etc.) and then connected to the hosting.

**DNS**
The system that connects a domain name to the server where the site lives. Managed through Cloudflare for this project.

---

## Payments

**Stripe**
The payment processor used for this site. Handles credit/debit card payments securely. No monthly fee — Stripe takes a small percentage of each transaction (roughly 1.4% + 20p for UK cards). Scott needs his own Stripe account so payments go directly to him.

**Stripe Publishable Key**
A code that goes into the website's front-end JavaScript. It's safe to include in the site code — it identifies the Stripe account but can't be used to take money.

**Stripe Secret Key**
A code that must be kept private — never put in the website files directly. Used by the Cloudflare Worker to create secure checkout sessions. If this key is exposed, someone could abuse the account.

**Checkout Session**
A Stripe concept — when a customer clicks "Checkout", the site creates a session with Stripe (listing what's in the cart and the total). Stripe then handles the payment page securely and redirects the customer back when done.

**Cloudflare Worker (for Stripe)**
A small piece of server-side code that sits between the website and Stripe. The website sends the cart details to the Worker; the Worker uses the Secret Key to create a checkout session with Stripe and sends back a link for the customer to complete payment. This keeps the Secret Key off the website.

---

## Content Management

**CMS (Content Management System)**
Software that lets a non-technical person manage website content through a web interface — adding products, changing descriptions, uploading images — without touching any code.

**Decap CMS** (formerly Netlify CMS)
The CMS used on this site. Free and open source. Scott logs in through a browser at `/admin`, sees a simple editing interface, and can manage all products himself. Changes are saved to GitHub and the live site updates automatically within about a minute.

**OAuth / GitHub OAuth**
A secure login system that lets a website ("Garrettware CMS") ask GitHub to confirm who you are, without you having to create a separate password. When Scott clicks "Login with GitHub" on the admin page, a small popup asks GitHub to verify his identity. GitHub sends back a token (like a temporary pass) and the CMS uses that to let him in.

**OAuth App**
A registration on GitHub that gives the Garrettware CMS permission to use GitHub login. It has two keys: a Client ID (safe to share) and a Client Secret (must stay private — stored in Cloudflare, not in the code).

**OAuth Handshake**
The back-and-forth verification process during login. Decap CMS uses a two-step handshake: first the popup says "I'm authorising with GitHub", Decap confirms it's listening, then the popup sends the actual token. Both steps must happen in order — skip either one and the login silently fails.

**Cloudflare Pages Functions**
Small pieces of server-side code that run on Cloudflare's network alongside a static site. Used here to handle the OAuth login securely — the two files `functions/api/auth.js` and `functions/api/callback.js` manage the GitHub login flow without exposing the Client Secret in the browser.

**Environment Variables**
Secret values stored in Cloudflare's settings panel rather than in the code. The GitHub Client ID and Client Secret are stored this way so they never appear in the GitHub repository where anyone could read them.

---

## The Cart

**localStorage**
A built-in browser feature that stores small amounts of data on the visitor's device. The cart uses localStorage to remember what's in it — so if you close the tab and come back, the items are still there.

**Cart Count**
The number displayed in the navigation next to "Cart". Updates automatically when items are added or removed.

---

## Miscellaneous

**Responsive Design**
A site that adjusts its layout to work on different screen sizes — desktop, tablet, phone. This site uses a three-column grid on desktop and a two-column grid on mobile.

**Breakpoint**
A specific screen width at which the layout changes. For example, at 560px wide (roughly phone size) the grid switches from three columns to two.

**Hover / Hover State**
What happens when a mouse cursor moves over an element without clicking. On this site, hovering over a product image shows the title and price in a dark overlay. This only works on desktop — touch screens don't have hover.

**Aspect Ratio**
The proportional relationship between an image's width and height. All product images on this site are displayed as squares (1:1 ratio) regardless of their original proportions. This keeps the grid looking uniform.

**Git / Version Control**
A system for tracking every change made to the code over time. If something breaks, you can roll back to an earlier version. GitHub uses Git.

**Terminal**
The command-line application on a Mac (found in Applications → Utilities). Used to run the local server with the `python3` command. Nothing to be afraid of — in this project it's used for one simple command.

