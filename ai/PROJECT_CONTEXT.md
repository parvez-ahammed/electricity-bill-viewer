# Project Context

## Project Purpose

**Bill Barta** is an electricity bill monitoring application designed for users in Bangladesh who have DPDC (Dhaka Power Distribution Company) and NESCO (Northern Electricity Supply Company) accounts. The application provides:

1. **Unified Dashboard** — View balances from multiple providers in one place
2. **Secure Credential Storage** — AES-256 encrypted storage of provider credentials
3. **Automated Notifications** — Daily Telegram reports of account balances
4. **Modern Authentication** — Google OAuth 2.0 with JWT session management

## System Goals

| Goal                     | Implementation                                                       |
| ------------------------ | -------------------------------------------------------------------- |
| **Security First**       | AES-256 encryption, JWT tokens, HTTPS, rate limiting, Helmet headers |
| **User Privacy**         | Credentials never leave the server, no third-party analytics         |
| **Reliability**          | Redis caching, graceful degradation, error recovery                  |
| **Developer Experience** | TypeScript end-to-end, Zod validation, hot reload                    |
| **Easy Deployment**      | Docker Compose for development and production                        |

## Architecture Summary

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (User's Device)                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Client (React 19 + Vite)                    │
│  • shadcn/ui components    • TanStack Query                     │
│  • React Router            • Axios with JWT interceptor         │
│  • AuthContext             • localStorage cache                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST API (JWT Auth)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Server (Express.js)                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ Controllers │ →  │  Services   │ →  │   Repositories      │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│         │                 │                     │               │
│         │                 ▼                     ▼               │
│         │          ┌─────────────┐       ┌───────────┐          │
│         │          │ Redis Cache │       │  SQLite   │          │
│         │          └─────────────┘       │ (TypeORM) │          │
│         │                                └───────────┘          │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  External APIs: DPDC Portal, NESCO Portal, Telegram    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Architectural Pattern

**Layered Architecture** with the following structure:

```
Controller Layer    → HTTP request handling, response formatting
     ↓
Service Layer       → Business logic, orchestration, external API calls
     ↓
Repository Layer    → Data access, CRUD operations, encryption
     ↓
Entity Layer        → TypeORM entities, database schema
```

### Dual Database Design

| Database         | File          | Entities                                  | Purpose                                    |
| ---------------- | ------------- | ----------------------------------------- | ------------------------------------------ |
| `AppDataSource`  | `accounts.db` | `Account`, `TelegramNotificationSettings` | Encrypted credentials, notification config |
| `AuthDataSource` | `auth.db`     | `User`                                    | Google OAuth user profiles                 |

## Important Design Decisions

### 1. Dual SQLite Databases

**Decision**: Separate `auth.db` from `accounts.db`.

**Rationale**:

- Isolation of authentication data from application data
- Simpler backup/restore strategies
- Clear ownership boundaries
- Easier to migrate one without affecting the other

### 2. AES-256 Encryption for Credentials

**Decision**: Encrypt `password` and `clientSecret` fields before storage.

**Rationale**:

- Provider credentials are highly sensitive
- Encryption at rest protects against database theft
- Key management is separate from database

**Implementation**: `server/src/utility/encryption.ts`

### 3. Redis for Caching (Optional)

**Decision**: Use Redis with graceful fallback.

**Rationale**:

- Reduces load on external provider APIs
- 24-hour TTL balances freshness with performance
- Graceful degradation when Redis unavailable

### 4. JWT-Based Authentication

**Decision**: Stateless JWT tokens, no server-side session storage.

**Rationale**:

- Horizontal scalability
- No session database required
- Simple token refresh on client
- Trade-off: No server-side revocation (mitigated by short expiration)

### 5. Web Scraping for NESCO

**Decision**: Use Cheerio-based web scraping for NESCO data.

**Rationale**:

- NESCO does not provide a public API
- Web scraping is the only available method
- Cheerio is server-side only (no browser automation needed)

### 6. Per-User Notification Settings

**Decision**: Store Telegram chat IDs in database, not environment variables.

**Rationale**:

- Multi-user support
- Each user manages their own notifications
- No server restart needed to change settings

## Technology Stack

### Frontend

| Technology     | Version | Purpose                 |
| -------------- | ------- | ----------------------- |
| React          | 19      | UI framework            |
| Vite           | 6       | Build tool, dev server  |
| TypeScript     | 5.7     | Type safety             |
| Tailwind CSS   | 4       | Utility-first styling   |
| shadcn/ui      | Latest  | Radix-based components  |
| TanStack Query | 5       | Server state management |
| React Router   | 7       | Client-side routing     |
| Axios          | 1.8     | HTTP client             |
| Zod            | 3       | Schema validation       |
| Framer Motion  | 12      | Animations              |

### Backend

| Technology   | Version | Purpose           |
| ------------ | ------- | ----------------- |
| Node.js      | 22      | Runtime           |
| Express      | 4       | HTTP framework    |
| TypeScript   | 5.7     | Type safety       |
| TypeORM      | 0.3     | ORM for SQLite    |
| SQLite       | 3       | Embedded database |
| Redis        | 5       | Caching           |
| Zod          | 3       | Input validation  |
| Winston      | 3       | Logging           |
| node-cron    | 4       | Scheduled tasks   |
| Cheerio      | 1       | Web scraping      |
| crypto-js    | 4       | AES encryption    |
| jsonwebtoken | 9       | JWT handling      |
| googleapis   | 170     | Google OAuth      |

### DevOps

| Technology     | Purpose                       |
| -------------- | ----------------------------- |
| Docker         | Containerization              |
| Docker Compose | Multi-container orchestration |
| Nginx          | Production reverse proxy      |
| Coolify        | Self-hosted PaaS deployment   |

## Feature Domains

| Domain          | Description                      | Key Files                                                                     |
| --------------- | -------------------------------- | ----------------------------------------------------------------------------- |
| **Auth**        | Google OAuth 2.0, JWT tokens     | `AuthService`, `JwtService`, `AuthMiddleware`, `AuthContext`                  |
| **Accounts**    | CRUD for electricity accounts    | `AccountService`, `AccountRepository`, `accountManagement` feature            |
| **Electricity** | Balance fetching, multi-provider | `ElectricityService`, `DPDCService`, `NESCOService`, `accountBalance` feature |
| **Telegram**    | Notifications, scheduled reports | `TelegramService`, `SchedulerService`, `NotificationSettingsService`          |
| **Caching**     | Redis + localStorage             | `RedisCacheService`, `lib/cache.ts`                                           |

## Environment Configuration

All environment variables are validated at startup using Zod (`server/src/configs/config.ts`).

See [docs/CONFIGURATION.md](../docs/CONFIGURATION.md) for the complete variable reference.
