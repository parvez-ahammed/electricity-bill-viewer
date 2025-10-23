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
   cd docker
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Start the application**:

   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Client: http://localhost:5173
   - Server API: http://localhost:3000/api/v1

### Local Development

1. **Setup centralized environment**:

   ```bash
   cd docker
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Server**:

   ```bash
   cd server

   # Create symlink to centralized .env
   # Windows (PowerShell as Admin):
   New-Item -ItemType SymbolicLink -Path ".env" -Target "..\docker\.env"
   # Linux/Mac:
   ln -s ../docker/.env .env

   npm install
   npm run start:dev
   ```

3. **Client**:

   ```bash
   cd client

   # Create symlink to centralized .env
   # Windows (PowerShell as Admin):
   New-Item -ItemType SymbolicLink -Path ".env" -Target "..\docker\.env"
   # Linux/Mac:
   ln -s ../docker/.env .env

   npm install
   npm run dev
   ```

## Configuration

All environment variables are centralized in `docker/.env`. Key configurations:

### Required

- `DPDC_CLIENT_SECRET` - Your DPDC client secret
- `VITE_ELECTRICITY_CREDENTIALS` - JSON array of account credentials

### Optional

- `TELEGRAM_BOT_TOKEN` - Telegram bot token for notifications
- `TELEGRAM_CHAT_ID` - Telegram chat ID for notifications
- `ELECTRICITY_CREDENTIALS` - Server-side credentials for Telegram reports
- `ENABLE_LATENCY_LOGGER` - Enable request latency logging

See `docker/.env.example` for all available options.

## Architecture

```
├── client/          # React + TypeScript frontend (Vite)
├── server/          # Node.js + Express backend (TypeScript)
├── docker/          # Docker configuration & centralized .env
└── scripts/         # Utility scripts
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
