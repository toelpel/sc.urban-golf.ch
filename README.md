# 🏌️‍♀️ Urban Golf ScoreCard App

A sleek and responsive web app to track scores during Urban Golf tournaments. Built with Vue 3, Fastify, and PostgreSQL, fully containerized with Docker for easy self-hosting. Designed for intuitive use on mobile and desktop alike – with dark mode and multi-language support!

---

## 🧰 Tech Stack

### 🖼️ Frontend
- **Vue.js 3** – Modern reactive UI framework using the Composition API
- **vue-router** – Client-side routing and navigation
- **vue-i18n** – Localization support (DE/EN ready)
- **TailwindCSS** – Utility-first styling with dark mode built-in
- **Vite** – Lightning-fast dev server and bundler
- **Axios** – For HTTP communication with the backend

### 🔧 Backend
- **Fastify** – High-performance HTTP server for Node.js
- **@fastify/cors** – Cross-Origin Resource Sharing (CORS) support
- **@fastify/helmet** – Security headers middleware
- **@fastify/rate-limit** – Rate limiting for API protection
- **dotenv** – Environment variable management from `.env` files
- **pg** – Native PostgreSQL client for Node.js
- **Modular Route Structure** – Organized via separate route files for `games`, `scores`, `players`, and `feedback`
- **PostgreSQL 16** – Self-hosted in Docker container

### 🔄 Tooling
- **PostCSS** – Extended CSS processing pipeline
- **Autoprefixer** – Adds vendor prefixes to CSS
- **GitHub Actions** – For CI workflows in `.github/workflows`

### 🚀 Deployment
- **Docker** – Fully containerized application with multi-stage builds
- **Docker Compose** – Orchestration for local development and production
- **Nginx** – Lightweight web server for frontend static files
- **PostgreSQL 16 Alpine** – Containerized database with automatic initialization
- **Traefik-ready** – Production deployment with reverse proxy labels included

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development without Docker)

### Run with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sc.urban-golf.ch.git
   cd sc.urban-golf.ch
   ```

2. **Start development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000
   - pgAdmin: http://localhost:5050 (admin@urbangolf.local / admin)

**For production deployment:**
```bash
docker-compose up -d
```

For detailed deployment instructions and advanced setups (Traefik, etc.), see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 🌐 Internationalization (i18n)

Multi-language support is fully integrated using **vue-i18n**. Language files reside in `/src/locales/`, and switching is available via a toggle button.

### Implemented languages:
- 🇩🇪 German
- 🇬🇧 English
- 🇫🇷 French
- 🇳🇱 Netherlands

---

## ✨ Features

### 🧑‍💼 User Features
- Create new games with up to 10 players
- Hole-by-hole live scoring with +/– buttons
- Mobile-optimized single-hole view
- Smart Scorecard view with:
  - Horizontal/vertical view
  - Fixed player/average/total columns
  - Clickable hole headers
  - Sorted columns (name, average, total)
- List of past games with:
  - Search (after 3 characters) by game or player name
  - LoadMore function
  - Expandable game meta info (holes played, player scores)
- Persistent dark mode (based on system settings or manual toggle)

---

## 🧪 Planned Features

- Login & player profiles (OAuth / Magic Link)
- Extended statistics dashboard
- Admin panel for club management and tournaments

---

## 🤝 Contributing

We love contributions!

- Fork & PR with meaningful commit messages
- Follow code and styling conventions (global.css)
- Add tests if applicable
- Use English for code and comments

---

## 🧾 License

MIT – free to use, modify, and share with attribution.

---

## 📬 Contact

Feel free to open an issue or contact the creator via GitHub.