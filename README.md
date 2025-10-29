# Bill Barta - Electricity Bill Viewer

Bill Barta is a full-stack web application to view electricity bill balances for DPDC and NESCO accounts in Bangladesh, with support for automated Telegram notifications.

## Quick Start

1. Copy `.env.example` files in the root, `server`, and `client` directories to `.env` and fill in your credentials.
2. Start with Docker:

   ```bash
   docker compose up -d --build
   ```

3. Access the app:
   - Client: <http://localhost:5173>
   - Server API: <http://localhost:3000/api/v1>

For production, see `docker-compose.prod.yml` and the deployment docs.

## � Documentation

- [docs/README.md](./docs/README.md) — Documentation index
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) — Deployment guide
- [docs/COOLIFY_DEPLOYMENT.md](./docs/COOLIFY_DEPLOYMENT.md) — Coolify deployment
- [docs/API.md](./docs/API.md) — API reference
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Architecture overview
- [docs/CONFIGURATION.md](./docs/CONFIGURATION.md) — Configuration guide
- [docs/CACHING.md](./docs/CACHING.md) — Caching strategy
- [server/docs/TELEGRAM_INTEGRATION.md](./server/docs/TELEGRAM_INTEGRATION.md) — Telegram setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit and push your changes
4. Open a Pull Request

## 📄 License

MIT License — See [LICENSE](./LICENSE)
