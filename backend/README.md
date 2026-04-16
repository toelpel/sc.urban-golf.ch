# Backend — Urban Golf ScoreCard

Die Fastify-5-API der ScoreCard-App. Für Architektur siehe
[../ARCHITECTURE.md](../ARCHITECTURE.md), für Deployment
[../DEPLOYMENT.md](../DEPLOYMENT.md).

## Quick Start

```bash
cd backend
npm install
docker compose -f ../docker-compose.dev.yml up -d postgres    # nur Postgres
cp .env.example .env                                          # falls vorhanden
npm run migrate:up                                            # DB-Schema
npm run dev                                                   # http://localhost:3000
```

## Tech Stack

| Bereich | Version / Library |
| --- | --- |
| Runtime | Node.js 20+ (ESM) |
| Framework | Fastify 5 |
| DB | PostgreSQL 16 via `pg` (nativer Client, kein ORM) |
| Migrations | node-pg-migrate 8 (SQL-Files) |
| Security | @fastify/helmet, @fastify/cors, @fastify/rate-limit |
| Compression | @fastify/compress (gzip + brotli) |
| Mail | nodemailer (Brevo/SMTP für Feedback) |
| Tests | Vitest 4 |
| Lint | ESLint 10 |

## Projektstruktur

```
backend/
├── app.js                       Fastify-Bootstrap, Plugin-Registrierung, Server-Start
├── routes/
│   ├── games.js                 /api/games, /api/games/:id, /api/games/summary, …
│   ├── players.js               /api/players
│   ├── scores.js                /api/scores
│   └── feedback.js              /api/feedback
├── db/
│   ├── index.js                 pg-Pool-Singleton
│   ├── init/schema.sql          Schema für initiale Docker-DB
│   └── migrations/              node-pg-migrate SQL-Files
├── utils/                       Helpers
├── scripts/                     Baseline-Migration, Utility-Scripts
├── test/                        Vitest-Tests
├── Dockerfile                   Multi-Stage Build
├── eslint.config.js
└── package.json
```

## Environment

`.env` (Root oder `backend/.env`) — Key-Wert-Paare:

```
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/urban_golf
DATABASE_SSL=false
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
NODE_ENV=development

# Feedback-Mail (Brevo/SMTP)
BREVO_SMTP_USER=your-login@example.com
BREVO_SMTP_PASS=***********
ADMIN_EMAIL=admin@urban-golf.ch
```

`DATABASE_URL` ist die einzige Pflicht-Variable; alle anderen haben Defaults.

## NPM Scripts

| Script | Zweck |
| --- | --- |
| `npm run dev` | Server starten (node app.js) |
| `npm start` | Produktionsstart |
| `npm test` | Vitest Unit-Tests |
| `npm run test:watch` | Vitest Watch-Mode |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run migrate:up` | Migrations anwenden (SQL-Files in `db/migrations/`) |
| `npm run migrate:down` | Letzte Migration zurückrollen |
| `npm run migrate:create` | Neues Migration-Skelett erzeugen |
| `npm run migrate:baseline` | Bestehende DB als "migrated" markieren (einmalig nach Init-Schema) |

### Typischer Migration-Flow

```bash
# 1) Neue Migration anlegen
npm run migrate:create -- add_course_table
# → erzeugt db/migrations/<ts>_add_course_table.sql

# 2) SQL in die Datei schreiben (up-Section)

# 3) Anwenden
npm run migrate:up

# 4) Rollback (optional, zum Testen)
npm run migrate:down
```

## API-Routen (Kurzüberblick)

| Methode | Pfad | Zweck |
| --- | --- | --- |
| GET | `/api/games/summary?page=1&per_page=10&search=…` | paginierte Liste mit Meta (Spieler, Löcher, Stats) |
| GET | `/api/games/:id` | Spiel-Basisdaten |
| GET | `/api/games/:id/players` | Spieler eines Spiels |
| POST | `/api/games` | Spiel anlegen/updaten |
| GET | `/api/scores?game_id=…` | Scores eines Spiels |
| POST | `/api/scores` | Score anlegen/überschreiben (upsert) |
| POST | `/api/players` | Spieler anlegen/updaten |
| POST | `/api/feedback` | Feedback abgeben (triggert Mail) |

Vollständige Schnittstellen-Signatur: [routes/](routes/).

## Docker

Produktions-Image via [Dockerfile](Dockerfile). Wird automatisch in CI/CD gebaut —
siehe [.github/workflows/ci.yml](../.github/workflows/ci.yml).

Lokal bauen:
```bash
docker build -f Dockerfile -t urbangolf-backend:dev ..
```

## Testing

Unit-Tests mit Vitest in `test/`. Für E2E-Tests gegen ein laufendes Backend
siehe [../frontend/TESTING.md](../frontend/TESTING.md#6-integration-e2e-npm-run-teste2e).

## Troubleshooting

- **DB-Connection schlägt fehl**: `DATABASE_URL` prüfen, Postgres erreichbar? `psql $DATABASE_URL` testet die Verbindung.
- **Migrations hängen**: `npm run migrate:baseline` einmalig gegen bereits initialisierte DB; dann `migrate:up`.
- **CORS-Fehler im Frontend**: `ALLOWED_ORIGINS` muss den Frontend-Origin (inkl. Protokoll + Port) enthalten.
- **Port 3000 belegt**: `PORT=3010 npm run dev`.
