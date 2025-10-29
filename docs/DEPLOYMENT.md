# Bill Barta - Deployment Guide

## Quick Start

### Local Development

```bash
# 1. Clone the repository
git clone <repository-url>
cd electricity-bill-viewer

# 2. Copy environment files
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Configure environment variables
# Edit .env, server/.env, and client/.env with your credentials

# 4. Start with Docker Compose
docker compose up -d

# Access:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - Redis: localhost:6379
```

### Production Deployment (Coolify)

```bash
# 1. Create project in Coolify
# 2. Connect GitHub repository
# 3. Select docker-compose.prod.yml
# 4. Set environment variables in Coolify UI
# 5. Deploy!
```

See [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) for detailed instructions.

## File Structure

```text
.
├── docker-compose.yml           # Local development
├── docker-compose.prod.yml      # Production deployment
├── Dockerfile.server            # Production server build
├── Dockerfile.client            # Production client build
├── .env                         # Root environment variables
├── client/
│   ├── Dockerfile               # Development client
│   ├── nginx.conf              # Production nginx config
│   ├── .env                    # Client environment
│   └── package.json
└── server/
    ├── Dockerfile              # Development server
    ├── .env                    # Server environment
    └── package.json
```

## Environment Files

### Root (.env)

- Docker Compose configuration
- Port mappings
- Redis configuration
- Production credentials

### Server (.env)

- Backend-specific configuration
- API keys and secrets
- Database connections

### Client (.env)

- Frontend-specific configuration
- API endpoints
- Feature flags

## Docker Compose Files

### docker-compose.yml (Development)

- Volume mounts for hot reload
- Development servers (Vite, nodemon)
- Debug ports exposed
- Node modules in anonymous volumes

### docker-compose.prod.yml (Production)

- Multi-stage builds
- Production-optimized images
- No volume mounts
- Nginx for client
- Compiled server code

## Dockerfiles

### Server

- **Development** (`server/Dockerfile`): ts-node + nodemon
- **Production** (`Dockerfile.server`): Multi-stage build, compiled JS

### Client

- **Development** (`client/Dockerfile`): Vite dev server
- **Production** (`Dockerfile.client`): Multi-stage build, nginx static serve

## Health Checks

All services include health checks:

| Service | Endpoint         | Interval |
| ------- | ---------------- | -------- |
| Redis   | `redis-cli ping` | 10s      |
| Client  | `GET /`          | 30s      |

## Ports

| Service      | Development | Production      |
| ------------ | ----------- | --------------- |
| Client       | 5173        | 80              |
| Server       | 3000        | 3000            |
| Server Debug | 9091        | -               |
| Redis        | 6379        | 6379 (internal) |

## Commands

### Development

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Restart a service
docker compose restart server

# Stop all services
docker compose down

# Rebuild
docker compose up -d --build
```

### Production (Coolify handles this)

```bash
# Coolify automatically runs:
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Port Already in Use

```bash
# Change ports in .env
SERVER_PORT=8080
CLIENT_PORT=3001
```

### Build Failures

```bash
# Clear Docker cache
docker compose down -v
docker system prune -a
docker compose up -d --build
```

### Container Not Starting

```bash
# Check logs
docker compose logs <service-name>

# Check health
docker ps
```

## Security Checklist

- [ ] Change default ports in production
- [ ] Set strong DPDC_CLIENT_SECRET
- [ ] Configure ALLOWED_ORIGINS for CORS
- [ ] Use HTTPS in production
- [ ] Don't commit .env files
- [ ] Rotate Telegram tokens regularly
- [ ] Enable Redis password (optional)
- [ ] Review nginx security headers

## Performance Optimization

### Redis

- `maxmemory 256mb` - Adjust based on your needs
- `maxmemory-policy allkeys-lru` - Automatic eviction
- `appendonly yes` - Persistence enabled

### Client

- Gzip compression enabled
- Static asset caching (1 year)
- No caching for index.html

### Server

- Production build minified
- Node.js production mode
- Compression middleware

## Monitoring

In production (Coolify):

- Container metrics in Coolify dashboard
- Application logs in Logs tab
- Health check status visible
- Automatic restart on failure

## Backup

### Redis Data

```bash
# Backup
docker run --rm -v bill-barta-net_redis-data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz /data

# Restore
docker run --rm -v bill-barta-net_redis-data:/data -v $(pwd):/backup alpine tar xzf /backup/redis-backup.tar.gz -C /
```

## Support

For issues:

1. Check [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)
2. Review container logs
3. Verify environment variables
4. Check health endpoints

## License

[Your License Here]
