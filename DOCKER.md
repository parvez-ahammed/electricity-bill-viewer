# Docker Setup

## Quick Start

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

4. **View logs**:

   ```bash
   docker compose logs -f
   ```

5. **Stop all services**:
   ```bash
   docker compose down
   ```

## Environment Files

- **`.env`** (root): Docker Compose configuration and Redis settings
- **`server/.env`**: Server-specific configuration (API keys, Telegram, etc.)
- **`client/.env`**: Client-specific configuration (Vite variables)

## Services

- **Redis**: Port 6379
- **Server**: Port 3000 (API), Port 9091 (Debug)
- **Client**: Port 5173 (Dev Server)

## Useful Commands

```bash
# Rebuild a specific service
docker compose up -d --build server

# View logs for a specific service
docker compose logs -f server

# Execute commands in a container
docker compose exec server sh

# Stop and remove all containers, networks, and volumes
docker compose down -v
```
