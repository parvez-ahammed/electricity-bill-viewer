# Bill Barta - Electricity Bill Viewer

A simple web application to view electricity bill balances for DPDC, NESCO, and DESCO accounts.

## Features

- ✅ View electricity account balances from multiple providers
- ✅ Redis caching for improved performance
- ✅ Cache refresh capability with `x-skip-cache` header
- ✅ Telegram bot integration for automated reports
- ✅ Docker support for easy deployment
- ✅ Clean, simple interface with React + TypeScript

## Quick Start

### Using Docker (Recommended)

1. **Setup environment variables**:

   ```bash
   # Copy root environment file
   cp .env.example .env
   # Edit .env with Redis and project configuration

   # Copy server environment file
   cp server/.env.example server/.env
   # Edit server/.env with your server credentials

   # Copy client environment file
   cp client/.env.example client/.env
   # Edit client/.env with your client credentials
   ```

2. **Start the application**:

   ```bash
   docker compose up -d --build
   ```

3. **Access the application**:
   - Client: http://localhost:5173
   - Server API: http://localhost:3000/api/v1

### Local Development

1. **Setup environment files**:

   ```bash
   # Copy environment files for each service
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   # Edit each .env file with your credentials
   ```

2. **Server**:

   ```bash
   cd server
   npm install
   npm run start:dev
   ```

3. **Client**:

   ```bash
   cd client
   npm install
   npm run dev
   ```

## Configuration

Environment variables are organized by service:

### Root `.env` (Docker Compose & Redis)

- `PROJECT_NAME` - Project name for Docker containers
- `REDIS_HOST`, `REDIS_PORT` - Redis configuration

### Server `.env`

- `DPDC_CLIENT_SECRET` - Your DPDC client secret
- `TELEGRAM_BOT_TOKEN` - Telegram bot token for notifications
- `TELEGRAM_CHAT_ID` - Telegram chat ID for notifications
- `ELECTRICITY_CREDENTIALS` - Server-side credentials for Telegram reports
- `ENABLE_LATENCY_LOGGER` - Enable request latency logging

### Client `.env`

- `VITE_BACKEND_API_PATH` - Backend API URL
- `VITE_ELECTRICITY_CREDENTIALS` - JSON array of account credentials

See `.env.example` files in root, server, and client directories for all available options.

## Architecture

```
├── client/          # React + TypeScript frontend (Vite)
├── server/          # Node.js + Express backend (TypeScript)
├── scripts/         # Utility scripts
├── docker-compose.yml  # Docker Compose configuration
└── .env             # Root environment variables
```

### Tech Stack

**Frontend:**

- React 19
- TypeScript
- TanStack Query (React Query)
- Tailwind CSS
- Vite

**Backend:**

- Node.js + Express
- TypeScript
- Redis (caching)
- Axios
- Cheerio (web scraping)

## API Endpoints

- `POST /api/v1/electricity/usage-data` - Get electricity usage data
- `POST /api/v1/telegram/send-balances` - Send balances via Telegram

## Cache Management

The application uses Redis for caching with:

- Default TTL: 24 hours (86400 seconds)
- LRU eviction policy
- Manual cache bypass with `x-skip-cache: true` header

## Providers Supported

- **DPDC** (Dhaka Power Distribution Company) - 🔵
- **NESCO** (Northern Electricity Supply Company) - 🟢

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
