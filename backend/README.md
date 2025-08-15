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
- **PostgreSQL** hosted on **Supabase**
- **Supabase JS SDK** for database access
- **NanoID** for unique ID generation
- **ESM** modules for modern JavaScript syntax

---

## Project Structure (Excerpt)

```
/backend
├─ package.json
├─ src/
│  ├─ server.js          # Main server bootstrap
│  ├─ routes/            # API routes
│  ├─ controllers/       # Business logic per route
│  ├─ services/          # DB/service integration
│  ├─ utils/             # Helper functions
│  ├─ config/            # Environment config loader
│  └─ db/                # Database connection setup
└─ tests/                # Unit/E2E tests
```

---

## Environments & Config

Environment variables are loaded via `.env` files. Critical variables include:

```
PORT=3000
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_SERVICE_KEY=...service-key...
NODE_ENV=development
```

Typical files:

- `.env` – global defaults
- `.env.test` – local development
- `.env.production` – production deployment

---

## NPM Scripts

| Script              | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Start backend in development mode with hot reload. |
| `npm run start`     | Start backend in production mode.                  |
| `npm run lint`      | Run ESLint linter.                                 |
| `npm run format`    | Run Prettier formatter.                            |
| `npm run test`      | Run all tests.                                     |
| `npm run test:unit` | Run unit tests only.                               |
| `npm run test:e2e`  | Run end-to-end tests.                              |

---

## Development & Workflows

1. **Branching**: Create a feature branch from `main`/`test`.
2. **Local development**: Use `npm run dev` with a `.env.test` file configured.
3. **Routing**: Routes are defined in `/routes` and mounted in `server.js`.
4. **Controllers**: Implement API logic in `/controllers`.
5. **Services**: Access DB and third-party services in `/services`.
6. **Validation**: Validate requests with Joi or similar.
7. **Commits/PRs**: Run lint & tests locally before submitting.

---

## Testing

### 1) Unit Tests

- Test individual services, utils, and controllers.
- Run: `npm run test:unit`

### 2) E2E Tests

- Simulate real API requests against a test DB.
- Run: `npm run test:e2e`

### 3) Test Builds & Staging

- Use `.env.test` with staging DB credentials.
- Deploy to staging environment, verify API endpoints.

---

## Recommended Tools

- **ESLint** for linting
- **Prettier** for formatting
- **Jest** or **Vitest** for testing
- **Supertest** for API endpoint tests

---

## Useful Links

- Fastify: [https://fastify.dev/](https://fastify.dev/)
- Supabase JS: [https://supabase.com/docs/reference/javascript](https://supabase.com/docs/reference/javascript)
- PostgreSQL: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- NanoID: [https://github.com/ai/nanoid](https://github.com/ai/nanoid)
- Joi: [https://joi.dev/api/](https://joi.dev/api/)

---

## Troubleshooting

- **DB Connection Issues**: Check Supabase credentials in `.env`.
- **Port in Use**: Change `PORT` in `.env`.
- **Hot Reload Not Working**: Ensure `nodemon` is installed and used for `npm run dev`.

---

## License & Contributing

Pull requests are welcome! Please follow the same lint/format/test guidelines as for the frontend.