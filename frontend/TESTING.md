# Testing Guide — Urban Golf ScoreCard

Mehrere Ebenen von Tests stehen zur Verfügung. Jede hat einen klaren Zweck und
kann unabhängig ausgeführt werden.

## Übersicht

| Ebene               | Tool              | Script                          | Dauer | Backend nötig |
| ------------------- | ----------------- | ------------------------------- | ----- | ------------- |
| Lint                | ESLint            | `npm run lint`                  | ~2 s  | nein          |
| Type-Check          | vue-tsc           | `npm run type-check`            | ~3 s  | nein          |
| Unit                | Vitest            | `npm test`                      | ~1 s  | nein          |
| Smoke-E2E (mock)    | Playwright        | `npm run test:e2e:smoke`        | ~5 s  | nein          |
| Visual-Audit        | Playwright Node   | `npm run test:visual`           | ~20 s | nein          |
| Integration-E2E     | Playwright        | `npm run test:e2e`              | ~60 s | **ja**        |
| Alles zusammen      | Meta              | `npm run test:all`              | ~15 s | nein          |

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
**Neu:** Schneller Playwright-Lauf ohne Backend. Alle API-Routen werden
via `page.route()` gemockt (siehe [e2e/smoke/mock-api.ts](e2e/smoke/mock-api.ts)).

Testet die kritischen User-Flows im neuen Greenway-UI:
- **home**: Hero, Recent-Games, Bottom-Nav Navigation
- **new-game**: Spiel erstellen, Spieler hinzufügen, Limit 10
- **score-entry**: ± Buttons, Keypad-Sheet, Hole-Pill-Navigation
- **scorecard**: Podium-Ranking by Total, View-Switcher
- **settings-and-i18n**: Theme-Wechsel, Sprachwechsel

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

### 6. Integration-E2E (`npm run test:e2e`)
Die ursprüngliche Playwright-Suite. Braucht ein **laufendes Backend**
unter `PLAYWRIGHT_BASE_URL` (Default `http://localhost:8080`) mit
Postgres-DB. Der `global-setup` seedet Testdaten. Page-Objects wurden
nach dem Redesign auf die neuen Selektoren aktualisiert — bleiben kompatibel
solange die DOM-Struktur stabil bleibt.

```bash
# DB + Backend vorbereiten, dann:
npm run test:e2e
```

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
│   ├── pages/                            # Page-Objects (Integration)
│   ├── tests/                            # Integration-Specs (Backend nötig)
│   ├── smoke/                            # Smoke-Specs (Mock-API)
│   │   ├── fixtures.ts
│   │   ├── mock-api.ts
│   │   └── *.spec.ts
│   ├── fixtures.ts                       # Integration-Fixture
│   ├── global-setup.ts / teardown.ts     # DB-Seed (Integration)
│   └── visual-audit.mjs                  # Screenshot-Script
├── playwright.config.ts                  # Integration-Konfig
├── playwright.smoke.config.ts            # Smoke-Konfig
└── eslint.config.js
```

## CI-Empfehlung

Im CI sollten mindestens laufen:
```bash
npm run lint
npm run type-check
npm test
npm run test:e2e:smoke
```

Die Integration-Suite (`test:e2e`) sollte in einem separaten Job laufen der
vorher Postgres + Backend hochfährt.
