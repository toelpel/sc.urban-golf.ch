# 🏌️‍♀️ Urban-Golf.ch ScoreCard App

A sleek and responsive web app to track scores during Urban Golf tournaments. Built with Vue 3, Fastify, and PostgreSQL (via Supabase), it’s designed for intuitive use on mobile and desktop alike – and even supports dark mode and localization!

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
- **@fastify/cors** – Cross-Origin Resource Sharing (CORS) support for Fastify
- **dotenv** – Environment variable management from `.env` files
- **pg** – Native PostgreSQL client for Node.js
- **Modular Route Structure** – Organized via separate route files for `games`, `scores`, `players`, and `feedback`
- **PostgreSQL** – Managed via **Supabase**

### 🔄 Tooling
- **PostCSS** – Extended CSS processing pipeline
- **Autoprefixer** – Adds vendor prefixes to CSS
- **GitHub Actions** – For CI workflows in `.github/workflows`

### 🚀 Deployment
- **Render.com** – Hosting for the Fastify backend and optionally the frontend
- **Supabase** – Database + potential API backend (currently used for PostgreSQL hosting)

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