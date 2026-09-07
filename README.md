# KaSiih Store

A premium, animated storefront for a digital gaming shop — game accounts,
diamonds/top-up, and digital products. Static HTML/CSS/JS, no build step.
The admin panel is backed by **Firebase** (free tier) so changes go live
for every visitor immediately — not just your own browser.

## Files

| File | Purpose |
|---|---|
| `index.html` | The storefront |
| `admin.html` | The admin panel |
| `style.css` / `admin.css` | Visual design |
| `app.js` | Storefront behavior: cart, modals, nav, animations, live data |
| `admin.js` | Admin behavior: login, product/feedback/settings CRUD |
| `config.js` | Sample/fallback content — also used to "seed" your database |
| `firebase-config.js` | **Paste your Firebase project keys here** |

## One-time setup: connect Firebase (~5 minutes, free, no credit card)

This is what makes the admin panel actually work for real (not just in
your own browser). You only do this once.

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)** → **Add project** → give it any name → finish the wizard.
2. In the left sidebar: **Build → Firestore Database → Create database**. Choose any location close to Malaysia (e.g. `asia-southeast1`). Start in **test mode** for now — you'll lock it down in step 5.
3. In the left sidebar: **Build → Authentication → Get started**. Under "Sign-in method", enable **Email/Password**. Then go to the **Users** tab → **Add user** → enter the email + password you (the shop owner) will log in with.
4. Click the ⚙️ gear icon (top left) → **Project settings** → scroll to "Your apps" → click the **`</>`** (web) icon → register the app (any nickname) → you'll see a code block starting with `const firebaseConfig = {...}`. Copy those values into **`firebase-config.js`**, replacing the placeholder text.
5. Back in **Firestore Database → Rules**, replace the rules with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

   Click **Publish**. This means: anyone can *view* products/feedback (so the store works for visitors), but only a logged-in admin can *change* them.

6. Open `admin.html`, log in with the email/password from step 3, go to **Settings tab → Seed Sample Data** to load the sample products from `config.js` into your database, then edit/add your real products.

That's it — `index.html` will now show live data to everyone.

## Customizing content

- **Products, feedback, contact/social links** → edit through `admin.html` (recommended — changes are instant for all visitors).
- **Brand name, categories, "How To Order" steps, trust badges, payment methods** → these don't change often, so they stay in `config.js`. Edit the file and re-upload/push to update them.

## Promo pricing (discounts)

When adding or editing a product in the admin panel, there's an
**Original Price** field. Leave it empty for a normal product. To run a
promo, put the *old* price there and the *discounted* price in the
regular **Selling Price** field — for example, Selling Price `RM20.00`
and Original Price `RM25.00`. The site automatically:

- shows the original price with a strikethrough next to the new price
- calculates and displays the percentage-off badge on the product card (in this example, **-20%** — the percentage is always calculated for you, so you never have to work it out by hand)

Remove the Original Price value (leave it blank) to end the promo.

## Uploading photos (products & feedback)

In the admin panel, both the product form and the feedback form let you
**upload an image directly** — no external image host needed. The photo
is automatically resized and compressed in your browser, then stored
straight in the database. If you'd rather use a hosted image instead,
there's still a URL field as a fallback (uploading a file always takes
priority over the URL field if you fill in both).

Because Firestore documents have a 1MB size limit, very large or very
detailed screenshots are compressed to keep them well under that —
this keeps everything on Firebase's free tier without needing a paid
Storage bucket.

## Social links (TikTok + Instagram)

Both are set from **Admin → Settings → Contact & Social Links**. The
"Follow KaSiih Store" section and the footer show both automatically.

## The admin panel

- Login: real Firebase account (email + password), not a shared password baked into the code.
- To change the admin password later: Firebase Console → Authentication → Users → click your account → Reset password.
- To add a second admin: Authentication → Users → Add user.
- If `firebase-config.js` still has placeholder values, `admin.html` shows a setup reminder instead of the login form, and the storefront quietly falls back to the sample content in `config.js` so it still looks complete to visitors.

## Cart & checkout

The cart lives in the visitor's browser (`localStorage`), so it survives
a refresh but is personal to them — that part doesn't need Firebase.
Checkout builds a pre-filled WhatsApp message with the order lines and
total, then opens `wa.me`. There's no fake "payment successful" step,
matching how a WhatsApp/Telegram-order shop actually works.

## Animation & performance notes

- Loading screen, cinematic hero text reveal, parallax hero background, a soft cursor-glow trail, 3D tilt on product/category cards, scroll-reveal, and a magnetic hover on buttons.
- Everything above is skipped automatically when the visitor's OS has "reduce motion" turned on, and particle density is roughly halved on small screens — smooth animation shouldn't come at the cost of a laggy phone.
- Images use `loading="lazy"`.

## Publishing (GitHub Pages)

```bash
cd kasiih-store
git init
git add .
git commit -m "KaSiih Store"
git branch -M main
git remote add origin https://github.com/USERNAME/kasiih-store.git
git push -u origin main
```

Then: repo **Settings → Pages → Branch: main, folder: / (root) → Save**.
Site goes live at `https://USERNAME.github.io/kasiih-store/`.

To update later:

```bash
git add .
git commit -m "Update"
git push
```

(Though for products/feedback/contact info, editing through `admin.html`
is faster — no git needed at all.)
