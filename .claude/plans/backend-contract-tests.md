# Plan — Backend-Contract-Tests

Implementation-Plan für explizite API-Contract-Tests gegen die Fastify-Backend-App.
Nicht ausführen — nur als Referenz für den späteren Implementierer.

## Ziel

Schnelle, zuverlässige Tests die garantieren, dass die HTTP-API des Backends
ihre Contracts einhält:
- Status-Codes (200/201/400/404/409/500)
- Response-Body-Struktur (Shape + Typen)
- Request-Validation (Pflichtfelder, Ranges, Formats)
- Error-Payloads (`{ error: string }`)

**Was Contract-Tests NICHT sind**: keine UI-Tests, kein End-to-End,
keine Performance-Tests. Sie testen ausschliesslich die HTTP-Schnittstelle
des Backends.

## Warum überhaupt

Aktuell haben wir:
- Backend **Unit-Tests** (Vitest, 63 Tests) — testen Helpers, DB-Zugriff, interne Funktionen
- Frontend **Smoke-E2E** (Playwright mit Mock-API) — testen UI gegen gemockte Responses

Die Lücke dazwischen: **Niemand verifiziert aktuell, dass das echte Backend die
erwarteten Responses liefert**. Wenn der Mock im Frontend und die echte API
auseinanderlaufen (z.B. Feld umbenannt, Status geändert), bricht Production.

## Technischer Ansatz

### Tool: Fastify's `.inject()` statt echtem HTTP-Server

Fastify hat eine eingebaute [`inject()`-Methode](https://fastify.dev/docs/latest/Reference/Testing/#testing-with-http-injection)
die die App in-Memory mit simulierten HTTP-Requests füttert — **ohne** Socket,
ohne Port, ohne Netzwerk. Gleiche Route-Handler, gleiche Plugin-Chain, aber
millisekunden-schnell und ohne Side-Effects.

```js
import { build } from '../app.js'  // Factory-Funktion, kein Listen

const app = await build({ logger: false })
const res = await app.inject({
  method: 'POST',
  url: '/api/games',
  payload: { id: 'abc', name: 'Test', players: [] }
})

expect(res.statusCode).toBe(200)
expect(res.json()).toMatchObject({ id: 'abc', status: 'created' })
```

### Datenbank-Strategie: Transactional Rollback

Jeder Test läuft in einer Transaktion, die am Ende rolled-back wird. So
bleibt die DB zwischen Tests stabil ohne Truncate/Seed-Overhead.

```js
beforeEach(async () => {
  await db.query('BEGIN')
})
afterEach(async () => {
  await db.query('ROLLBACK')
})
```

**Alternative falls Rollback knifflig wird**: Testcontainers mit Postgres,
dedizierte Test-DB, Truncate-all-Tables vor jedem Test. Langsamer aber
robuster.

### Refactor: `app.js` muss build-able sein

Aktuell startet `app.js` den Server direkt (`app.listen`). Für Tests muss eine
Factory-Funktion existieren die die App konstruiert **ohne** zu listen:

```js
// backend/app.js (neu)
export async function build(opts = {}) {
  const app = Fastify(opts)
  // ... plugins, routes
  return app
}

// Nur ausführen wenn direkt gestartet (nicht beim Testen importiert)
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = await build({ logger: true })
  await app.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' })
}
```

## Contract-Definition: JSON-Schema oder Zod?

Zwei realistische Optionen:

### Option A: JSON-Schema (Native Fastify)

Fastify validiert Requests und Responses nativ via JSON-Schema. Wenn wir
Schemas an Routes hängen, hat der Contract genau eine Quelle:

```js
app.route({
  method: 'POST',
  url: '/api/games',
  schema: {
    body: {
      type: 'object',
      required: ['id', 'name', 'players'],
      properties: {
        id: { type: 'string', pattern: '^[A-Za-z0-9_-]{10,30}$' },
        name: { type: 'string', minLength: 1, maxLength: 30 },
        players: { type: 'array', items: { type: 'string' }, maxItems: 10 }
      }
    },
    response: {
      200: {
        type: 'object',
        required: ['id', 'status'],
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ['created', 'updated'] }
        }
      }
    }
  },
  handler: async (req, reply) => { /* ... */ }
})
```

**Pro**: Native Fastify-Validation, 400-Responses kommen automatisch,
Response-Shape wird runtime-verifiziert. Generiert OpenAPI-Spec via
`@fastify/swagger` ohne Extra-Code.

**Contra**: JSON-Schema ist verbose, keine TypeScript-Integration out-of-the-box.

### Option B: Zod mit `fastify-type-provider-zod`

Zod-Schemas als Source of Truth, TypeScript-Typen werden daraus abgeleitet:

```ts
const GameCreateBody = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{10,30}$/),
  name: z.string().min(1).max(30),
  players: z.array(z.string()).max(10),
})
// TS-Typ kostenfrei:
type GameCreateBody = z.infer<typeof GameCreateBody>
```

**Pro**: Elegantere Syntax, TypeScript-Integration, Frontend kann dieselben
Schemas importieren (Single Source of Truth!).

**Contra**: Neue Dependency, Backend müsste auf TypeScript wechseln (aktuell ist
es plain JS). Oder man nutzt `zod/v4` in JSDoc-Style — weniger schön.

**Empfehlung für dieses Projekt**: **Option A (JSON-Schema)**. Das Backend ist
klein, nicht-TypeScript, und Fastify's native Validation liefert 90% des
Werts ohne zusätzliche Tools. Falls später Zod gewünscht: nachrüsten ist leicht.

## Test-Struktur

```
backend/
├── app.js                          ← Factory-Funktion `build()`
├── routes/
│   ├── games.js                    ← Schemas direkt an Route
│   ├── players.js
│   ├── scores.js
│   └── feedback.js
└── test/
    ├── contract/                   ← NEUE Tests
    │   ├── games.contract.test.js
    │   ├── players.contract.test.js
    │   ├── scores.contract.test.js
    │   └── feedback.contract.test.js
    ├── helpers/
    │   ├── test-app.js             ← build() + DB-Transaction-Wrapper
    │   └── fixtures.js             ← Minimal-Payloads für jede Route
    └── *.test.js                   ← bestehende Unit-Tests
```

## Beispiel-Test

```js
// backend/test/contract/games.contract.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { makeTestApp } from '../helpers/test-app.js'
import { validGamePayload } from '../helpers/fixtures.js'

describe('POST /api/games', () => {
  let app, db

  beforeAll(async () => { ({ app, db } = await makeTestApp()) })
  afterAll(async () => { await app.close(); await db.end() })
  beforeEach(async () => { await db.query('BEGIN') })
  afterEach(async () => { await db.query('ROLLBACK') })

  it('creates a game with valid payload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/games',
      payload: validGamePayload(),
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({
      id: expect.any(String),
      status: 'created',
    })
  })

  it('rejects missing name with 400', async () => {
    const { name, ...body } = validGamePayload()
    const res = await app.inject({ method: 'POST', url: '/api/games', payload: body })
    expect(res.statusCode).toBe(400)
    expect(res.json().error).toMatch(/name/i)
  })

  it('rejects too-long name with 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/games',
      payload: { ...validGamePayload(), name: 'x'.repeat(31) }
    })
    expect(res.statusCode).toBe(400)
  })

  it('rejects invalid id pattern with 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/games',
      payload: { ...validGamePayload(), id: '!!!' }
    })
    expect(res.statusCode).toBe(400)
  })
})
```

## Implementierungs-Schritte

### Phase 1: Foundation (halber Tag)

1. **Refactor `app.js`** — Extract `build()` factory, keep `listen()` only when
   file is run directly.
2. **Test-Helper schreiben** — `test/helpers/test-app.js` mit `makeTestApp()`
   der `build()` aufruft und eine Test-DB-Connection bereitstellt.
3. **Transactional-Setup** — `beforeEach: BEGIN`, `afterEach: ROLLBACK` in
   einem Vitest-Helper.
4. **Erste Schema hinzufügen** — `POST /api/games` bekommt `schema`-Block.
5. **Erster Contract-Test** — `games.contract.test.js` mit 3-4 Cases.

### Phase 2: Abdeckung (halber bis ganzer Tag)

6. **Schema + Tests für alle Routen**:
   - `/api/games` (POST, GET, GET/:id, GET/:id/players, GET/summary)
   - `/api/players` (POST, GET)
   - `/api/scores` (POST, GET)
   - `/api/feedback` (POST)
7. **Happy-Path + mindestens ein Error-Case** pro Endpoint.
8. **Edge-Cases** wo sinnvoll (Stroke-Grenzen, Player-Limit, Duplikate).

### Phase 3: CI-Integration (30 min)

9. **Test-DB in CI** — Postgres-Service in `.github/workflows/ci.yml` wie
   früher für Integration, aber ohne Frontend-Build:
   ```yaml
   contract-backend:
     needs: static-checks
     services:
       postgres: { image: postgres:16-alpine, ... }
     steps:
       - psql -f backend/db/init/schema.sql
       - npm test --workspace=backend -- --run test/contract
   ```
10. **In `ci-green.needs` aufnehmen**.
11. **Erwartete Laufzeit: 1-2 min** (keine Browser, keine UI, kein DB-Seed
    zwischen Tests — nur Transactions).

### Phase 4: Shared-Types (optional, später)

12. **OpenAPI-Spec generieren** via `@fastify/swagger`.
13. **Frontend generiert TypeScript-Types** aus OpenAPI-Spec (z.B. mit
    `openapi-typescript`).
14. **Frontend-Mock im `e2e/smoke/mock-api.ts`** nutzt dieselben Types →
    Drift zwischen Mock und real impossible.

## Erwartete Gewinne

| Metric | Vorher | Nachher |
|---|---|---|
| Backend-API-Regression-Sicherheit | Niedrig (Unit-Tests nur intern) | Hoch (jede Response wird typ-geprüft) |
| CI-Laufzeit für Backend-Coverage | 0 min (fehlt) | 1-2 min |
| Frontend-Mock-Drift | Möglich & unbemerkt | Blocker: Mock-Schema aus OpenAPI abgeleitet (Phase 4) |
| OpenAPI-Dokumentation | Fehlt | Kostenlos aus Schemas generiert |

## Nicht-Ziele

- **Kein UI-Testing** — dafür gibt es die Smoke-Suite.
- **Kein Load-Testing** — gehört in separate Perf-Suite (z.B. k6).
- **Kein Backwards-Compat-Testing** — bei Breaking-Changes in der API ist der
  Contract-Test das erste Gate; das Upgrade des Frontends ist ein eigener Issue.

## Offene Fragen für den Implementierer

1. **Test-DB-Strategie**: Shared Postgres mit Transactional Rollback ODER
   ephemere Testcontainer-Instanz pro Run? Transactional ist schneller,
   Testcontainer sicherer.
2. **Zod vs JSON-Schema**: Empfehlung oben ist JSON-Schema. Falls das Team
   TypeScript im Backend einführen will, Zod erneut prüfen.
3. **Contract-Versioning**: Wenn irgendwann API-v2 kommt, wie kennzeichnen wir
   Breaking-Changes? Semver im `package.json` + `/api/v2`-Prefix sind
   ausreichend für ein Projekt dieser Größe.

## Zeitschätzung

- Phase 1: 3-4 h
- Phase 2: 4-6 h
- Phase 3: 30-60 min
- Phase 4: 2-3 h (optional)

**Total ohne Phase 4: ~1-1.5 Tage** um eine solide Backend-Contract-Coverage
zu haben, die den Wegfall der Playwright-Integration-Suite mehr als kompensiert.
