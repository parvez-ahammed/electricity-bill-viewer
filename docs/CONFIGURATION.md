# Configuration Guide

Bill Barta uses three `.env` files at different levels. Copy and edit the corresponding `.env.example` files to get started.

## Root `.env`

Used by Docker Compose for container orchestration.

| Variable | Default | Description |
|----------|---------|-------------|
| `PROJECT_NAME` | `bill-barta` | Docker Compose project name |
| `SERVER_PORT` | `3000` | Exposed server port |
| `SERVER_DEBUG_PORT` | `9091` | Debug port (development only) |
| `CLIENT_PORT` | `5173` | Exposed client port |
| `REDIS_HOST` | `redis` | Redis hostname (use `redis` for Docker, `localhost` for bare-metal) |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | _(empty)_ | Redis password (optional) |
| `REDIS_TTL` | `86400` | Cache TTL in seconds (24 hours) |
| `ENCRYPTION_KEY` | _(change me)_ | AES encryption key for credentials in database |
| `TELEGRAM_BOT_TOKEN` | _(optional)_ | Telegram bot token |
| `TELEGRAM_CHAT_ID` | _(optional)_ | Default Telegram chat ID (legacy, prefer DB-driven settings) |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated CORS origins |

## Server `.env`

Used by the backend Express server.

| Variable | Default | Required | Description |
|----------|---------|:--------:|-------------|
| `PORT` | `3000` | ✅ | Server listen port |
| `NODE_ENV` | `development` | ✅ | `development`, `production`, or `test` |
| `FRONTEND_URL` | `http://localhost:5173` | ✅ | Frontend URL for CORS and OAuth redirects |
| `GOOGLE_CLIENT_ID` | — | ✅ | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | — | ✅ | Google OAuth 2.0 client secret |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3000/api/v1/auth/google/callback` | ✅ | OAuth callback URL (must match Google Console) |
| `JWT_SECRET` | — | ✅ | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | ❌ | JWT token expiration duration |
| `TELEGRAM_BOT_TOKEN` | — | ❌ | Telegram bot token for notifications |
| `ENCRYPTION_KEY` | — | ✅ | AES key for encrypting stored credentials |
| `ENABLE_LATENCY_LOGGER` | `false` | ❌ | Enable per-request latency logging |
| `REDIS_HOST` | `localhost` | ❌ | Redis hostname |
| `REDIS_PORT` | `6379` | ❌ | Redis port |
| `REDIS_PASSWORD` | _(empty)_ | ❌ | Redis password |
| `REDIS_TTL` | `86400` | ❌ | Redis cache TTL (seconds) |
| `RATE_LIMIT_WINDOW_MS` | `900000` | ❌ | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `10000` | ❌ | Max requests per window |

## Client `.env`

Used by the Vite frontend. All variables must be prefixed with `VITE_`.

| Variable | Default | Required | Description |
|----------|---------|:--------:|-------------|
| `CLIENT_PORT` | `5173` | ❌ | Vite dev server port |
| `VITE_BACKEND_URL` | `http://localhost:3000` | ✅ | Backend base URL |
| `VITE_BACKEND_API_PATH` | `/api/v1` | ✅ | API path prefix |
| `VITE_GOOGLE_CLIENT_ID` | — | ✅ | Google OAuth client ID (for client-side display) |

## Environment Validation

The server validates all environment variables at startup using a **Zod schema** in `server/src/configs/config.ts`. If validation fails, the server logs the specific missing/invalid fields and exits with a clear error message.

## Security Notes

- ⚠️ Never commit `.env` files to version control
- 🔑 Generate a strong `ENCRYPTION_KEY` for production: `openssl rand -base64 32`
- 🔑 Generate a strong `JWT_SECRET` for production
- 🌐 Set `ALLOWED_ORIGINS` to your actual domain(s) in production
- 🔄 The `GOOGLE_REDIRECT_URI` must match exactly in both the `.env` and the Google Cloud Console
