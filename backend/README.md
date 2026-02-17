# Backend – Urban Golf ScoreCard

Welcome to **/backend**! This folder contains the backend API for the ScoreCard app. This README explains the tech stack, setup, workflows, testing, and provides useful links & tips so you can get productive quickly.

---

## TL;DR – Quick Start

```bash
# 1) Clone the project (repo root)
# 2) Switch to the backend folder
cd backend

# 3) Install dependencies
npm i

# 4) Start the development server
npm run dev
# → Default: http://localhost:3000
```

> 💡 Environments: `.env`, `.env.test`, `.env.production` control API behavior (see **Environments & Config**).

---

## Tech Stack

- **Node.js** with **Fastify** as the web framework
- **PostgreSQL** (direct connection via `pg` library)
- **ESM** modules for modern JavaScript syntax

---

## Project Structure (Excerpt)

```
/backend
├─ package.json
├─ app.js               # Main application setup
├─ routes/              # API routes
├─ db/                  # Database connection setup
├─ utils/               # Helper functions
└─ tests/               # Unit tests
```

---

## Environments & Config

Environment variables are loaded via `.env` files. Critical variables include:

```
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/urban_golf
DATABASE_SSL=false
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
BREVO_SMTP_USER=your-brevo-login@email.com
BREVO_SMTP_PASS=your-brevo-smtp-key
ADMIN_EMAIL=admin@urban-golf.ch
NODE_ENV=development
```

Typical files:

- `.env` – global defaults
- `.env.test` – local development
- `.env.production` – production deployment

---

## NPM Scripts

| Script          | Purpose              |
| --------------- | -------------------- |
| `npm run dev`   | Start backend        |
| `npm run start` | Start in production  |
| `npm run test`  | Run tests            |

---

## Development & Workflows

1. **Branching**: Create a feature branch from `main`/`test`.
2. **Local development**: Use `npm run dev` with a `.env.test` file configured.
3. **Routing**: Routes are defined in `/routes` and mounted in `app.js`.
4. **Commits/PRs**: Run tests locally before submitting.

---

## Testing

Unit tests with Vitest. Run: `npm run test`

---

## Recommended Tools

- **ESLint** for linting
- **Prettier** for formatting
- **Vitest** for testing

---

## Useful Links

- Fastify: [https://fastify.dev/](https://fastify.dev/)
- pg: [https://node-postgres.com/](https://node-postgres.com/)
- PostgreSQL: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)

---

## Troubleshooting

- **DB Connection Issues**: Check `DATABASE_URL` in `.env`.
- **Port in Use**: Change `PORT` in `.env`.

---

## License & Contributing

Pull requests are welcome! Please follow the same lint/format/test guidelines as for the frontend.
