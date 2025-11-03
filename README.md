# Bill Barta - Electricity Bill Viewer

Bill Barta is a full-stack web application to view electricity bill balances for DPDC and NESCO accounts in Bangladesh, with support for automated Telegram notifications and database-driven account management.

## ✨ Key Features

- 🔐 **Secure Account Management**: Database-driven with AES encryption
- 📱 **Modern Web Interface**: React-based UI with real-time updates
- 📊 **Multi-Provider Support**: DPDC and NESCO accounts in one dashboard
- 🤖 **Telegram Integration**: Automated daily reports + manual trigger
- ⚡ **Smart Caching**: Redis server-side + localStorage client-side
- 🔄 **Real-time Refresh**: Manual refresh with cache bypass
- 🛡️ **Data Protection**: Encrypted credentials with corruption recovery

## Quick Start

1. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

2. **Configure Encryption** (Important!)
   ```bash
   # Generate secure encryption key
   openssl rand -base64 32
   
   # Add to .env and server/.env
   ENCRYPTION_KEY=your_generated_key_here
   ```

3. **Start with Docker**
   ```bash
   docker compose up -d --build
   ```

4. **Access the Application**
   - **Client**: <http://localhost:5173>
   - **Server API**: <http://localhost:3000/api/v1>
   - **Account Management**: <http://localhost:5173/accounts>

5. **Add Your Accounts**
   - Navigate to Account Management page
   - Add DPDC accounts (username, password, client secret)
   - Add NESCO accounts (customer number only)
   - See [docs/DPDC_SETUP.md](./docs/DPDC_SETUP.md) for finding DPDC client secret

For production deployment, see `docker-compose.prod.yml` and the deployment docs.

## Documentation

### Getting Started
- [docs/README.md](./docs/README.md) — Documentation index
- [docs/ACCOUNT_MANAGEMENT.md](./docs/ACCOUNT_MANAGEMENT.md) — Account management system
- [docs/DPDC_SETUP.md](./docs/DPDC_SETUP.md) — DPDC client secret discovery
- [docs/CONFIGURATION.md](./docs/CONFIGURATION.md) — Environment configuration

### Deployment & Operations  
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) — General deployment guide
- [docs/COOLIFY_DEPLOYMENT.md](./docs/COOLIFY_DEPLOYMENT.md) — Coolify-specific deployment
- [docs/CACHING.md](./docs/CACHING.md) — Caching strategies

### Integration & API
- [docs/TELEGRAM_INTEGRATION.md](./docs/TELEGRAM_INTEGRATION.md) — Telegram bot setup
- [docs/API.md](./docs/API.md) — API endpoints reference
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Technical architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit and push your changes
4. Open a Pull Request

## 📄 License

MIT License — See [LICENSE](./LICENSE)
