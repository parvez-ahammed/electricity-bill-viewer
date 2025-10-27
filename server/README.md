# Bill Barta - Backend Server# bill-barta-backend

Node.js + Express backend for the Electricity Bill Viewer application. Handles electricity provider integrations, Redis caching, and Telegram notifications.

## 🚀 Features

- **Provider Integrations**: DPDC and NESCO electricity services
- **Redis Caching**: Individual credential caching with 24-hour TTL
- **Telegram Bot**: Automated balance notifications
- **TypeScript**: Full type safety with path aliases
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston with optional Loki integration
- **Docker**: Production-ready multi-stage builds

## 📋 Prerequisites

- Node.js 22.x or higher
- Redis 7.x (for caching)
- npm or yarn

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=86400

# DPDC Integration
DPDC_CLIENT_SECRET=your_dpdc_client_secret

# Telegram Integration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Credentials for Telegram automated reports
ELECTRICITY_CREDENTIALS=[{"username":"account1","password":"pass1","provider":"DPDC"}]

# Optional
CORS_ORIGIN=http://localhost:5173
ENABLE_LATENCY_LOGGER=false
```

### TypeScript Path Aliases

The project uses path aliases for cleaner imports:

- `@configs/*` → `src/configs/*`
- `@services/*` → `src/services/implementations/*`
- `@controllers/*` → `src/controllers/*`
- `@middlewares/*` → `src/middlewares/*`
- `@interfaces/*` → `src/interfaces/*`
- `@repositories/*` → `src/repositories/*`
- `@dtos/*` → `src/dtos/*`
- `@helpers/*` → `src/helpers/*`
- `@utility/*` → `src/utility/*`

These are resolved during build time using `tsc-alias`.

## 🏃 Running the Server

### Development Mode

```bash
npm run start:dev
```

Starts the server with hot-reload using nodemon and ts-node.

### Production Mode

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

The build process compiles TypeScript and resolves path aliases to relative imports.

## 📁 Project Structure

```text
server/
├── src/
│   ├── configs/           # Configuration files
│   │   └── config.ts      # Environment config
│   ├── controllers/       # Request handlers
│   │   ├── ElectricityController.ts
│   │   └── TelegramController.ts
│   ├── services/          # Business logic
│   │   └── implementations/
│   │       ├── DPDCService.ts       # DPDC provider
│   │       ├── NESCOService.ts      # NESCO provider
│   │       ├── RedisCacheService.ts # Caching layer
│   │       ├── ElectricityService.ts
│   │       └── TelegramService.ts
│   ├── utility/           # Shared utilities
│   │   ├── credentialParser.ts  # Parse environment credentials
│   │   └── dateFormatter.ts     # Date formatting helpers
│   ├── middlewares/       # Express middlewares
│   ├── routes/            # API routes
│   ├── interfaces/        # TypeScript interfaces
│   ├── dtos/              # Data transfer objects
│   ├── helpers/           # Helper functions
│   ├── app.ts             # Express app setup
│   ├── index.ts           # Server startup
│   └── main.ts            # Entry point
├── dist/                  # Compiled JavaScript (production)
├── debug/                 # Debug HTML responses
├── docs/                  # Documentation
│   └── TELEGRAM_INTEGRATION.md
├── tsconfig.json          # TypeScript configuration
├── package.json
└── .env                   # Environment variables
```

## 🔌 API Endpoints

### Electricity Data

```http
GET /api/v1/electricity/usage-data
```

**Headers:**

- `x-skip-cache: true` (optional) - Bypass Redis cache

**Response:**

```json
[
    {
        "customerName": "John Doe",
        "accountNumber": "123456789",
        "balance": 1234.56,
        "lastUpdated": "2025-10-27",
        "provider": "DPDC",
        "location": "Dhaka"
    }
]
```

### Telegram Notifications

```http
POST /api/v1/telegram/send-balances
```

Sends balance information for all configured accounts via Telegram.

**Response:**

```json
{
    "success": true,
    "message": "Balances sent successfully to Telegram"
}
```

### Health Check

```http
GET /api/v1/electricity/health
```

**Response:**

```json
{
    "status": "ok",
    "timestamp": "2025-10-27T12:00:00.000Z"
}
```

## 💾 Caching Strategy

### Redis Implementation

- **Individual Caching**: Each credential is cached separately
- **Cache Key Format**: `electricity:{provider}:{hash(username:password)}`
- **TTL**: 24 hours (configurable via `REDIS_TTL`)
- **Eviction Policy**: LRU (Least Recently Used)

### Cache Utilities

**Shared Utilities** (`src/utility/`):

- `credentialParser.ts`: Parses `ELECTRICITY_CREDENTIALS` from environment
- `dateFormatter.ts`: Standardizes date formats across providers

## 🏢 Provider Implementations

### DPDC Service

- Fetches data from DPDC portal
- Requires `DPDC_CLIENT_SECRET`
- Returns account balance, payment history, meter info

### NESCO Service

- Scrapes NESCO website using Cheerio
- No API key required
- Returns account balance, last updated date

Both implement `IProviderService` interface for consistency.

## 📱 Telegram Integration

See [docs/TELEGRAM_INTEGRATION.md](./docs/TELEGRAM_INTEGRATION.md) for detailed setup instructions.

**Message Format:**

```text
📊 Electricity Account Balances

👤 Customer: John Doe
💰 Balance: ৳1,234.56
📅 Updated: October 27, 2025
```

## 🐳 Docker

### Development

```bash
# From repository root
docker compose up -d server
```

### Production

```bash
# Build production image
docker build -f Dockerfile.server -t bill-barta-server .

# Run container
docker run -p 3000:3000 --env-file server/.env bill-barta-server
```

The production Dockerfile uses multi-stage builds:

1. **Builder stage**: Install all dependencies, compile TypeScript
2. **Production stage**: Copy compiled code and production dependencies only

## 🧪 Testing

```bash
# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Configurable origin
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Zod schemas
- **Environment Variables**: Sensitive data not in code

## 📊 Logging

Winston logger with:

- Console transport (development)
- Optional Loki transport (production)
- Request latency logging (configurable)

## 🚀 Deployment

For production deployment, see:

- [../DEPLOYMENT.md](../DEPLOYMENT.md) - General deployment guide
- [../COOLIFY_DEPLOYMENT.md](../COOLIFY_DEPLOYMENT.md) - Coolify-specific guide

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use path aliases for imports
3. Add JSDoc comments for public APIs
4. Run linter before committing
5. Update tests for new features

## 📄 License

MIT License - See [../LICENSE](../LICENSE) file for details
