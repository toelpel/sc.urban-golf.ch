# Testing Guide — Urban Golf ScoreCard

Mehrere Ebenen von Tests stehen zur Verfügung. Jede hat einen klaren Zweck und
kann unabhängig ausgeführt werden.

## Übersicht

| Ebene               | Tool              | Script                          | Dauer | Backend nötig |
| ------------------- | ----------------- | ------------------------------- | ----- | ------------- |
| Lint                | ESLint            | `npm run lint`                  | ~2 s  | nein          |
| Type-Check          | vue-tsc           | `npm run type-check`            | ~3 s  | nein          |
| Unit                | Vitest            | `npm test`                      | ~1 s  | nein          |
| Smoke-E2E (mock)    | Playwright        | `npm run test:e2e:smoke`        | ~7 s  | nein          |
| Visual-Audit        | Playwright Node   | `npm run test:visual`           | ~20 s | nein          |
| Horizontal-Audit    | Playwright Node   | `node e2e/horizontal-scroll-audit.mjs` | ~10 s | nein |
| Alles zusammen      | Meta              | `npm run test:all`              | ~15 s | nein          |

> Die vormals existierende **Integration-E2E-Suite** (Playwright gegen echtes
> Backend + Postgres) wurde entfernt. Grund: sie war ans alte UI gebunden und
> wurde durch die Smoke-Suite funktional abgelöst. Für echte Backend-Abdeckung
> ist ein separater Contract-Test-Ansatz geplant — siehe
> [`.claude/plans/backend-contract-tests.md`](../.claude/plans/backend-contract-tests.md).

## Details

### 1. Lint (`npm run lint`)
ESLint + `eslint-plugin-vue` + `typescript-eslint`. Keine Errors, 0 Warnungen.
Auto-fix: `npm run lint:fix`.

### 2. Type-Check (`npm run type-check`)
`vue-tsc --noEmit` validiert TypeScript in `.ts` + `.vue`. Muss clean sein
bevor etwas committet wird.

### 3. Unit-Tests (`npm test`)
Vitest mit `happy-dom`. Tests liegen entweder neben dem Quellfile
(`foo.test.ts`) oder in `__tests__/`. Abgedeckt sind u.a.:
- `composables/useSortedPlayers` — Sortier- und Stats-Logik
- `composables/useViewMode`      — View-Preference mit localStorage
- `composables/useOfflineSync`   — Queue-Flush, Retry
- `stores/syncQueue`             — Dedup, enqueue, remove
- `utils/scoreHeatmap`           — Farb-Klassifikation relativ zum Loch-Ø
- `utils/format`                 — String-Kürzung, Date-Format
- `services/api`                 — HTTP-Wrapper

### 4. Smoke-E2E (`npm run test:e2e:smoke`)
Schneller Playwright-Lauf ohne Backend. Alle API-Routen werden
via `page.route()` gemockt (siehe [e2e/smoke/mock-api.ts](e2e/smoke/mock-api.ts)).

Testet die kritischen User-Flows:
- **home**: Hero, Recent-Games, Bottom-Nav Navigation
- **new-game**: Spiel erstellen, Spieler hinzufügen, Limit 10
- **score-entry**: ± Buttons, Keypad-Sheet, Hole-Pill-Navigation
- **scorecard**: Podium-Ranking by Total, View-Switcher
- **settings-and-i18n**: Theme-Wechsel, Sprachwechsel
- **version-display**: App-Version im Settings-Sheet

Läuft parallel auf Mobile (Pixel 5) **und** Desktop-Chromium. Der Vite-Dev-Server
wird automatisch gestartet (`webServer`).

```bash
npm run test:e2e:smoke         # headless
npm run test:e2e:smoke:headed  # sichtbarer Browser
```

### 5. Visual-Audit (`npm run test:visual`)
Playwright-Node-API-Script das bei jeder Route zwei Screenshots macht
(Viewport-Oben + Viewport-Unten bei Scroll), in Light- und Dark-Mode.
Ergebnis: `e2e/screenshots/*.png`. Hilfreich bei Designänderungen zum
Vergleich vorher/nachher.

### 6. Horizontal-Scroll-Audit (`node e2e/horizontal-scroll-audit.mjs`)
Misst auf jeder Haupt-View `scrollWidth` vs `clientWidth` (Pixel-5-Viewport).
Findet sofort Layouts die unerwünscht horizontal scrollen. Gate-freundlich —
Exit-Code 1 bei Overflow.

### 7. Kombi (`npm run test:all`)
Führt alles aus was ohne Backend läuft: Lint → Type-Check → Unit → Smoke-E2E.
Ideal als Pre-Push-Hook oder in CI.

## Struktur

```
frontend/
├── src/
│   ├── **/*.test.ts                      # Unit-Tests (neben Quelle)
│   └── **/__tests__/*.test.ts            # Unit-Tests (Ordner-Stil)
├── e2e/
│   ├── smoke/                            # Smoke-Specs (Mock-API)
│   │   ├── fixtures.ts
│   │   ├── mock-api.ts
│   │   └── *.spec.ts
│   ├── visual-audit.mjs                  # Screenshot-Script
│   └── horizontal-scroll-audit.mjs       # Overflow-Check
├── playwright.smoke.config.ts            # Smoke-Konfig (Auto-Dev-Server)
└── eslint.config.js
```

## CI-Pipeline

[.github/workflows/ci.yml](../.github/workflows/ci.yml) führt diese Jobs aus:

1. `static-checks` (Lint + Type-Check)
2. `unit-frontend` + `unit-backend` parallel
3. `e2e-smoke` (Mock-API Playwright)
4. `ci-green` Meta-Gate für Branch-Protection
5. `deploy-backend` + `deploy-frontend` (nur auf main-Push)

Gesamtlaufzeit: **~6-10 Minuten** von Push bis GHCR-Tag.

## Backend-Tests

Das Backend hat eine separate Vitest-Suite:
```bash
npm test --workspace=backend
```

63 Unit-Tests über API-Validation, Utils und DB-Zugriff. Backend-Contract-Tests
(gegen die Fastify-App ohne Browser) sind in Planung, siehe
[backend-contract-tests plan](../.claude/plans/backend-contract-tests.md).
