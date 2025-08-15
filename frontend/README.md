# Frontend – Urban Golf ScoreCard

Welcome to **/frontend**! This folder contains the Vue frontend of the ScoreCard app. This README explains the tech stack, setup, workflows, testing, and provides useful links & tips so you can get productive quickly.

---

## TL;DR – Quick Start
```bash
# 1) Clone the project (repo root)
# 2) Switch to the frontend folder
cd frontend

# 3) Install dependencies
npm i

# 4) Start the dev server (Vite)
npm run dev
# → http://localhost:5173 (default)
```
> 💡 Standard environments via Vite: `.env`, `.env.development`, `.env.production`, `.env.test` (see **Environments & Config**).

---

## Tech Stack
- **Vue 3** (Composition API)
- **Vite 7** as dev server/builder
- **Vue Router** for client-side routing
- **TailwindCSS** for styling (including dark mode utilities)
- **Heroicons** for UI icons
- **PWA** via `vite-plugin-pwa`

---

## Project Structure (Excerpt)
```
/frontend
├─ index.html
├─ package.json
├─ vite.config.*
├─ src/
│  ├─ main.js                 # App bootstrap
│  ├─ App.vue                 # Root component
│  ├─ router.js               # Vue Router
│  ├─ assets/                 # Images, fonts, ...
│  ├─ components/             # UI components (e.g., GamesListCompact*.vue)
│  ├─ composables/            # UI composables (e.g., useGamesMetaData.js)
│  ├─ layouts/                # Layouts to use in views
│  ├─ locales/                # Translated texts as JSON
│  ├─ views/                  # Pages (e.g., Home.vue, About.vue, ...)
│  └─ styles/global.css       # Tailwind + global utilities
└─ public/                    # Static assets
```

---

## Environments & Config
Vite loads **`.env*` files** in the project root of the frontend. Variables prefixed with `VITE_` are injected into the frontend.

**Recommended variables** (examples – adjust accordingly):
```
VITE_API_BASE_URL=https://api.sc.urban-golf.ch
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=...anon-key...
VITE_APP_NAME=Urban Golf ScoreCard
```
Typical files:
- `.env` – global defaults
- `.env.local` – local development
- `.env.production` – production/release
- `.env.test` – test/staging backend

---

## NPM Scripts
| Script               | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `npm run dev`        | Start dev server (HMR via Vite).                         |
| `npm run build`      | Production build in `dist/`.                             |
| `npm run preview`    | Preview production build locally.                        |
| `npm run build:test` | Build against **test/staging** environment (`.env.test`).|
| `npm run test:unit`  | Run unit tests (e.g., **Vitest**).                        |
| `npm run test:e2e`   | Run E2E tests (e.g., **Playwright** or **Cypress**).      |
| `npm run lint`       | Run ESLint code linter.                                  |
| `npm run format`     | Run Prettier formatter.                                  |

Example for `build:test` (in `package.json`):
```json
{
  "scripts": {
    "build:test": "cross-env NODE_ENV=production VITE_ENV=test vite build"
  }
}
```
Alternatively: `vite build --mode test` – Vite will load `.env.test`.

---

## Development & Workflows
1. **Branching**: Create a feature branch from `main`/`test`.
2. **Local development**: `npm run dev`, router uses readable routes (e.g., `/games`, `/games/:gameId`, `/scorecard/:gameId/:holeId`).
3. **Styling**: Use Tailwind utility-first; shared styles in `global.css` (e.g., `.input-field`, `.button-primary`, `.scorecard-*`).
4. **Dark mode**: Use `dark:` variants; respect system preference (CSS media query). Optional custom toggle.
5. **State (optional)**: Use Pinia store to cache scores across views to avoid redundant API calls.
6. **i18n**: Use `$t('...')` for translations. Maintain consistent keys in language JSON files.
7. **Commits/PRs**: Run lint & tests locally; include screenshots/GIFs for UI changes.

---

## Testing
### 1) Unit Tests (Components/Utils)
- Framework: **Vitest** (recommended)
- Run: `npm run test:unit`
- Tips:
  - Test components with `mount`/`render` (e.g., `@vue/test-utils`).
  - Isolate business logic into utils for easier testing without DOM.

### 2) E2E Tests (User Flows)
- Framework: **Playwright** or **Cypress**
- Run: `npm run test:e2e`
- Typical flows:
  - Create a new game → hole view → enter scores → next hole.
  - Filter/paginate game list.

### 3) Test Builds & Staging
- **`npm run build:test`** builds frontend against **test backend** using `.env.test`.
- Deploy `dist/` output to your staging environment.
- Verify API routes with test data.

---

## Styling Conventions (Tailwind)
- Use utility classes; extract complex patterns with **@apply** in `global.css`.
- **Responsiveness**: Use `sm:`, `md:`, `lg:` breakpoints and `clamp()`.
- **States**: Use `hover:`, `focus:`, `active:`, and dark mode with `dark:`.

---

## Recommended Tools
- **ESLint** + **@vue/eslint-config** for linting
- **Prettier** for formatting
- **Type checking** (optional): `vue-tsc`/TypeScript

---

## Useful Links
- Vue 3: https://vuejs.org/
- Vite: https://vitejs.dev/
- Vue Router: https://router.vuejs.org/
- Pinia: https://pinia.vuejs.org/
- TailwindCSS: https://tailwindcss.com/docs
- Heroicons: https://heroicons.com/
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/ / Cypress: https://www.cypress.io/
- Vite PWA Plugin: https://vite-pwa-org.netlify.app/
- Supabase JS: https://supabase.com/docs/reference/javascript

---

## Troubleshooting
- **Vite/plugin versions**: Ensure `@vitejs/plugin-vue` matches Vite's major version.
- **Port in use**: Start dev server with `npm run dev -- --port=5175`.
- **Tailwind not working**: Check `postcss.config.cjs`/`tailwind.config.cjs` and ensure `@tailwind base; @tailwind components; @tailwind utilities;` are in `global.css`.

---

## License & Contributing
Pull requests are welcome! Please follow code guidelines (lint/format/test) and include screenshots for UI changes.