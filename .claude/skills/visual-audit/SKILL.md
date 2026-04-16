---
name: visual-audit
description: UI/UX-Validierungs-Workflow mit Screenshots, Horizontal-Scroll-Check und Test-Gates nach jeder visuellen Änderung
---

# Visual-Audit Workflow

Nach jeder UI/UX-relevanten Änderung führe diesen Workflow aus, bevor du dem
User die Änderung als "fertig" meldest. Er garantiert, dass keine Regressions
unbemerkt bleiben.

## Die 4 Gates

### 1. Code-Gates (schnell)
```bash
npm run lint          # ESLint, auch Workspace-weit möglich
npm run type-check    # vue-tsc --noEmit
npm test              # Vitest unit tests
```
Alle müssen clean sein. Bei Lint-Warnungen: falls styling-Issue, `lint:fix`;
bei semantischen Issues: tatsächlich fixen.

### 2. Smoke-E2E (Playwright mit Mock-API)
```bash
npm run test:e2e:smoke --workspace=frontend
```
Läuft ohne Backend. Tests in [frontend/e2e/smoke/](../../../frontend/e2e/smoke/)
decken die kritischen Flows ab. Wenn ein Test bricht: entweder UI hat sich geändert
(Test nachziehen) oder Regression (Code fixen).

### 3. Horizontal-Scroll-Audit
```bash
node e2e/horizontal-scroll-audit.mjs
```
Script in [frontend/e2e/horizontal-scroll-audit.mjs](../../../frontend/e2e/horizontal-scroll-audit.mjs).
Besucht 10 Haupt-Views auf Pixel-5-Viewport und misst `scrollWidth > clientWidth`.
0px Overflow überall ist Pflicht — horizontale Scrolls auf Mobile sind immer UX-Bug.

### 4. Visual-Audit (Screenshot-Vergleich)
```bash
node e2e/visual-audit.mjs
```
Erzeugt 16 Screenshots (8 Views × 2 Themes) in
[frontend/e2e/screenshots/](../../../frontend/e2e/screenshots/).
Pro View: viewport-only + bottom-scroll screenshot. Die solltest du
visuell durchsehen — insbesondere bei:
- Farbänderungen
- Layout-Änderungen
- Neuen Komponenten
- Theme-Änderungen (Dark vs Light)

## Pflicht-Inspektion pro Change

Bei jeder substantiellen UI-Änderung solltest du mindestens diese Screenshots lesen:

| Datei | Warum |
|---|---|
| `01-home-light-viewport.png` | Hero, Animation, Quick-Actions |
| `02-games-list-light-viewport.png` | Card-Layout, Avatars, Meta |
| `04-games-detail-light-viewport.png` | Podium, SegmentedControl, Pill-Strip |
| `05-games-hole-light-viewport.png` | Hole-Stepper, Player-Tiles, Bottom-Nav |
| `07-about-roadmap-light-viewport.png` | Progress-Block, Timeline |
| `01-home-dark-viewport.png` | Theme-Differenzierung, Token-Mapping |
| `05-games-hole-dark-viewport.png` | Player-Accent-Sichtbarkeit im Dark-Mode |

## Device-Edge-Cases im Blick behalten

- **Pixel-5** (393×851) ist Standard-Referenz
- **iPhone SE** (375×667) — minimale Breite, teste Tight-Layouts
- **iPhone 14 Pro Max landscape** (932×430) — PWA-Banner, sticky elements
- **Desktop Chromium** (1920×1080) — Bottom-Nav ausgeblendet, Top-Nav aktiv

## Root-Cause-Analyse bei Pixel-Overflow

Wenn der Horizontal-Scroll-Audit einen Overflow findet:
1. Screenshot im `h-overflow-*.png` ansehen
2. DevTools-Elements im Browser: den rechten Rand des Viewports inspizieren
3. Typische Ursachen:
   - Element mit `min-width` größer als Viewport
   - `word-break: keep-all` + langer nicht-umbrechbarer String (z.B. Spielname)
   - `overflow-x: visible` statt `hidden` auf einem Container
   - Absolut positioniertes Element mit `right: -Npx`
   - Tabellen ohne Container mit `overflow-x: auto`

## Don't

- **Keine** UI-Änderung als "done" melden ohne mindestens die Screenshot-Inspektion
- **Keine** neuen fixed/sticky Elemente hinzufügen ohne den Scroll-Audit zu prüfen
- **Keine** Tailwind-Utilities wie `min-w-[999px]` ohne explizite Begründung

## Nach dem Audit

Wenn alle 4 Gates grün sind:
1. Kurzes Fazit an den User (Was wurde geändert, was wurde geprüft)
2. Referenz zu den betroffenen Screenshots
3. Mögliche Remaining-Findings auflisten (P0 = kritisch, P1 = wichtig, P2 = nice-to-have)
