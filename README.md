# BuildsByVic — Website Source

Source for [buildsbyvic.com](https://buildsbyvic.com) — the site for **BuildsByVic**, a custom PC build and computer repair business serving Tampa, FL and the surrounding area (Lutz, Wesley Chapel, Carrollwood, Clearwater).

A static, multi-page site with no build step and no backend server. Hosted on GitHub Pages. Booking, contact forms, and the repair tracker are handled by third-party services (Cal.com, Formspree, Google Apps Script) rather than any custom server code.

---

## Stack

| Piece | Tool |
|---|---|
| Hosting | GitHub Pages (this repo, custom domain via `CNAME`) |
| Markup / styling | Plain HTML5 + a single hand-written CSS file (no framework, no preprocessor) |
| Booking | [Cal.com](https://cal.com) embedded widgets |
| Contact / build-request forms | [Formspree](https://formspree.io) (AJAX submit, redirects to `thanks.html`) |
| Repair status tracker | Google Sheet + Google Apps Script web app (`RepairLookup.gs`) |
| Analytics | Google Analytics (gtag.js) |
| Search | Google Search Console, `sitemap.xml`, `robots.txt` |
| Fonts | Space Grotesk (display), Inter (body), JetBrains Mono (specs/prices/labels) — all via Google Fonts CDN |

No `npm install`, no build pipeline. Every `.html` file is deployable as-is.

---

## File structure

```
.
├── index.html            Home
├── services.html         Services & pricing
├── portfolio.html        Client build gallery + desk setups (tabs, lightbox)
├── about.html             About Vic / bio (photo-reveal timeline, testimonials)
├── before-you-book.html   Trust/education page — questions to ask any repair shop
├── book.html              Booking (Cal.com embeds)
├── contact.html           Contact page + form
├── track.html             Repair status tracker (ticket lookup)
├── thanks.html             Form-submission thank-you page
├── 404.html                Not-found page
├── CNAME                   Custom domain config for GitHub Pages (buildsbyvic.com)
├── robots.txt
├── sitemap.xml
├── RepairLookup.gs         Google Apps Script source for the repair tracker backend
├── css/
│   └── style.css           Entire design system — one file, no preprocessor
├── js/
│   └── main.js             Mobile nav toggle, lightbox, reveal-on-load, etc.
└── assets/
    └── img/
        ├── favicon-*.png            Favicons (32 / 180 / 512)
        ├── logo.webp / logo-transparent.png
        ├── hero-build.webp          Homepage hero PC photo
        ├── alain-detail.webp        Featured "up close" build shot
        ├── about-bg-texture.webp    Blurred background texture on About page
        ├── og/og-default.jpg        Open Graph / social share preview image
        ├── decor/                   Decorative PCB-trace side margin graphics (desktop-only, ≥1900px)
        ├── bio/                     Photo-reveal images for the About page timeline (bio-1…bio-6)
        └── portfolio/               Client build photos + desk setup photos (see naming below)
```

### Portfolio image naming
Files in `assets/img/portfolio/` are named by client first name, not by the display nickname shown on the site (nicknames like "Rayo," "Midnight," "Tidal," "Ember" etc. live in the HTML/copy, not the filenames — this keeps client identity out of public-facing text while the raw files stay easy for you to match up). The exception is `brothers-setup.webp`, used on the Portfolio page's "Setups" tab rather than the "Builds" tab, so it's named for what it is instead.

---

## Design system

Defined entirely in `css/style.css` as CSS custom properties at the top of the file:

- **Palette:** near-black base (`#0A0D12`), surface (`#131922`), signal blue (`#2CA1F0`), warm amber (`#FF8A3D`), off-white (`#F5F7FA`), slate for secondary text (`#8A96A6`)
- **Type:** Space Grotesk for headings, Inter for body copy, JetBrains Mono for prices/specs/labels/eyebrows
- **Signature element:** the circuit-trace line-and-node SVG divider (`.trace-divider`) used between sections — echoes the PCB motif in the logo
- **Container:** `--container: 1200px` max-width, centered, `24px` side padding
- Section spacing, button styles, cards, badges, and the portfolio lightbox are all reusable classes — see `style.css` for the full list before adding new one-off inline styles

**Responsive layout note:** any two-column layout (hero, feature rows, contact split) should use the `.split-2col` class with `--col-a` / `--col-b` custom properties for the ratio, *not* a raw inline `display:grid; grid-template-columns:...`. Inline grid-template-columns can't be overridden by a mobile media query, which previously caused the homepage hero to squeeze into two unreadably narrow columns on phones. `.split-2col` (and `.split-card` for content+CTA cards) already collapse to a single column under 860px / 640px.

**Desktop zoom wrapper:** every page's `<body>` content is wrapped in `<div class="zoom-wrap">`. At `≥861px` (the nav's desktop breakpoint) this applies `zoom: 1.25`, scaling type/spacing/images up ~25% to match how the site looked under manual 150% browser zoom — mobile is untouched. When adding a new page, wrap its body content the same way. The portfolio page's lightbox markup is deliberately kept *outside* `.zoom-wrap` so its JS-computed pixel positioning always matches the true, unzoomed viewport.

---

## Integrations

### Booking — Cal.com
`book.html` embeds two separate Cal.com event types:
- General service consultation
- Custom gaming PC build consultation

Tab switching on the booking page is hash-based (e.g. linking to `book.html#custom-build` from a "Request a Build" button opens directly on that tab).

### Contact / build-request forms — Formspree
Form ID is embedded directly in `contact.html` and the build-request form. Submissions are sent via AJAX (not a native form POST) so the user gets redirected to the branded `thanks.html` page instead of Formspree's default confirmation screen.

### Repair tracker — Google Sheet + Apps Script
`track.html` has a two-factor lookup widget: customers enter their ticket number **plus** either their phone number or email. It calls a Google Apps Script web app (source in `RepairLookup.gs`) which queries a private Google Sheet and returns **only three fields**: Status, Start Date, and Est. Completion.

Deliberate security choices baked into `RepairLookup.gs`:
- Never returns customer name, phone, email, device, issue description, or notes — only the three status fields, and only if both the ticket number *and* the phone/email match the same row.
- Returns the same generic error message whether a ticket doesn't exist or the phone/email doesn't match, to prevent enumeration attacks (someone guessing valid ticket numbers).

Ticket numbers are auto-generated in the Sheet via an `ARRAYFORMULA` in `BBV-1001` format.

**If you ever need to redeploy the Apps Script** (e.g. after editing `RepairLookup.gs`): open the Sheet → Extensions → Apps Script → paste the updated code in → Deploy → New deployment → Web app, execute as "Me," access "Anyone" → copy the new URL → paste it into `track.html` where the script URL is set. Full steps are in the comment block at the top of `RepairLookup.gs`.

### Portfolio page — Builds / Setups tabs
`portfolio.html` has two tabbed panels (`.portfolio-tabs` / `.portfolio-panel`, plain JS tab switching, no routing): **Builds** (the client PC gallery, each card carries an `id` — e.g. `#rayo`, `#midnight`, `#tidal`, `#ember` — so other pages can deep-link straight to one build) and **Setups** (full desk photos, currently Vic's own setup and a family member's 4-monitor station). The click-to-expand lightbox works for cards in either panel and sizes itself off each image's real aspect ratio rather than a fixed 4:3.

### About page — bio photo-reveal + testimonials
`about.html`'s bio section pairs the origin-story copy with four photos (`assets/img/bio/bio-1…bio-6`) that reveal/highlight as you scroll past the matching sentence (`.bio-hov` spans in the text tied to `.bio-reveal-box` images via `data-target`), plus a click-to-open lightbox on each photo. Below that is a `.testimonial-carousel` — a dot-navigated slider of real Google reviews, some linking straight to the relevant build on the Portfolio page (e.g. `portfolio.html#midnight`).

### Before You Book page
`before-you-book.html` is a standalone trust/education page — questions worth asking *any* PC repair shop before hiring them, not just BuildsByVic. It's linked from the footer of every page and listed in `sitemap.xml`.

### Analytics & SEO
- Google Analytics (`gtag.js`) tag is included in the `<head>` of every page.
- `sitemap.xml` and `robots.txt` are in the repo root and submitted to Google Search Console.
- Every page carries Open Graph and Twitter Card meta tags plus a shared social preview image (`assets/img/og/og-default.jpg`).
- `index.html` includes `LocalBusiness` JSON-LD structured data (service area, price range, contact info).

---

## Deploy workflow

This repo deploys automatically via **GitHub Pages** — there is no CI/build step. Whatever is on the `main` branch is live within 1–2 minutes of a push.

Standard workflow used for this project (via Claude Code, working directly in this local clone):

1. Claude edits the relevant file(s) directly in place — no manual copy/paste between tools needed.
2. You review the change (diff summary from Claude, `git diff`, or your own editor/GitHub Desktop).
3. Once you approve, Claude stages and commits with a descriptive message.
4. Claude pushes to `main` **only after your explicit go-ahead**, per the standing rule in [`CLAUDE.md`](CLAUDE.md) — confirmation is required every single time, no exceptions, even later in the same session.
5. Wait 1–2 minutes, then hard-refresh the live site (`Ctrl+Shift+R` / `Cmd+Shift+R`) to bust browser cache and see the change.

**Common gotcha:** if a change doesn't seem to show up live, check `git status` / `git diff` to confirm the commit actually included every file the change touched (e.g. an HTML edit that also depends on an updated `css/style.css`) before assuming the push failed.

---

## Business contact info (for reference)

- Phone: (813) 444-3599
- Email: buildsbyvic@gmail.com
- Instagram / TikTok / YouTube / Facebook: @buildsbyvic
- Cash App: $buildsbyvic
- Service area: Tampa, Lutz, Wesley Chapel, Carrollwood, Clearwater, FL
