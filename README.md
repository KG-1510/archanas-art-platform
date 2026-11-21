# Archana's Art

Portfolio and marketplace for **Archana's Art**, the studio of Dr. Archana Gupta in Bengaluru: original one-off paintings to buy, plus art classes, workshops, demos, mandala and Lippan art.

Brand facts, palette and fonts live in [docs/BRAND.md](docs/BRAND.md).

## Stack

| Part | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components) with TypeScript |
| Styling | Tailwind CSS 4. Tokens in `src/app/globals.css` |
| Content | Sanity. Studio is embedded at `/studio` |
| Payments | Razorpay (guest checkout, INR) |
| Animation | GSAP + ScrollTrigger and SplitText (`src/components/Reveal.tsx`, `src/components/mwg/`) |
| Fonts | Playfair Display (headings) and Jost (body), via `next/font` |

## Run it

Requires Node 22.12 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. With no environment variables set, the site runs on built-in sample content (`src/lib/seed.ts`) and checkout is switched off.

## Configure

Copy `.env.example` to `.env.local` and fill it in. Never commit `.env.local`.

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Optional override of the site address. Unset, production builds use `https://archanasart.in` (set in `src/lib/site.ts`) and local development uses localhost |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | From sanity.io/manage |
| `NEXT_PUBLIC_SANITY_DATASET` | Usually `production` |
| `SANITY_API_WRITE_TOKEN` | Editor token. Server only. Saves orders and marks paintings sold |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret. Server only |
| `RAZORPAY_WEBHOOK_SECRET` | The secret you choose when creating the webhook |

### Sanity

1. Create a project at sanity.io/manage and add the project ID to `.env.local`.
2. In the project's API settings, add `http://localhost:3000` (and later the live address) as a CORS origin with credentials allowed.
3. Create an Editor token and set `SANITY_API_WRITE_TOKEN`.
4. Open `/studio` and add content:
   - **Artwork**: photograph, medium, size, price, status. Tick "Show on homepage" to feature it.
   - **Service**, **Legal page**: optional. Built-in text is used until you add your own.
   - **Site settings**: courier charges for India and international.
   - **Order**: written by the website. Read-only.

### What is managed in Sanity

| In the studio sidebar | What it controls on the site |
| --- | --- |
| **Paintings** | The marketplace, painting pages and the homepage's featured works |
| **Workshops & classes** | "Upcoming workshops and classes" on the Services page. Past ones drop off on their own |
| **Testimonials** | Quotes on the homepage (up to three) |
| **Services text** | The Services page. Built-in text is used until you add your own |
| **Policy pages** | Privacy, Terms, Shipping & Returns. Built-in text is used until you add your own |
| **Site settings** | Courier charges, and the three About page photos |
| **Orders** | Written by the website. Read-only |

There is no sample content. A section with nothing in Sanity is left off the site; the marketplace shows a short "new works are being added" note.

### Adding a painting

Open `/studio` → **Paintings** → **All paintings** → the **+** button. The form has three tabs:

| Tab | Fill in |
| --- | --- |
| Painting | Photo (required), more photos, painting name, web address (press Generate), description, medium, art form, year |
| Size | Sheet width and height in inches, framed or unframed, and the size with frame if framed. The site shows centimetres automatically |
| Price & stock | Price of the original, stock available (usually 1), price of a print, about the print, "Show on the homepage", your own reference number |

A painting needs at least one price. Press **Publish**; it appears on the site within about a minute.

- **Original:** when someone buys it on the site, stock goes down by one. At 0 the page shows "Original sold".
- **Print:** no stock limit. Prints stay on sale after the original is sold.
- To add an art form, edit `ART_FORMS` in `src/sanity/schemaTypes/index.ts`.

### Razorpay

1. Add the key ID and secret to `.env.local`. Use test keys first.
2. Add a webhook pointing at `https://<your-domain>/api/razorpay/webhook`, subscribed to `payment.captured`, and put its secret in `RAZORPAY_WEBHOOK_SECRET`.
3. Enable international payments in the Razorpay dashboard to accept foreign cards.

## Photos kept in Sanity

To keep the repository small, these live in Sanity → Site settings, not in the code:

- **Class and student photos**: the homepage shows the first five, the Services page shows all.
- **A photo for each service** (Services text → Photo): used in the homepage gallery of services.
- **About page photos**: up to three.

Sanity serves them as WebP or AVIF automatically.

## Test and live payments

| Where | Razorpay keys | What happens |
| --- | --- | --- |
| Production (archanasart.in) | Live (`rzp_live_`) | Real money. Buying an original holds it, then takes it out of stock. |
| Staging (Vercel preview) and local | Test (`rzp_test_`) | No real money. Orders are tagged **Test**, never hold or reduce stock, and are left out of the sales figures. |

A live key outside production is refused, so nothing there can charge a card. In Vercel, set `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` once for **Production** (live) and once for **Preview** and **Development** (test). Staging and local share the production Sanity dataset, which is why test orders are kept away from stock.

## Admin panel

`/admin` is a private panel for running the shop: a dashboard, the orders with their courier status, and stock.

- **Dashboard**: orders to pack, packed, shipped and delivered; sales this month and in total; originals in stock.
- **Orders**: every paid order with the buyer's address. Set it to To pack, Packed, Shipped, Delivered or Cancelled, and record the courier and tracking number. Marking an order Shipped can email the buyer.
- **Inventory**: originals in stock per painting, what has sold online, and a way to correct a number or release a buyer's 15-minute hold.

Setting it up:

1. Make a sign-in for each person: `node scripts/admin-password.mjs`. It asks for a name and a password and prints one line.
2. Put the lines in `ADMIN_USERS`, joined with a semicolon. Only password hashes are stored, never passwords.
3. Set `ADMIN_SESSION_SECRET` to a long random string (`openssl rand -hex 32`).
4. Add both to `.env.local` and to Vercel, then redeploy.

Security notes: passwords are hashed with scrypt; the sign-in cookie is signed, HTTP-only, limited to `/admin` and lasts 12 hours; every admin page and action checks it; `/admin` is hidden from search engines. To remove someone, delete their entry from `ADMIN_USERS`. To sign everyone out, change `ADMIN_SESSION_SECRET`.

### Order emails (optional)

With `BREVO_API_KEY`, `ORDERS_FROM_EMAIL` and `ORDERS_NOTIFY_EMAIL` set, the buyer gets a confirmation when they pay, the studio gets a new-order alert, and the buyer can be emailed when an order is marked Shipped. Emails go through Brevo's transactional API; the sender's address or domain must be verified in Brevo. Without these, orders work and no email is sent.

## How buying works

A painting can be bought as the original (sold once, tracked by stock) or as a print (no stock limit).

1. The buyer fills in delivery details on `/checkout/<painting>`.
2. `POST /api/checkout/order` re-reads the price and stock from Sanity, adds the courier charge, holds an original for 15 minutes, creates a Razorpay order and saves a pending order.
3. Razorpay Checkout takes the payment.
4. `POST /api/checkout/verify` checks Razorpay's signature, then marks the order paid and, for an original, takes one out of stock. The webhook does the same if the buyer closes the tab early.

Prices never come from the browser. Order documents have IDs starting with `order.`, which keeps them private in Sanity.

## Pages

`/` · `/shop` · `/shop/<painting>` · `/checkout/<painting>` · `/services` · `/about` · `/contact` · `/privacy` · `/terms` · `/shipping-returns` · `/studio`

## AI-ready

- **Markdown twins**: add `.md` to any page URL (`/shop.md`, `/shop/<painting>.md`, `/index.md`), or request a page with `Accept: text/markdown`. Source: `src/lib/markdown.ts`.
- **`/llms.txt`**: an index of the site for language models.
- **`/api/artworks`**: the catalogue as JSON.
- **WebMCP**: `src/components/WebMCPTools.tsx` registers `search_artworks`, `get_artwork`, `open_checkout` and `get_studio_contact` in browsers that support it. The enquiry form is also exposed as a declarative tool. No tool pays or sends anything on its own.
- **Structured data**: schema.org JSON-LD for the studio, services and each artwork.
- **Link previews**: Open Graph and Twitter tags on every page, with a preview image (`public/og.jpg`). Paintings use their own photograph.

## Motion and the Made With GSAP licence

Three effects come from [Made With GSAP](https://madewithgsap.com) and use its licensed code, in `src/components/mwg/` with their styles at the end of `src/app/globals.css`:

| Effect | Where |
| --- | --- |
| 123, Parting letters parade | Homepage, "Forty years" statement |
| 121, Clipped sections gallery | About page |
| 122, Scaling image parade | Services page |

**This repository must stay private.** The Made With GSAP terms forbid publishing their code in a public or open-source repository. Do not make this repo public while `src/components/mwg/` is in it.

Each effect switches itself off for people who prefer reduced motion and shows a static layout instead. Effect 121 runs on screens 768px and wider.

## Project layout

```
docs/BRAND.md            brand facts, palette, fonts
sanity.config.ts         studio configuration
src/app/(site)/          public pages
src/app/api/             catalogue, checkout and webhook routes
src/app/md/              Markdown twin route
src/app/studio/          embedded Sanity studio
src/components/          UI, motion and WebMCP components
src/components/mwg/      licensed Made With GSAP effects (keep repo private)
src/lib/                 content queries, seed data, orders, metadata
src/sanity/              Sanity clients and schema
```

## Deploy (Vercel + archanasart.in)

1. Push this repository to GitHub as a **private** repo.
2. In Vercel, choose **Add New → Project** and import the repo. The defaults for Next.js are correct.
3. Under **Settings → Environment Variables**, add everything from `.env.example` except `NEXT_PUBLIC_SITE_URL`. Use live Razorpay keys only after a test purchase works.
4. Under **Settings → Domains**, add `archanasart.in` and `www.archanasart.in`. Vercel shows the DNS records it needs.
5. In Hostinger, open the domain's DNS zone and enter exactly the records Vercel shows (an A record for the root and a CNAME for `www`). Remove any parked or default records for the same names.
6. In Razorpay, point the webhook at `https://archanasart.in/api/razorpay/webhook`.

`https://archanasart.in` is already an allowed CORS origin in the Sanity project, so `/studio` works on the live site.

## Before launch

- Add paintings, courier charges and About page photos in Sanity.
- Set real courier charges in Site settings.
- Have the privacy, terms and shipping pages reviewed. They are drafts.
- Point the `archanasart.in` DNS at the host and add `https://archanasart.in` as a CORS origin in Sanity.
- Run a full test purchase with Razorpay test keys.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint |
