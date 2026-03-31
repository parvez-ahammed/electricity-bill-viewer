<div align="center">

# ⚡ Bill Barta

**Electricity Bill Viewer for Bangladesh**

View your DPDC and NESCO electricity bill balances in one dashboard — with automated Telegram reports, encrypted credential storage, and smart caching.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](./docker-compose.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](./CONTRIBUTING.md)

</div>

---

## ✨ Features

- 🔐 **Secure Account Management** — AES-256 encrypted credential storage with corruption recovery
- 🌐 **Multi-Provider Dashboard** — DPDC and NESCO accounts in a unified, responsive interface
- 📱 **Telegram Integration** — Automated daily balance reports at 12:00 PM BST + manual trigger
- ⚡ **Smart Caching** — Redis server-side (24h TTL) + localStorage client-side with cache bypass
- 🔑 **Google OAuth 2.0** — Secure sign-in with JWT session management
- 🎨 **Modern UI** — React 19 + Tailwind CSS 4 + shadcn/ui + Framer Motion animations
- 🐳 **Docker Ready** — One-command setup for development and production
- 📊 **Real-time Refresh** — Manual refresh with cache bypass capability

---

## 🚀 Tech Stack

| Layer | Technologies |
|------------|-----------------------------------------------------------------------------------------------------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, React Router, Framer Motion |
| **Backend** | Node.js 22, Express.js, TypeScript, TypeORM, Zod, Winston |
| **Database** | SQLite (dual: `accounts.db` + `auth.db`) |
| **Caching** | Redis (server), localStorage (client) |
| **Auth** | Google OAuth 2.0, JWT (jsonwebtoken), AES-256 encryption |
| **DevOps** | Docker, Docker Compose, Nginx, Coolify-ready |

---

## 🏗️ Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                      Client (React 19)                        │
│    Vite + TypeScript + Tailwind CSS 4 + shadcn/ui + TanStack  │
└────────────────────────────┬──────────────────────────────────┘
                             │ HTTPS / JWT
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                    Server (Express.js)                         │
│    Controller → Service → Repository → SQLite (TypeORM)       │
│                    ↓              ↓                            │
│                 Redis          External APIs (DPDC / NESCO)    │
│                 Cache          Telegram Bot API                │
└───────────────────────────────────────────────────────────────┘
```

**Pattern:** Controller → Service → Repository (Layered Architecture)

**Dual Databases:**
- `accounts.db` — Account credentials, Telegram notification settings
- `auth.db` — User profiles (Google OAuth)

---

## ⚡ Quick Start

### Prerequisites

- **Node.js 22+** or **Docker**
- Google Cloud Console project with OAuth 2.0 credentials
- *(Optional)* Redis for server-side caching
- *(Optional)* Telegram Bot for automated notifications

### 1. Clone & Configure

```bash
# Clone the repository
git clone https://github.com/parvez-ahammed/electricity-bill-viewer.git
cd electricity-bill-viewer

# Copy environment files
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 2. Generate Encryption Key (Required)

```bash
# Generate a secure 256-bit key
openssl rand -base64 32

# Paste the result into both .env and server/.env:
# ENCRYPTION_KEY=your_generated_key_here
```

### 3. Configure Google OAuth

1. Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Add `http://localhost:3000/api/v1/auth/google/callback` to authorized redirect URIs
3. Update `server/.env` with your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
4. Update `client/.env` with your `VITE_GOOGLE_CLIENT_ID`

### 4. Start the Application

#### Option A: Docker (Recommended)

```bash
docker compose up -d --build
```

#### Option B: Manual

```bash
# Install dependencies
cd server && npm install && cd ../client && npm install && cd ..

# Start backend (in one terminal)
cd server && npm run start:dev

# Start frontend (in another terminal)
cd client && npm run dev
```

### 5. Access the Application

| Service | URL |
|-------------------|---------------------------------|
| 🌐 Client | http://localhost:5173 |
| 🔌 Server API | http://localhost:3000/api/v1 |
| 👤 Account Mgmt | http://localhost:5173/accounts |

### 6. Add Your Accounts

1. Sign in with Google
2. Navigate to **Account Management** (`/accounts`)
3. Add **DPDC** accounts (username, password, client secret)
4. Add **NESCO** accounts (customer number only)

> 📖 See [docs/DPDC_SETUP.md](./docs/DPDC_SETUP.md) for finding your DPDC client secret.

---

## 📦 Project Structure

```
electricity-bill-viewer/
├── client/                     # React frontend
│   ├── src/
│   │   ├── common/             # Shared APIs, hooks, constants
│   │   ├── components/         # UI components (auth, layout, ui)
│   │   ├── context/            # React contexts (Auth, Preferences)
│   │   ├── features/           # Feature modules (accountBalance, accountManagement)
│   │   ├── lib/                # Axios instance, cache utilities
│   │   ├── pages/              # Page components
│   │   ├── providers/          # Context providers
│   │   └── routes/             # Route definitions
│   └── nginx.conf              # Production Nginx config
├── server/                     # Express backend
│   ├── src/
│   │   ├── configs/            # Configuration (env, CORS, database, Redis)
│   │   ├── controllers/        # Route handlers (thin controllers)
│   │   ├── entities/           # TypeORM entities
│   │   ├── middlewares/        # Express middlewares (auth, validation, error)
│   │   ├── repositories/       # Data access layer
│   │   ├── routes/             # Route definitions
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Business logic layer
│   │   └── utility/            # Helper functions
│   └── data/                   # SQLite database files
├── docs/                       # Documentation
├── ai/                         # AI agent context files
├── scripts/                    # Utility scripts (DPDC/NESCO testing)
├── docker-compose.yml          # Development setup
└── docker-compose.prod.yml     # Production setup
```

---

## ⚙️ Configuration

### Environment Variables

The project uses three `.env` files:

| File | Purpose |
|-------------------|----------------------------------------------|
| `.env` | Docker Compose, Redis, production config |
| `server/.env` | Backend: OAuth, JWT, Telegram, encryption |
| `client/.env` | Frontend: API URL, Google Client ID |

> 📖 See [docs/CONFIGURATION.md](./docs/CONFIGURATION.md) for the complete variable reference.

### Telegram Setup (Optional)

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Get your chat ID from [@userinfobot](https://t.me/userinfobot)
3. Configure in-app via **Account Management → Notification Settings**

> 📖 See [docs/TELEGRAM_INTEGRATION.md](./docs/TELEGRAM_INTEGRATION.md) for detailed setup.

---

## 📚 Documentation

### Core Docs

| Document | Description |
|------------------------------------------------------|-------------------------------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, patterns, data flow |
| [API_REFERENCE.md](./docs/API_REFERENCE.md) | Complete API documentation |
| [INSTALLATION.md](./docs/INSTALLATION.md) | Setup and installation guide |
| [DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Development workflow and standards |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Production deployment guide |
| [SECURITY.md](./docs/SECURITY.md) | Security practices and policies |
| [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | Common issues and solutions |

### Feature Docs

| Document | Description |
|--------------------------------------------------------------|------------------------------|
| [AUTHENTICATION.md](./docs/AUTHENTICATION.md) | Google OAuth + JWT flow |
| [ACCOUNT_MANAGEMENT.md](./docs/ACCOUNT_MANAGEMENT.md) | Account CRUD operations |
| [TELEGRAM_INTEGRATION.md](./docs/TELEGRAM_INTEGRATION.md) | Telegram bot setup |
| [CACHING.md](./docs/CACHING.md) | Caching strategies |
| [CONFIGURATION.md](./docs/CONFIGURATION.md) | Environment variables |

### AI Agent Docs

| Document | Description |
|---------------------------------------------------|-------------------------------|
| [ai/ENTRYPOINT.md](./ai/ENTRYPOINT.md) | AI agent starting point |
| [ai/PROJECT_CONTEXT.md](./ai/PROJECT_CONTEXT.md) | Project context for AI agents |
| [ai/RULES.md](./ai/RULES.md) | Development constraints |
| [ai/AGENTS.md](./ai/AGENTS.md) | AI agent guidelines |
| [ai/TASK_TEMPLATES.md](./ai/TASK_TEMPLATES.md) | Reusable task templates |
| [ai/PROMPTS.md](./ai/PROMPTS.md) | AI prompts for common tasks |

---

## ▶️ Usage

### API Examples

**Fetch Electricity Balances:**
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/v1/electricity/usage
```

**Add a DPDC Account:**
```bash
curl -X POST -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"provider":"DPDC","credentials":{"username":"..","password":"..","clientSecret":".."}}' \
     http://localhost:3000/api/v1/accounts
```

**Force Refresh (bypass cache):**
```bash
curl -H "Authorization: Bearer <token>" \
     -H "x-skip-cache: true" \
     http://localhost:3000/api/v1/electricity/usage
```

> 📖 See [docs/API_REFERENCE.md](./docs/API_REFERENCE.md) for the complete API documentation.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

**Quick summary:**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Read** [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for coding standards
4. **Commit** your changes (`git commit -m 'Add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

### Development Standards

- Follow `Controller → Service → Repository` pattern (backend)
- Use **Zod** for all input validation
- Use **TanStack Query** for server state (frontend)
- ESLint + Prettier enforced — run `npm run lint`
- Write meaningful, imperative commit messages

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## ⭐ Support

If you find this project useful:

- ⭐ **Star** this repository
- 🐛 [Report bugs](https://github.com/parvez-ahammed/electricity-bill-viewer/issues/new?template=bug_report.md)
- 💡 [Request features](https://github.com/parvez-ahammed/electricity-bill-viewer/issues/new?template=feature_request.md)
- 🤝 [Contribute](./CONTRIBUTING.md)

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) — Component library
- [TanStack Query](https://tanstack.com/query) — Data fetching
- [TypeORM](https://typeorm.io/) — Database management
- [Framer Motion](https://www.framer.com/motion/) — Animations

---

<div align="center">
  <sub>Built with ❤️ for the Bangladesh electricity consumer community</sub>
</div>
