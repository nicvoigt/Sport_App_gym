# Sport Scale PWA

Offline-first workout tracker with a modular app-shell architecture. Designed for iOS Add-to-Home-Screen (standalone mode) and Netlify deployment.

## Local development

```bash
npm ci
npm run dev
```

## Build + smoke

```bash
npm run build
npm run smoke
```

## Tests (Vitest)

```bash
npm run test
```

## Netlify deploy

Netlify uses the root `netlify.toml` configuration:

- **Build command:** `npm ci && npm run build`
- **Publish directory:** `apps/sport_scale_app/dist`

## Architecture overview

```
apps/
  sport_scale_app/       # App shell (routing, tabs, PWA, iOS standalone)
packages/
  contracts/             # Feature contract types
  core/                  # Dexie DB, hooks, calculations, CSV export, seed data
  feature-gym/           # Workout logging + templates + records
  feature-weight/        # Bodyweight logging + trend insights
  feature-run/           # Coming soon stub
  feature-nutrition/     # Coming soon stub
  feature-more/          # Settings + CSV export
templates/
  feature-repo-template/ # Blueprint for extracting features into repos
  feature-*              # Feature-specific blueprints
```

### Option-B ready
Features live in their own packages with peer dependencies. Each package exports a `feature` module from `src/index.ts`. This allows later extraction into standalone repositories and re-importing as Git dependencies.

### Offline-first & PWA
The shell uses `vite-plugin-pwa` and caches the app shell + assets for offline usage. Icons are SVG-only (text) to comply with repository binary restrictions.
