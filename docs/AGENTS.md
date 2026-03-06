# Bill Barta — Agent Reference

Unified reference for AI agents working on the Bill Barta codebase. For per-project details, see `server/AGENTS.md` and `client/AGENTS.md`.

## Project Overview

**Bill Barta** is a full-stack web application for viewing electricity bill balances for DPDC and NESCO accounts in Bangladesh, with Google OAuth authentication, Telegram notifications, and encrypted credential storage.

## Architecture Summary

```
client/ (React 19 + Vite + Tailwind CSS 4 + shadcn/ui)
server/ (Node.js + Express + TypeScript + TypeORM)
```

**Pattern:** Controller → Service → Repository → Database (SQLite)

**Dual databases:**
- `accounts.db` → `Account`, `TelegramNotificationSettings` entities
- `auth.db` → `User` entity

**All API routes** are under `/api/v1`. Auth routes are public; everything else is protected by JWT middleware.

## Feature Domains

| Domain | Server Files | Client Files |
|--------|-------------|--------------|
| **Auth** (Google OAuth + JWT) | `AuthController`, `AuthService`, `JwtService`, `AuthMiddleware`, `UserRepository`, `User` entity | `AuthContext`, `GoogleLoginButton`, `ProtectedRoute`, `PublicOnlyRoute`, `AuthCallbackPage`, `LoginPage`, `auth.api.ts` |
| **Accounts** (CRUD + encryption) | `AccountController`, `AccountService`, `AccountRepository`, `Account` entity, `AccountSchemas` | `accountManagement` feature, `accounts.api.ts` |
| **Electricity** (balance fetching) | `ElectricityController`, `ElectricityService`, `DPDCService`, `NESCOService` | `accountBalance` feature, `electricity.api.ts` |
| **Telegram** (sending reports) | `TelegramController`, `TelegramService`, `SchedulerService` | `telegram.api.ts` |
| **Notification Settings** (DB-driven chatId) | `NotificationSettingsController`, `NotificationSettingsService`, `TelegramNotificationSettingsRepository`, `TelegramNotificationSettings` entity | `notificationSettings.api.ts` |
| **Caching** | `RedisCacheService`, `redis.ts` config | `lib/cache.ts` |

## Server Directory Map

```
server/src/
├── configs/         → config.ts, constants.ts, cors.ts, database.ts, rateLimitter.ts, redis.ts, winston.ts
├── controllers/     → BaseController.ts, v1/{Auth,Account,Electricity,Telegram,NotificationSettings}Controller.ts
├── entities/        → Account.ts, User.ts, TelegramNotificationSettings.ts
├── helpers/         → ApiError.ts, Logger.ts, ResponseBuilder.ts, Winston.ts, fetchHelper.ts
├── interfaces/      → Account.ts, Auth.ts, Shared.ts, IZodValidationSchema.ts
├── middlewares/     → AuthMiddleware.ts, ValidationMiddleware.ts, LatencyLoggerMiddleware.ts, ApplyGlobal{ErrorHandler,Middlewares}.ts
├── repositories/    → AccountRepository.ts, UserRepository.ts, TelegramNotificationSettingsRepository.ts, interfaces/
├── routes/v1/       → auth, account, electricity, telegram, notificationSettings routes + index.ts
├── schemas/         → AccountSchemas.ts (Zod)
├── services/        → implementations/{Account,Auth,DPDC,NESCO,Electricity,Jwt,RedisCache,Telegram,NotificationSettings,Scheduler}Service.ts, interfaces/
├── utility/         → encryption.ts, accountCredentialParser.ts, accountTypeNormalizer.ts, dateFormatter.ts, headers.ts, handleRepositoryCall.ts
├── app.ts           → Express app setup
└── index.ts         → Server entry point
```

## Client Directory Map

```
client/src/
├── common/          → apis/ (5 API clients), constants/, hooks/, types/
├── components/      → auth/ (GoogleLoginButton, ProtectedRoute, PublicOnlyRoute), layout/ (MainLayout, UserMenu), partials/ (navbar, errorBoundary, etc.), ui/ (shadcn)
├── context/         → AuthContext.tsx, PreferenceContext.tsx
├── features/        → accountBalance/ (balance display + refresh), accountManagement/ (CRUD UI), home/
├── lib/             → axios.ts (interceptors), cache.ts (localStorage)
├── pages/           → LoginPage, AuthCallbackPage, HomePage, AccountManagementPage, ErrorPage
├── providers/       → React context providers
├── routes/          → public.route.tsx, auth.route.tsx, notFound.route.tsx, routes.tsx, paths/
└── styles/          → Global styles
```

## API Routes Quick Reference

| Prefix | Auth | Key Endpoints |
|--------|:----:|--------------|
| `/api/v1/auth` | ❌ | `GET /google`, `GET /google/callback`, `GET /me` 🔒, `POST /logout` |
| `/api/v1/electricity` | ✅ | `GET /usage` |
| `/api/v1/accounts` | ✅ | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `DELETE /:id/force`, `GET /provider/:provider`, nickname routes |
| `/api/v1/telegram` | ✅ | `GET /send-balances` |
| `/api/v1/notification-settings` | ✅ | `GET /telegram`, `POST/PUT/PATCH /telegram`, `DELETE /telegram` |

## Key Patterns & Conventions

1. **Controller → Service → Repository**: Controllers are thin; business logic in services; data access in repositories.
2. **Zod validation**: Request validation via `ValidationMiddleware` using schemas in `schemas/`.
3. **Encryption**: Credentials encrypted/decrypted in `utility/encryption.ts` using `ENCRYPTION_KEY`.
4. **Path aliases**: Server uses `@routes/`, `@configs/`, `@controllers/`, `@services/`, `@repositories/`, `@middlewares/`, `@interfaces/`, `@helpers/`, `@utility/`, `@entities/` (configured in `tsconfig.json`).
5. **Client path alias**: `@/` maps to `src/`.
6. **Standard response**: `{ status, data, message }` via `BaseController` methods (`ok`, `fail`, `unauthorized`, `notFound`, `serverError`, `clientError`).
7. **Error handling**: Centralized in `ApplyGlobalErrorHandler.ts`.
8. **Logging**: Winston with optional Loki integration.

## Database Schemas

### Account (accounts.db)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| userId | string | Owner's Google ID |
| provider | `DPDC` \| `NESCO` | Electricity provider |
| credentials | JSON | Encrypted sensitive fields |
| createdAt | Date | Auto |
| updatedAt | Date | Auto |

### User (auth.db)
| Column | Type | Notes |
|--------|------|-------|
| id | string | Google ID (primary key) |
| name | string | Display name |
| email | string | Unique |
| createdAt | Date | Auto |

### TelegramNotificationSettings (accounts.db)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| chatId | string \| null | Telegram chat ID |
| userId | string | Owner's Google ID |
| isActive | boolean | Default: true |
| createdAt | Date | Auto |
| updatedAt | Date | Auto |

## Environment Variables

Three `.env` files: root (Docker Compose), `server/.env` (backend), `client/.env` (frontend). See [CONFIGURATION.md](./CONFIGURATION.md) for the complete reference.

**Critical vars:** `ENCRYPTION_KEY`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `TELEGRAM_BOT_TOKEN`.

## Dev Commands

```bash
# Server
cd server && npm run start:dev    # Dev with hot reload
cd server && npm run build        # Compile TypeScript

# Client
cd client && npm run dev          # Vite dev server
cd client && npm run build        # Production build

# Docker
docker compose up -d              # Development
docker compose -f docker-compose.prod.yml up -d  # Production
```

## Common Operations

### Adding a new API endpoint
1. Create/update controller method in `controllers/v1/`
2. Create/update service method in `services/implementations/`
3. Create/update repository method in `repositories/` (if DB access needed)
4. Register route in `routes/v1/` (add to protected or public group in `routes/v1/index.ts`)
5. Add Zod validation schema if needed in `schemas/`
6. Add client API function in `client/src/common/apis/`

### Adding a new entity
1. Create entity in `entities/`
2. Register in the appropriate DataSource in `configs/database.ts`
3. Create repository in `repositories/`
4. Create service in `services/implementations/`
