# Architecture Overview

## Project Structure

```text
electricity-bill-viewer/
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── common/
│   │   │   ├── apis/               # API client functions (accounts, auth, electricity, telegram, notificationSettings)
│   │   │   ├── constants/          # App-wide constants
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   └── types/              # TypeScript type definitions
│   │   ├── components/
│   │   │   ├── auth/               # GoogleLoginButton, ProtectedRoute, PublicOnlyRoute
│   │   │   ├── layout/             # MainLayout, UserMenu
│   │   │   ├── partials/           # animatedLogo, appLoader, errorBoundary, errorCard, navbar, typography, multiSelect
│   │   │   ├── test/               # Test utilities
│   │   │   └── ui/                 # shadcn/ui components
│   │   ├── context/                # AuthContext, PreferenceContext
│   │   ├── features/
│   │   │   ├── accountBalance/     # Electricity balance display & refresh
│   │   │   ├── accountManagement/  # CRUD UI for DPDC/NESCO accounts
│   │   │   └── home/               # Home page feature
│   │   ├── lib/                    # Axios instance, cache service
│   │   ├── pages/                  # LoginPage, AuthCallbackPage, HomePage, AccountManagementPage, ErrorPage
│   │   ├── providers/              # React context providers
│   │   ├── routes/                 # Route definitions (public, auth, notFound)
│   │   └── styles/                 # Global styles
│   ├── nginx.conf                  # Production Nginx config
│   └── vite.config.ts
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── configs/                # config, constants, cors, database, rateLimiter, redis, winston
│   │   ├── controllers/
│   │   │   ├── BaseController.ts   # Shared response helpers
│   │   │   └── v1/                 # AuthController, AccountController, ElectricityController, TelegramController, NotificationSettingsController
│   │   ├── entities/               # Account, User, TelegramNotificationSettings (TypeORM)
│   │   ├── helpers/                # ApiError, Logger, ResponseBuilder, Winston, fetchHelper
│   │   ├── interfaces/             # Account, Auth, Shared, IZodValidationSchema
│   │   ├── middlewares/            # AuthMiddleware, ValidationMiddleware, LatencyLoggerMiddleware, ApplyGlobalErrorHandler, ApplyGlobalMiddlewares
│   │   ├── repositories/           # AccountRepository, UserRepository, TelegramNotificationSettingsRepository
│   │   ├── routes/v1/             # auth, account, electricity, telegram, notificationSettings routes
│   │   ├── schemas/                # Zod validation schemas (AccountSchemas)
│   │   ├── services/
│   │   │   ├── implementations/    # AccountService, AuthService, DPDCService, NESCOService, ElectricityService, JwtService, RedisCacheService, TelegramService, NotificationSettingsService, SchedulerService
│   │   │   └── interfaces/         # Service interfaces
│   │   └── utility/                # encryption, accountCredentialParser, accountTypeNormalizer, dateFormatter, headers, handleRepositoryCall
│   └── tsconfig.json               # TypeScript config with path aliases
├── docker-compose.yml               # Development compose
├── docker-compose.prod.yml          # Production compose
├── Dockerfile.server                # Multi-stage server build
├── Dockerfile.client                # Multi-stage client build
├── scripts/                         # Utility scripts
└── docs/                            # Documentation
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, Framer Motion, React Hook Form, Zod, Sonner, React Router |
| **Backend** | Node.js 22, Express, TypeScript, TypeORM, Zod, Axios, Cheerio, Winston |
| **Databases** | SQLite (dual: `accounts.db` + `auth.db`) |
| **Caching** | Redis (server-side), localStorage (client-side) |
| **Auth** | Google OAuth 2.0, JWT (jsonwebtoken) |
| **DevOps** | Docker, Docker Compose, Coolify, Nginx |

## Dual Database Architecture

The server uses **two separate SQLite databases** to isolate concerns:

| Database | File | Entities | Purpose |
|----------|------|----------|---------|
| `AppDataSource` | `accounts.db` | `Account`, `TelegramNotificationSettings` | Application data — encrypted provider credentials, notification config |
| `AuthDataSource` | `auth.db` | `User` | Authentication data — Google OAuth user profiles |

Both databases use TypeORM with `synchronize: true` for automatic schema management.

## Backend Architecture Pattern

The server follows the **Controller → Service → Repository** pattern:

```text
Request → Middleware Pipeline → Controller → Service → Repository → Database
                                                    ↘ External APIs (DPDC/NESCO)
                                                    ↘ Redis Cache
                                                    ↘ Telegram Bot API
```

### Middleware Pipeline

1. **Helmet** — Security headers
2. **CORS** — Configured from `ALLOWED_ORIGINS` / `FRONTEND_URL`
3. **Compression** — Response compression
4. **Body Parser** — JSON parsing
5. **Rate Limiter** — Configurable request rate limiting
6. **Latency Logger** — Optional per-request timing (controlled by `ENABLE_LATENCY_LOGGER`)
7. **Auth Middleware** — JWT verification on protected routes
8. **Validation Middleware** — Zod schema validation on specific routes
9. **Global Error Handler** — Centralized error handling

### Route Organization

Routes are split into **public** and **protected** groups:

| Group | Prefix | Auth Required | Routes |
|-------|--------|:---:|--------|
| Auth | `/api/v1/auth` | ❌ (mostly) | Google OAuth flow, `/me` requires auth |
| Electricity | `/api/v1/electricity` | ✅ | Usage data |
| Accounts | `/api/v1/accounts` | ✅ | Full CRUD + nicknames |
| Telegram | `/api/v1/telegram` | ✅ | Send balances |
| Notification Settings | `/api/v1/notification-settings` | ✅ | Telegram notification config |

## Frontend Architecture

- **State Management**: AuthContext (React Context) for auth, TanStack Query for server state
- **Routing**: React Router with `ProtectedRoute` and `PublicOnlyRoute` wrappers
- **API Layer**: Centralized Axios instance with JWT interceptor and 401 auto-redirect
- **Features**: Modular feature directories with co-located components, hooks, constants, and utilities

See the main README for quick start and `docs/` for details on each topic.
