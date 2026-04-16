---
name: release-checklist
description: Schrittweise Checklist für Version-Bumps — package.json files, Changelog, Tests, visual Audit, Commit
---

# Release-Checklist

Workflow für jeden Versions-Bump. Reihenfolge beachten, damit die Tests mit der
neuen Version laufen.

## Versions-Dateien (alle gleichzeitig bumpen)

```
/package.json              # Root workspace (npm run ... delegiert hierhin)
/frontend/package.json     # Frontend-App
/backend/package.json      # Backend-API
```

**Kein** Lock-File manuell bumpen — `npm install` erledigt das beim nächsten Run.

```bash
# Quick-Bump via grep (Beispiel: 3.0.0 → 3.1.0)
for pkg in package.json frontend/package.json backend/package.json; do
  sed -i 's/"version": "3\.0\.0"/"version": "3.1.0"/' "$pkg"
done
```

## Public-CHANGELOG aktualisieren

Entry oben einfügen in [frontend/public/CHANGELOG.md](../../../frontend/public/CHANGELOG.md):

```markdown
## [3.1.0] – YYYY-MM-DD

### 🎨 Features
- Konkrete User-facing Features

### ✅ Qualität
- Tests, Accessibility, Performance

### 🪲 Bugfixes
- Behobene User-sichtbare Bugs
```

Der In-App Changelog (`/about/changelog`) lädt diese Datei über `fetch('/CHANGELOG.md')`.

## Test-Pipeline (alle Gates)

```bash
npm run lint           # Lint beide Workspaces
npm run type-check     # Frontend vue-tsc
npm test               # Unit (Frontend + Backend)
npm run test:e2e:smoke --workspace=frontend   # Playwright mit Mock-API
```

Alle müssen grün sein. Bei Fails:
- Tests an UI-Änderungen anziehen (z.B. neuer `getByRole`-Selector)
- Unit-Tests an neue Default-Werte anpassen
- i18n-Test auf richtige Locale prüfen

## Visual-Audit (siehe Skill `visual-audit`)

```bash
node frontend/e2e/horizontal-scroll-audit.mjs
node frontend/e2e/visual-audit.mjs
```

Screenshots durchsehen — insbesondere:
- Settings-Sheet zeigt neue Version
- Home, Hole-View, Games-Detail wirken unverändert (falls kein UI-Change)

## Production-Build

```bash
npm run build --workspace=frontend
```

Warning um `inlineDynamicImports` ist bekannt (siehe vite.config.js-Kommentar).
Alle anderen Warnungen müssen adressiert werden.

## Commit-Konvention

Format:
```
Release 3.1.0: one-line summary

- Feature/Fix 1
- Feature/Fix 2
```

Nicht mit `[major]`/`[minor]`/`[patch]` konventionalcommits verschwurbeln — der
CHANGELOG erzählt die Story.

## Push-Strategie

Für ein echtes Release:
1. Auf einem Feature-Branch committen (nicht direkt auf `main`)
2. PR gegen `main` öffnen
3. CI muss grün sein (siehe [.github/workflows/ci.yml](../../../.github/workflows/ci.yml))
4. Nach Merge: auf `main` triggert der Deploy-Workflow automatisch GHCR-Image-Build

Für Dokumentation-only oder Infrastruktur-only Commits ohne Version-Bump: OK
direkt auf main, wenn vom User so gewünscht.

## Post-Release Sanity-Check

Nach dem Deploy:
- `/about/changelog` öffnen → neuer Eintrag sichtbar
- Settings-Sheet öffnen → neue Version im Footer
- PWA-Update-Dialog sollte beim nächsten Besuch auftauchen (dauert bis zu
  24h je nach SW-Cache)

## Do NOT

- **Keine** Version in nur einem package.json bumpen (inkonsistent)
- **Kein** Bump ohne Changelog-Eintrag
- **Kein** Tag-Push ohne `npm run test:all`
- **Kein** Force-Push auf `main`
