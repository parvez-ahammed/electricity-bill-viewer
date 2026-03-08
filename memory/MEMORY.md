# Bill Barta — Project Memory

## Project
Electricity bill viewer (Bill Barta). Node/TypeScript Express backend + React/Vite frontend.
Stack: TypeORM + SQLite (dual DBs), Redis, Google OAuth, Telegram Bot.

## Architecture
- Backend: `server/src/` — Controller → Service → Repository pattern
- Frontend: `client/src/` — Feature-based (accountBalance, accountManagement, home)
- Two DBs: `AppDataSource` (accounts.db) + `AuthDataSource` (auth.db)
- `express-async-errors` in `app.ts` — async errors auto-forwarded to global handler

## Response Format
All API responses: `{ status: 'success'|'error', message: string, data: T }`.
Frontend `apiRequest()` extracts `.data` automatically.
AuthMiddleware and global error handler both use this same format.

## Security Decisions
- JWT locked to HS256 algorithm (sign + verify)
- ENCRYPTION_KEY: min 32 chars (Zod), fails fast in production if missing
- EncryptionService: typed with ProviderCredentials, no `any`
- OAuth state parameter added to AuthService.getAuthUrl()
- Telegram chatId validated as numeric regex in schema
- SchedulerService only initialized when TELEGRAM_BOT_TOKEN is set
- clientSecret fully masked in frontend AccountTable (was showing 8 chars)

## Type Safety
- Zero `any` types across entire backend codebase
- `CorruptedCredentials` interface in `server/src/interfaces/Account.ts`
- `ResponseBuilder.data` typed as `unknown` (was `any`)
- `DPDCHeaderOptions.config` properly typed with `DPDCConfig` interface
- `AccountService.mapToAccountRecord` uses `Account` entity type

## DRY Patterns
- `toProviderCredential()` utility in `accountCredentialParser.ts` — used by TelegramService and ElectricityService
- `decryptOrMarkCorrupted()` + `decryptAccountList()` in AccountRepository — consolidates 4x repeated decrypt logic
- `window.confirm` replaced with `AlertDialog` in NotificationManagement (consistent with AccountTable)

## Logging
- All business logic uses Winston `logger` singleton
- `console.*` only in startup configs (config.ts, database.ts, winston.ts) where logger not yet available

## Known Remaining Items (Low severity)
- OAuth callback passes JWT in URL query string (browser history exposure) — standard for server-redirect OAuth
- `console.*` in startup config files is intentional (logger not yet initialized)
- CORS allows all origins in development mode
