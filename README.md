# Bill Barta - Electricity Bill Viewer

A full-stack web application to view electricity bill balances for DPDC and NESCO accounts in Bangladesh, with support for automated Telegram notifications.

## ✨ Features

- 🔐 **Secure Backend Processing** - All credentials handled server-side
- ⚡ **Multi-tier Caching** - Redis (server) + localStorage (client, 24h expiry)
- 🔄 **Individual Account Caching** - Each credential cached separately
- 📱 **Telegram Integration** - Automated balance reports via Telegram bot
- 🐳 **Production Ready** - Docker support with multi-stage builds
- 🎨 **Modern UI** - Clean interface with React 19 + TypeScript + Tailwind
- 🌐 **i18n Support** - English and Norwegian translations

## 🚀 Quick Start

### Production Deployment (Docker)

For production deployment on Coolify or other platforms, see [DEPLOYMENT.md](./DEPLOYMENT.md) and [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md).

```bash
# Using production compose file
docker compose -f docker-compose.prod.yml up -d
```

### Development with Docker (Recommended)

1. **Setup environment variables**:

   ```bash
   # Root .env (Redis and Docker Compose)
   cp .env.example .env

   # Server .env
   cp server/.env.example server/.env

   # Client .env
   cp client/.env.example client/.env
   ```

2. **Edit the .env files** with your actual credentials

3. **Start all services**:

   ```bash
   docker compose up -d --build
   ```

4. **Access the application**:

   - Client: <http://localhost:5173>
   - Server API: <http://localhost:3000/api/v1>
   - Redis: Port 6379

5. **View logs**:

   ```bash
   docker compose logs -f
   ```

6. **Stop all services**:

   ```bash
   docker compose down
   ```

### Local Development (Without Docker)

1. **Setup environment files**:

   ```bash
   # Copy environment files for each service
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   # Edit each .env file with your credentials
   ```

2. **Install and run Redis** (required for caching)

3. **Server**:

   ```bash
   cd server
   npm install
   npm run start:dev
   ```

4. **Client**:

   ```bash
   cd client
   npm install
   npm run dev
   ```

## 📋 Configuration

Environment variables are organized by service:

### Root `.env` (Docker Compose)

```env
PROJECT_NAME=electricity-bill-viewer
SERVER_PORT=3000
CLIENT_PORT=5173
REDIS_PORT=6379
REDIS_HOST=redis
```

### Server `.env`

```env
# Required for DPDC accounts
DPDC_CLIENT_SECRET=your_dpdc_secret

# Required for Telegram notifications
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
ELECTRICITY_CREDENTIALS=[{"username":"...", "password":"...", "provider":"DPDC"}]

# Optional
ENABLE_LATENCY_LOGGER=false
CORS_ORIGIN=http://localhost:5173
```

### Client `.env`

```env
VITE_BACKEND_API_PATH=http://localhost:3000/api/v1
```

See `.env.example` files for complete configuration options.

## 🏗️ Architecture

```text
electricity-bill-viewer/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── features/
│   │   │   ├── accountBalance/  # Main feature with caching
│   │   │   ├── auth/
│   │   │   └── user/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React contexts
│   │   ├── lib/            # Axios, utils, cache
│   │   └── locales/        # i18n translations
│   └── nginx.conf          # Production Nginx config
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── services/       # Provider implementations
│   │   │   ├── DPDCService.ts
│   │   │   ├── NESCOService.ts
│   │   │   ├── TelegramService.ts
│   │   │   └── RedisCacheService.ts
│   │   ├── controllers/    # Request handlers
│   │   ├── utility/        # Shared utilities
│   │   │   ├── credentialParser.ts
│   │   │   └── dateFormatter.ts
│   │   └── routes/         # API routes
│   └── tsconfig.json       # TypeScript config with path aliases
├── docker-compose.yml      # Development compose
├── docker-compose.prod.yml # Production compose
├── Dockerfile.server       # Multi-stage server build
├── Dockerfile.client       # Multi-stage client build
└── .dockerignore
```

## 🛠️ Tech Stack

**Frontend:**

- React 19 with TypeScript
- Vite 6 (build tool)
- TanStack Query (server state)
- Tailwind CSS + shadcn/ui
- i18next (internationalization)
- Nginx (production serving)

**Backend:**

- Node.js 22 + Express
- TypeScript with path aliases (@configs, @services, etc.)
- Redis 7 (caching layer)
- Cheerio (HTML parsing)
- Axios (HTTP client)
- Winston (logging)

**DevOps:**

- Docker multi-stage builds
- Docker Compose
- Coolify (deployment platform)

## 🔌 API Endpoints

### Electricity Data

```http
GET /api/v1/electricity/usage-data
Headers: x-skip-cache: true (optional)
Response: Array of account data with balances
```

### Telegram Notifications

```http
POST /api/v1/telegram/send-balances
Response: { success: true, message: "..." }
```

### Health Check

```http
GET /api/v1/electricity/health
Response: { status: "ok", timestamp: "..." }
```

## 💾 Caching Strategy

### Server-side (Redis)

- **TTL**: 24 hours per credential
- **Key Format**: `electricity:{provider}:{hash(username:password)}`
- **Eviction**: LRU policy
- **Bypass**: Send `x-skip-cache: true` header

### Client-side (localStorage)

- **TTL**: 24 hours
- **Key**: `electricityData`
- **Format**: `{ data, timestamp, expiresAt }`
- **Auto-cleanup**: On expiry or manual refresh

## 🏢 Supported Providers

| Provider                                        | Status    | Features                               |
| ----------------------------------------------- | --------- | -------------------------------------- |
| **DPDC** (Dhaka Power Distribution Company)     | ✅ Active | Balance, account info, payment history |
| **NESCO** (Northern Electricity Supply Company) | ✅ Active | Balance, account info, last updated    |

## 🐳 Docker Services

### Development (`docker-compose.yml`)

- **redis**: Port 6379, volume for persistence
- **server**: Port 3000 (API), Port 9091 (debug), hot-reload
- **client**: Port 5173, Vite dev server

### Production (`docker-compose.prod.yml`)

- **redis**: Production config with health checks
- **server**: Multi-stage build, optimized Node.js
- **client**: Nginx serving static build with caching

### Useful Commands

```bash
# Development
docker compose up -d --build
docker compose logs -f server
docker compose exec server sh

# Production
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f

# Cleanup
docker compose down -v  # Remove volumes too
```

## � Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Coolify Deployment](./COOLIFY_DEPLOYMENT.md) - Coolify-specific guide
- [Telegram Integration](./server/docs/TELEGRAM_INTEGRATION.md) - Setting up Telegram bot
- [Test Cases](./testCases.md) - Manual testing scenarios

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- DPDC and NESCO for providing online balance checking services
- Open source community for amazing tools and libraries
