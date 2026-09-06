# KaSiih Store

A premium, animated storefront for a digital gaming shop — game accounts,
diamonds/top-up, and digital products. Static HTML/CSS/JS, no build step,
so you can open it directly or host it anywhere that serves static files.

## Files

| File | Purpose |
|---|---|
| `index.html` | The storefront — all sections, structure only |
| `style.css` | All visual design: colors, type, layout, animation |
| `app.js` | Rendering + behavior: cart, modals, nav, reveal animations |
| `config.js` | **Edit this** — brand name, contact links, products, categories, feedback |
| `admin.html` / `admin.js` / `admin.css` | A browser-only content editor (see limits below) |

## Customizing content

Open `config.js` and edit the `SITE_CONFIG` object:

- `brand` — store name, tagline, subtitle
- `contact` — WhatsApp number (digits only, country code first), Telegram link, TikTok handle/link
- `payment` — payment methods shown to customers, and the order note
- `categories` — the game/category tiles on the homepage (`id` must match a product's `category`)
- `products` — each product's name, category, price (RM), description, image, rating, and `available` flag
- `feedback` — real customer screenshots only (leave the array empty until you have real ones — the site shows a placeholder message instead of making anything up)
- `howToOrder` / `trust` — the four-step timeline and the trust badges

Anywhere you see an image URL, you can swap in your own hosted image.

## The admin panel (`admin.html`)

This is a convenience tool for previewing edits, **not a production
CMS**. Because the whole site is static files with no server:

- It saves changes to the browser's `localStorage`. They show up on the
  same browser/device only — not to other visitors.
- The login password is checked in the browser's own code, so it deters
  casual snooping but is not real security.
- Default password: `kasiih2026` — change it from the Settings tab
  (per-browser).

**For a real production admin** — one where changes apply for every
visitor and products/feedback are genuinely secured — you'd want a small
backend (e.g. Firebase, Supabase, or your own API) behind this same UI.
The rendering code in `app.js` is already separated from the data, so
that swap doesn't require rewriting the storefront.

## Cart & checkout

The cart lives in `localStorage` (`kasiih_cart_v1`) so it survives a
page refresh. Checkout builds a pre-filled WhatsApp message with the
order lines and total, then opens `wa.me` — there's no fake "payment
successful" step, matching how a WhatsApp/Telegram-order shop actually
works. Payment methods themselves are configured in `config.js` under
`payment` and shown to the customer via your seller conversation, not
processed on the site.

## Performance & accessibility notes

- Particle backgrounds and floating-card animation are skipped entirely
  when the visitor's OS has "reduce motion" turned on, and particle
  count is cut roughly in half on small screens.
- Images use `loading="lazy"`.
- Focus states are visible for keyboard users; modals close on `Esc`.

## Why no Next.js / Firebase / Framer Motion

The brief listed these as *preferred if needed* — everything here
(scroll reveal, parallax, cinematic hero text, cart drawer, lightbox,
magnetic buttons) is implemented in plain CSS transitions and a small
amount of vanilla JS, which keeps the project a true zero-build static
site. If you later want real multi-device admin, user accounts, or
server-verified payments, that's the point where a framework + Firebase
(or similar) earns its place — swap it in behind `config.js` and
`app.js` without touching the visual design.
