---
name: redesign-component
description: Workflow für das Neuschreiben einer einzelnen Vue-Komponente im Greenway-Designsystem
---

# Redesign-Component Workflow

Anzuwenden beim Neuschreiben jeder UI-Komponente. Stellt Konsistenz mit dem Greenway-Designsystem sicher.

## Schritte

### 1. Kontext-Review
- Lese die bestehende Komponente vollständig
- Identifiziere: Props, Emits, Slots, Composables, Zugriff auf Stores/API
- Dokumentiere den User-Flow: wer öffnet die Komponente, was passiert danach?

### 2. Mobile-First Sketch (mental)
- Zielgerät: iPhone SE (375×667) bis iPhone 16 Pro Max (430×932)
- Thumb-Zone-Check: sind primäre Aktionen im unteren Drittel?
- Wie viele Scrolls bis zur wichtigsten Info?
- Kann der User mit einer Hand interagieren?

### 3. Tokens statt Ad-hoc
- Keine hardcoded Farben – immer `var(--color-*)` oder Tailwind-Theme-Klasse
- Keine magic numbers beim Spacing – `--space-*` oder `gap-N/p-N`
- Typo-Klassen aus Design-System: `text-display`, `text-score-lg`, etc.

### 4. Animation
- State-Transitions mit Tailwind `transition` + `--ease-spring`
- Score-Änderungen pulsen
- Card-Expand/Collapse: height + opacity, 240ms

### 5. Accessibility
- Tap-Targets ≥ 44px
- ARIA-Labels für Icon-Buttons
- Focus-Visible mit 2px Ring in `--color-accent-500`
- `prefers-reduced-motion` respektieren

### 6. i18n
- Alle User-facing Strings via `$t('key')`
- Neue Keys in allen 4 Locales (de, en, fr, nl) – `de` ist Master

### 7. TypeScript
- Props mit `defineProps<Interface>()`
- Emits mit `defineEmits<{}>()` (TypeScript-Variante)
- Keine `any`

### 8. Testing-Gate
- Bei Score-Logik: Vitest-Unit-Test
- Bei E2E-relevanten Flows: Playwright-Test updaten

## Checkliste vor Commit

- [ ] Komponente verwendet ausschließlich Design-Tokens
- [ ] Mobile-Layout (375px) getestet (via Browser DevTools)
- [ ] Dark-Mode funktioniert (Toggle)
- [ ] Alle Strings i18n-isiert
- [ ] Keine TypeScript-Fehler (`npm run type-check`)
- [ ] Lint clean (`npm run lint`)
- [ ] Alte Komponente gelöscht oder durch Re-Export ersetzt

## Bei Unsicherheit

Lies [ui-tokens SKILL.md](../ui-tokens/SKILL.md) erneut. Bei echten Design-Entscheidungen: User fragen, nicht raten.
