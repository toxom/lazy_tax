# Lazy Tax

Commitment contract app: keep your routines, or pay the lazy tax.

Users commit to routines, put real money on them, and prove they did them (photo, screenshot, later AI checks and app integrations). Miss one and the stake goes to charity.

Status: **UI scaffold**. All data is mock and in-memory. No backend, auth or payments yet.

## Stack

- [SvelteKit 3](https://svelte.dev/docs/kit) + Svelte 5 (runes) + TypeScript
- Vite 8, Yarn
- [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) for i18n (en, fi, ru)
- [Lucide](https://lucide.dev) icons, Fontsource fonts (Playfair Display, Inter)
- PWA: manifest + service worker, mobile-first

## Getting started

Requirements: **Node 22+** and Yarn (`corepack enable` or `npm i -g yarn`).

```sh
git clone https://github.com/toxom/lazy_tax.git
cd lazy_tax/app
yarn
yarn dev --host
```

- App: http://localhost:5173
- `--host` exposes it on your LAN so you can open it on your phone (same wifi, use the Network URL).
- The first `yarn dev` needs internet: Paraglide downloads its plugins and generates `src/lib/paraglide/`.

| Command        | What it does                    |
| -------------- | ------------------------------- |
| `yarn dev`     | Dev server with hot reload      |
| `yarn build`   | Production build                |
| `yarn preview` | Serve the production build      |
| `yarn check`   | Type check (run before pushing) |
| `yarn lint`    | Prettier + ESLint check         |
| `yarn format`  | Auto-format everything          |

## Project structure

```
app/
├── messages/                 # Translations: en.json, fi.json, ru.json
├── project.inlang/           # Paraglide config (locales, plugins)
├── static/                   # favicon, manifest.webmanifest
└── src/
    ├── app.html              # HTML shell + inline theme script (no flash)
    ├── app.css               # Theme tokens, fonts, motion
    ├── hooks.server.ts       # Sets <html lang> from locale
    ├── service-worker/       # Offline cache (own tsconfig)
    ├── lib/
    │   ├── commitments.svelte.ts   # Commitments + proofs store (mock data)
    │   ├── day.svelte.ts           # Selected day + date helpers
    │   ├── settings.svelte.ts      # Theme / accent / font, saved to localStorage
    │   ├── paraglide/              # GENERATED, gitignored, don't edit
    │   └── components/
    │       ├── TopBar.svelte          # Title, date button, logo; drag down for page info
    │       ├── TabBar.svelte          # Bottom navigation
    │       ├── CommitmentCard.svelte  # Expandable card with proof methods
    │       ├── Calendar.svelte        # Day picker (opened from header date)
    │       ├── About.svelte           # About sheet (opened from logo)
    │       ├── Modal.svelte           # Bottom sheet
    │       ├── Segmented.svelte       # Segmented control
    │       └── Logo.svelte
    └── routes/
        ├── +layout.svelte    # Shell: top bar, tab bar, modals, page transitions
        ├── +page.svelte      # Today: swipe between days, prove commitments
        ├── stakes/           # Money at risk
        ├── new/              # Create commitment (placeholder)
        └── me/               # Appearance, language, account
```

Imports use `#lib/...` (Node subpath imports, configured in `package.json`), not `$lib`.

## Conventions

### Translations

Never hardcode UI text. Add the key to **all three** files in `messages/`:

```json
"stakes_title": "Stakes"
```

```svelte
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
</script>

<h1>{m.stakes_title()}</h1>
```

Parameters: `"progress": "{done} of {total} done"` → `m.progress({ done, total })`.
A missing key is a type error, so `yarn check` catches it.

The locale comes from a cookie, then the browser language, then English. URLs have no locale prefix.

### Theming

All colors are CSS variables in `src/app.css`: `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, `--danger`. Never hardcode colors in components.

- Mode: `<html data-mode="light|dark">`
- Accent: `data-accent="teal|violet"`
- Font: `data-font="serif|sans"`. Use class `display` or `h1`/`h2` for the display font.

To add an accent, add a `[data-accent='x']` block in `app.css` and add it to the `Accent` type in `settings.svelte.ts`.

### Motion

- Page switches use the View Transitions API (`onNavigate` in `+layout.svelte`).
- In-page motion uses Svelte transitions (`fly`, `slide`, `scale`).
- Keep it short (≤ 250 ms). `prefers-reduced-motion` disables everything.

### Proofs

A commitment lists the proof methods it supports. A proof is stored per day:

```ts
type Proof = {
	method: 'photo' | 'screenshot' | 'screentime' | 'health' | 'manual';
	image?: string;
	status: 'pending' | 'verified' | 'self';
};
```

`pending` is where the AI / YOLO check will hook in. `screentime` and `health` are UI placeholders for future integrations.

## Roadmap

- [ ] Backend + persistence (decide: Supabase / PocketBase / own API)
- [ ] Auth
- [ ] New commitment flow (what, frequency, stake, proof method)
- [ ] Payments: stakes, charity payouts (Stripe?)
- [ ] Photo/screenshot verification with AI / YOLO
- [ ] Integrations: Screen Time (iOS), Digital Wellbeing (Android), Apple Health, Google Fit, Strava
- [ ] Friends as referees (approve / reject proofs)
- [ ] PNG app icons (192 / 512) for iOS home screen
- [ ] Push reminders

## Git workflow

- `main` should always build.
- Work on branches: `feat/new-commitment`, `fix/calendar-dots`.
- Run `yarn check && yarn lint` before pushing, then open a PR.
