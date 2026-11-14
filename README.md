# Archana's Art

Portfolio and marketplace for **Archana's Art**, the studio of Dr. Archana Gupta in Bengaluru: original one-off paintings to buy, plus art classes, workshops, demos, mandala and Nippon art.

Brand facts, palette and fonts live in [docs/BRAND.md](docs/BRAND.md).

## Stack

| Part | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components) with TypeScript |
| Styling | Tailwind CSS 4. Tokens in `src/app/globals.css` |
| Content | Sanity. Studio is embedded at `/studio` |
| Payments | Razorpay (guest checkout, INR) |
| Animation | GSAP + ScrollTrigger and SplitText (`src/components/Reveal.tsx`, `src/components/mwg/`) |
| Fonts | Cormorant Garamond (headings) and Jost (body), via `next/font` |

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
| `NEXT_PUBLIC_SITE_URL` | The live address, e.g. `https://example.com`. Link previews and the sitemap depend on it |
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

### Razorpay

1. Add the key ID and secret to `.env.local`. Use test keys first.
2. Add a webhook pointing at `https://<your-domain>/api/razorpay/webhook`, subscribed to `payment.captured`, and put its secret in `RAZORPAY_WEBHOOK_SECRET`.
3. Enable international payments in the Razorpay dashboard to accept foreign cards.

## How buying works

Each painting is a one-off, so it can be sold only once.

1. The buyer fills in delivery details on `/checkout/<painting>`.
2. `POST /api/checkout/order` re-reads the price and availability from Sanity, adds the courier charge, holds the painting for 15 minutes, creates a Razorpay order and saves a pending order.
3. Razorpay Checkout takes the payment.
4. `POST /api/checkout/verify` checks Razorpay's signature, then marks the order paid and the painting sold. The webhook does the same if the buyer closes the tab early.

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

## Before launch

- Replace sample artworks and placeholder images with real content.
- Set real courier charges in Site settings.
- Have the privacy, terms and shipping pages reviewed. They are drafts.
- Set `NEXT_PUBLIC_SITE_URL` to the live address.
- Run a full test purchase with Razorpay test keys.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint |
