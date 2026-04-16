---
name: ui-tokens
description: Design-Token-System & Visual Language für die Urban Golf ScoreCard App (Greenway-Design)
---

# Greenway Design System – Urban Golf ScoreCard

Alle UI-Entscheidungen referenzieren dieses Dokument. Single Source of Truth für Farben, Typo, Spacing, Motion.

## Tokens-Datei

Alle Tokens leben als CSS Custom Properties in [frontend/src/assets/tokens.css](../../../frontend/src/assets/tokens.css) und werden in [global.css](../../../frontend/src/assets/global.css) importiert. Tailwind nutzt sie via `@theme` Direktive in Tailwind 4.

## Design-Prinzipien

1. **Thumb-first** – alle primären Aktionen in der unteren Bildschirmhälfte, 48px+ Tap-Targets
2. **Content over Chrome** – minimaler Header, keine dekorativen Borders, Fokus auf Daten
3. **Depth via Elevation, not Blur** – echte Karten mit Schatten statt Glass-Morphism
4. **Motion with Purpose** – Spring-Animationen für State-Changes, keine rein dekorativen Transitions
5. **Numerical Hierarchy** – Scores/Holes sind die Helden; Typo-Scale betont Zahlen

## Farb-Palette (Greenway)

- **Brand – Fairway**: `--color-brand-50` bis `--color-brand-900` (Emerald-basiert, lebhaft)
- **Accent – Lime**: `--color-accent-400/500` (CTAs, Live-Indicator, Pulse)
- **Neutral – Slate+warm**: `--color-surface-0` bis `--color-surface-900`
  - Light: Cream-white (`oklch(98% 0.01 95)`)
  - Dark: Deep forest (`oklch(15% 0.02 160)`)
- **Semantic**: `--color-success`, `--color-warning`, `--color-danger`, `--color-info`
- **Score-Heatmap**: eagle, birdie, par, bogey, double+ (Grün → Gelb → Rot)

## Typografie

- **Body**: Inter Variable (fallback system-ui)
- **Display/Numbers**: Inter Variable mit `font-variant-numeric: tabular-nums` + `font-feature-settings: "ss02", "cv11"` für geometrischere Ziffern
- **Scale**: `--text-xs` bis `--text-display` (8 Stufen, mobile-optimiert via clamp)

## Spacing & Radii

- **Spacing**: 4px-Raster (`--space-1` = 4px … `--space-12` = 64px)
- **Radii**: `--radius-sm` (8px), `--radius-md` (16px), `--radius-lg` (24px), `--radius-pill` (999px)

## Elevation

- `--elev-1`: subtiler 1px-Shadow für Cards
- `--elev-2`: prominenter für FABs, Dialoge
- `--elev-3`: für Modals/Bottom-Sheets

## Motion

- `--ease-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` – leichter Overshoot
- `--ease-standard`: `cubic-bezier(0.4, 0, 0.2, 1)`
- `--dur-fast`: 150ms, `--dur-med`: 240ms, `--dur-slow`: 400ms

## Komponenten-Primitive

Alle in [frontend/src/components/ui/](../../../frontend/src/components/ui/):

- `AppButton.vue` – Variants: primary, secondary, ghost, danger; sizes: sm, md, lg; pill/rounded
- `AppCard.vue` – Variants: flat, elevated, interactive; padding slots
- `AppBadge.vue` – für Status, Scores relativ zum Par
- `AppIconButton.vue` – 44px-min, kreisrund
- `AppFab.vue` – Floating Action Button für primäre Aktionen
- `AppBottomSheet.vue` – für mobile Dialoge statt Modals
- `SegmentedControl.vue` – iOS-Style Tab-Switcher

## Bottom Navigation

Mobile: Fixed-Bottom-Bar mit 4 Primär-Tabs. Desktop (md+): Top-Nav.
Komponente: [BottomNav.vue](../../../frontend/src/components/layout/BottomNav.vue)

## Tabs

- 🏠 Home (`/`)
- 🎯 Games (`/games`)
- ➕ Neu (Schnell-CTA, öffnet `/games/new`)
- ℹ️ Info (`/about`)

## Verboten

- ❌ Glass-Morphism (`backdrop-blur` auf großen Flächen) – nur noch dezent für Navbars
- ❌ Harte Farben (`bg-blue-500`) direkt im Template – immer Token nutzen
- ❌ px-Werte für Spacing – immer Tailwind-Klassen oder Tokens
- ❌ Emojis in Production-UI (außer explizit gefordert)

## Beispiel-Referenzen

- **Home**: Strava-ähnlich mit großer Headline + Activity-Feed
- **Score Entry**: Apple Fitness-inspiriert, große Zahlen, Ring-Progress
- **Ranking**: Formel-1-Live-Timing + ESPN Sport-Leaderboard
