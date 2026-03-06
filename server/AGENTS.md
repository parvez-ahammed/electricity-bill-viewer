# Backend Agent Documentation

## Project Overview
Node.js + TypeScript backend API server for Bill Barta. Provides Google OAuth authentication, encrypted account management for DPDC/NESCO electricity providers, balance fetching, Telegram notifications, and Redis caching.

## Tech Stack
- Node.js 22, TypeScript, Express.js
- TypeORM + SQLite (dual databases: `accounts.db`, `auth.db`)
- Google OAuth 2.0 + JWT (jsonwebtoken)
- Redis for caching
- Zod for validation
- Winston + winston-loki for logging
- node-cron for scheduled tasks
- Cheerio + Axios for web scraping (NESCO)
- crypto-js for AES encryption

## Project Structure
```
server/src/
├── app.ts                          # Express app creation
├── index.ts                        # Server entry point (DB init, scheduler, listen)
├── configs/
│   ├── config.ts                   # Zod-validated env config (appConfig export)
│   ├── constants.ts                # App-wide constants
│   ├── cors.ts                     # CORS configuration
│   ├── database.ts                 # Dual DataSource setup (AppDataSource + AuthDataSource)
│   ├── rateLimitter.ts             # Express rate limiter config
│   ├── redis.ts                    # Redis client setup
│   └── winston.ts                  # Winston logger config
├── controllers/
│   ├── BaseController.ts           # ok, fail, unauthorized, notFound, serverError, clientError, handleRequest, validateUser
│   └── v1/
│       ├── AuthController.ts       # googleLogin, googleCallback, getCurrentUser, logout
│       ├── AccountController.ts    # CRUD + forceDelete + nickname management
│       ├── ElectricityController.ts # getUsageData
│       ├── TelegramController.ts   # sendBalances
│       └── NotificationSettingsController.ts # getSettings, updateSettings, deleteSettings
├── entities/
│   ├── Account.ts                  # id, userId, provider, credentials (JSON), timestamps
│   ├── User.ts                     # id (Google ID), name, email, createdAt
│   └── TelegramNotificationSettings.ts # id, chatId, userId, isActive, timestamps
├── helpers/
│   ├── ApiError.ts                 # Custom error class
│   ├── Logger.ts                   # Logger singleton
│   ├── ResponseBuilder.ts         # Standard response builder
│   ├── Winston.ts                  # Winston transport setup
│   └── fetchHelper.ts             # HTTP fetch utility
├── interfaces/
│   ├── Account.ts                  # ProviderCredentials types
│   ├── Auth.ts                     # AuthenticatedRequest, JwtPayload
│   ├── Shared.ts                   # ElectricityProvider enum, shared types
│   └── IZodValidationSchema.ts     # Validation schema interface
├── middlewares/
│   ├── AuthMiddleware.ts           # JWT verification, attaches user to req
│   ├── ValidationMiddleware.ts     # Zod schema validation (body, params, query)
│   ├── LatencyLoggerMiddleware.ts  # Optional per-request timing
│   ├── ApplyGlobalMiddlewares.ts   # Helmet, CORS, compression, body parser, rate limiter
│   └── ApplyGlobalErrorHandler.ts  # Centralized error handler
├── repositories/
│   ├── AccountRepository.ts        # CRUD + findByProvider + findByUserId + encryption/decryption
│   ├── UserRepository.ts           # findByGoogleId, findByEmail, findById, create
│   ├── TelegramNotificationSettingsRepository.ts # find, upsert, delete by userId
│   └── interfaces/                 # Repository interfaces
├── routes/v1/
│   ├── index.ts                    # Route registration (public vs protected groups)
│   ├── auth.routes.ts              # /google, /google/callback, /me, /logout
│   ├── account.routes.ts           # CRUD + /force + /provider/:provider + nickname routes
│   ├── electricity.routes.ts       # /usage
│   ├── telegram.routes.ts          # /send-balances
│   └── notificationSettings.route.ts # /telegram GET/POST/PUT/PATCH/DELETE
├── schemas/
│   └── AccountSchemas.ts           # Create/Update account + params Zod schemas
├── services/
│   ├── implementations/
│   │   ├── AuthService.ts          # getAuthUrl, handleGoogleCallback, findOrCreateUser, generateJWT, verifyToken
│   │   ├── JwtService.ts           # sign, verify, decode
│   │   ├── AccountService.ts       # Account CRUD business logic
│   │   ├── ElectricityService.ts   # Orchestrates DPDC + NESCO fetching for all accounts
│   │   ├── DPDCService.ts          # DPDC API integration (bearer token → login → fetch data)
│   │   ├── NESCOService.ts         # NESCO web scraping (Cheerio-based)
│   │   ├── RedisCacheService.ts    # Redis get/set/delete with TTL, graceful fallback
│   │   ├── TelegramService.ts      # Telegram Bot API integration, message formatting
│   │   ├── NotificationSettingsService.ts # Telegram settings CRUD
│   │   └── SchedulerService.ts     # node-cron daily balance notification at 12 PM BST
│   └── interfaces/                 # Service interfaces
└── utility/
    ├── encryption.ts               # AES encrypt/decrypt using ENCRYPTION_KEY
    ├── accountCredentialParser.ts   # Parse provider-specific credentials
    ├── accountTypeNormalizer.ts     # Normalize account types
    ├── dateFormatter.ts            # Date formatting utilities
    ├── headers.ts                  # HTTP header utilities
    └── handleRepositoryCall.ts     # Repository error wrapper
```

## Route Organization

Routes in `routes/v1/index.ts` are split into two groups:

**Public** (no auth middleware):
- `/auth` → `auth.routes.ts`

**Protected** (JWT auth middleware applied):
- `/electricity` → `electricity.routes.ts`
- `/telegram` → `telegram.routes.ts`
- `/accounts` → `account.routes.ts`
- `/notification-settings` → `notificationSettings.route.ts`

## Database Architecture

Two separate SQLite databases via TypeORM:

| DataSource | Database | Entities |
|-----------|----------|----------|
| `AppDataSource` | `data/accounts.db` | `Account`, `TelegramNotificationSettings` |
| `AuthDataSource` | `data/auth.db` | `User` |

`userId` in Account/TelegramNotificationSettings references `User.id` as a plain string (cross-database, no FK constraint).

## Environment Variables

See `server/.env.example` for the full list. Key variables:

| Variable | Required | Description |
|----------|:--------:|-------------|
| `PORT` | ✅ | Server port (default: 3000) |
| `NODE_ENV` | ✅ | `development` / `production` / `test` |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS + OAuth redirects |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | ✅ | Must match Google Console exactly |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `JWT_EXPIRES_IN` | ❌ | Token expiry (default: `7d`) |
| `ENCRYPTION_KEY` | ✅ | AES encryption key for credentials |
| `TELEGRAM_BOT_TOKEN` | ❌ | Telegram bot token |
| `REDIS_HOST` | ❌ | Redis hostname (default: `localhost`) |
| `REDIS_PORT` | ❌ | Redis port (default: `6379`) |
| `REDIS_TTL` | ❌ | Cache TTL in seconds (default: `86400`) |
| `ENABLE_LATENCY_LOGGER` | ❌ | Enable request timing logs (default: `false`) |

## Path Aliases (tsconfig.json)

| Alias | Maps To |
|-------|---------|
| `@routes/*` | `src/routes/*` |
| `@configs/*` | `src/configs/*` |
| `@controllers/*` | `src/controllers/*` |
| `@services/*` | `src/services/implementations/*` |
| `@repositories/*` | `src/repositories/*` |
| `@middlewares/*` | `src/middlewares/*` |
| `@interfaces/*` | `src/interfaces/*` |
| `@helpers/*` | `src/helpers/*` |
| `@utility/*` | `src/utility/*` |
| `@entities/*` | `src/entities/*` |

## Development Commands
```bash
npm install          # Install dependencies
npm run start:dev    # Dev server with nodemon + ts-node
npm run build        # Compile TypeScript (tsc + tsc-alias)
npm start            # Run compiled JS
npm run lint         # ESLint
npm run format       # Prettier
```

## Key Patterns

1. **Controller → Service → Repository**: Controllers delegate to services; services handle business logic; repositories handle data access.
2. **BaseController**: All controllers extend `BaseController` for standard response methods and `handleRequest` wrapper.
3. **Zod validation**: `ValidationMiddleware` validates `body`, `params`, and `query` against Zod schemas before reaching controllers.
4. **Encryption**: `utility/encryption.ts` encrypts/decrypts credential fields using AES with `ENCRYPTION_KEY`.
5. **Config validation**: All env vars validated at startup via Zod schema in `configs/config.ts`.
6. **Singleton pattern**: `SchedulerService` and Redis client use singleton initialization.
7. **Graceful Redis fallback**: `RedisCacheService` continues without caching if Redis is unavailable.
