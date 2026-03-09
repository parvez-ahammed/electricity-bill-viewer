# Bill Barta - Electricity Bill Viewer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org/)

Bill Barta is a full-stack web application to view electricity bill balances for DPDC and NESCO accounts in Bangladesh, with support for automated Telegram notifications and database-driven account management.

## Key Features

- **Secure Account Management**: Database-driven with AES-256 encryption for credential storage
- **Modern Web Interface**: React 19 + Vite + Tailwind CSS 4 + shadcn/ui
- **Multi-Provider Support**: DPDC and NESCO accounts in a unified dashboard
- **Telegram Integration**: Automated daily reports at 12:00 PM BST + manual trigger
- **Smart Caching**: Redis server-side (24h TTL) + localStorage client-side
- **Real-time Refresh**: Manual refresh with cache bypass capability
- **Data Protection**: Encrypted credentials with corruption recovery
- **Google OAuth 2.0**: Secure authentication with JWT session management

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (React 19)                       │
│   Vite + TypeScript + Tailwind CSS 4 + shadcn/ui + TanStack     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS/JWT
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server (Express.js)                        │
│   Controller → Service → Repository → SQLite (TypeORM)          │
│                     ↓              ↓                            │
│                  Redis          External APIs (DPDC/NESCO)      │
│                  Cache          Telegram Bot API                │
└─────────────────────────────────────────────────────────────────┘
```

**Pattern**: Controller → Service → Repository (Layered Architecture)

**Dual Databases**:

- `accounts.db` — Account credentials, Telegram notification settings
- `auth.db` — User profiles (Google OAuth)

## Tech Stack

| Layer        | Technologies                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------- |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, React Router, Framer Motion |
| **Backend**  | Node.js 22, Express.js, TypeScript, TypeORM, Zod, Winston                                          |
| **Database** | SQLite (dual: `accounts.db` + `auth.db`)                                                           |
| **Caching**  | Redis (server), localStorage (client)                                                              |
| **Auth**     | Google OAuth 2.0, JWT (jsonwebtoken), AES-256 encryption                                           |
| **DevOps**   | Docker, Docker Compose, Nginx, Coolify-ready                                                       |

## Quick Start

### Prerequisites

- Node.js 22+ or Docker
- Google Cloud Console project with OAuth 2.0 credentials
- (Optional) Redis for caching
- (Optional) Telegram Bot for notifications

### 1. Environment Setup

```bash
# Clone the repository
git clone https://github.com/parvez-ahammed/electricity-bill-viewer.git
cd electricity-bill-viewer

# Copy environment files
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 2. Configure Encryption (Required)

```bash
# Generate secure encryption key
openssl rand -base64 32

# Add to .env and server/.env
ENCRYPTION_KEY=your_generated_key_here
```

### 3. Configure Google OAuth

1. Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Add `http://localhost:3000/api/v1/auth/google/callback` to authorized redirect URIs
3. Update `server/.env` with your credentials

### 4. Start with Docker

```bash
docker compose up -d --build
```

### 5. Access the Application

| Service            | URL                            |
| ------------------ | ------------------------------ |
| Client             | http://localhost:5173          |
| Server API         | http://localhost:3000/api/v1   |
| Account Management | http://localhost:5173/accounts |

### 6. Add Your Accounts

1. Sign in with Google
2. Navigate to Account Management (`/accounts`)
3. Add DPDC accounts (username, password, client secret)
4. Add NESCO accounts (customer number only)

See [docs/DPDC_SETUP.md](./docs/DPDC_SETUP.md) for finding your DPDC client secret.

## Documentation

### Core Documentation

| Document                                             | Description                        |
| ---------------------------------------------------- | ---------------------------------- |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)       | System design, patterns, data flow |
| [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)     | Complete API documentation         |
| [docs/INSTALLATION.md](./docs/INSTALLATION.md)       | Setup and installation guide       |
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)         | Development workflow and standards |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)           | Production deployment guide        |
| [docs/SECURITY.md](./docs/SECURITY.md)               | Security practices and policies    |
| [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | Common issues and solutions        |

### Feature Documentation

| Document                                                       | Description             |
| -------------------------------------------------------------- | ----------------------- |
| [docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md)             | Google OAuth + JWT flow |
| [docs/ACCOUNT_MANAGEMENT.md](./docs/ACCOUNT_MANAGEMENT.md)     | Account CRUD operations |
| [docs/TELEGRAM_INTEGRATION.md](./docs/TELEGRAM_INTEGRATION.md) | Telegram bot setup      |
| [docs/CACHING.md](./docs/CACHING.md)                           | Caching strategies      |
| [docs/CONFIGURATION.md](./docs/CONFIGURATION.md)               | Environment variables   |

### AI Agent Documentation

| Document                                         | Description                 |
| ------------------------------------------------ | --------------------------- |
| [ai/ENTRYPOINT.md](./ai/ENTRYPOINT.md)           | AI agent starting point     |
| [ai/PROJECT_CONTEXT.md](./ai/PROJECT_CONTEXT.md) | Project context for AI      |
| [ai/RULES.md](./ai/RULES.md)                     | Development constraints     |
| [ai/AGENTS.md](./ai/AGENTS.md)                   | AI agent guidelines         |
| [ai/TASK_TEMPLATES.md](./ai/TASK_TEMPLATES.md)   | Reusable AI task templates  |
| [ai/PROMPTS.md](./ai/PROMPTS.md)                 | AI prompts for common tasks |

## Project Structure

```
electricity-bill-viewer/
├── client/                     # React frontend
│   ├── src/
│   │   ├── common/             # Shared APIs, hooks, constants
│   │   ├── components/         # UI components (auth, layout, partials, ui)
│   │   ├── context/            # React contexts (Auth, Preferences)
│   │   ├── features/           # Feature modules (accountBalance, accountManagement)
│   │   ├── lib/                # Axios instance, cache utilities
│   │   ├── pages/              # Page components
│   │   ├── providers/          # Context providers
│   │   └── routes/             # Route definitions
│   └── nginx.conf              # Production Nginx config
├── server/                     # Express backend
│   ├── src/
│   │   ├── configs/            # Configuration (env, cors, database, redis)
│   │   ├── controllers/        # Route handlers
│   │   ├── entities/           # TypeORM entities
│   │   ├── middlewares/        # Express middlewares
│   │   ├── repositories/       # Data access layer
│   │   ├── routes/             # Route definitions
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Business logic
│   │   └── utility/            # Helper functions
│   └── data/                   # SQLite database files
├── docs/                       # Documentation
├── ai/                         # AI agent context files
├── scripts/                    # Utility scripts
├── docker-compose.yml          # Development setup
└── docker-compose.prod.yml     # Production setup
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Read** [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for coding standards
4. **Commit** your changes (`git commit -m 'Add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

### Development Standards

- Follow the existing code style (ESLint + Prettier enforced)
- Write meaningful commit messages
- Keep controllers thin, business logic in services
- Use Zod for all input validation
- Add proper error handling
- Update documentation for new features

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [TanStack Query](https://tanstack.com/query) for data fetching
- [TypeORM](https://typeorm.io/) for database management
