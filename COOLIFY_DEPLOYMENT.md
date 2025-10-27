# Coolify Deployment Guide

## Prerequisites

- Coolify instance running
- GitHub repository connected to Coolify
- Domain configured (optional)

## Deployment Steps

### 1. Create New Project in Coolify

1. Go to **Projects** → **Add New Project**
2. Name: `bill-barta` or your preferred name

### 2. Add Service (Docker Compose)

1. Click **Add New Resource** → **Docker Compose**
2. **Source**: Select your GitHub repository
3. **Branch**: `dev` (or your production branch)
4. **Docker Compose Location**: `docker-compose.prod.yml`

### 3. Configure Environment Variables

In Coolify, add the following environment variables:

#### Required Variables

```bash
# Project
PROJECT_NAME=bill-barta

# Ports (use Coolify's automatic port assignment)
SERVER_PORT=3000
CLIENT_PORT=80
REDIS_PORT=6379

# Redis
REDIS_TTL=86400

# DPDC API
DPDC_CLIENT_SECRET=your_dpdc_client_secret

# Electricity Credentials (JSON array)
ELECTRICITY_CREDENTIALS=[{"username":"user1","password":"pass1","provider":"DPDC"},{"username":"user2","password":"pass2","provider":"NESCO"}]

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# CORS (add your domain)
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:5173
```

### 4. Deploy

Click **Deploy** button in Coolify.

## Service Architecture

The application consists of 3 services:

1. **Redis** - Cache layer

   - Port: 6379 (internal)
   - Persistent storage with AOF

2. **Server** (Backend API)

   - Port: 3000
   - Node.js + Express + TypeScript
   - Healthcheck: `/api/v1/electricity/health`

3. **Client** (Frontend)
   - Port: 80
   - React + Vite (built to static files)
   - Served via Nginx

## Health Checks

All services have health checks configured:

- **Redis**: `redis-cli ping`
- **Server**: HTTP check on `/api/v1/electricity/health`
- **Client**: HTTP check on `/`

## Accessing the Application

After deployment:

- **Frontend**: `http://your-coolify-domain` (or assigned URL)
- **Backend API**: `http://your-coolify-domain:3000/api/v1/*`
- **Redis**: Internal only (not exposed)

## Logs

View logs in Coolify:

- Go to your service → **Logs** tab
- Each container (redis, server, client) has separate logs

## Troubleshooting

### Build Failures

If build fails, check:

1. Environment variables are set correctly
2. `ELECTRICITY_CREDENTIALS` is valid JSON
3. Build logs for specific errors

### Container Crashes

Check logs for:

1. Missing environment variables
2. Redis connection issues
3. Invalid credentials format

### Health Check Failures

- **Server**: Ensure port 3000 is accessible
- **Client**: Ensure nginx is serving files
- **Redis**: Check Redis is running

## Updating

To deploy updates:

1. Push changes to your repository
2. In Coolify, click **Redeploy**
3. Monitor deployment logs

## Rollback

If deployment fails:

1. Go to **Deployments** tab
2. Select a previous successful deployment
3. Click **Redeploy**

## Production Recommendations

1. **Use HTTPS**: Configure SSL in Coolify
2. **Set up monitoring**: Enable Coolify monitoring
3. **Backup Redis data**: Configure volume backups
4. **Rate limiting**: Already configured in server
5. **CORS**: Set proper ALLOWED_ORIGINS for your domain

## Architecture Diagram

```text
Internet
    │
    ├─> Nginx (Client - Port 80)
    │   └─> React App (Static Files)
    │
    └─> Express Server (Port 3000)
        └─> Redis (Port 6379 - Internal)
            └─> Persistent Storage
```

## Notes

- Client uses Nginx in production (not Vite dev server)
- Server runs compiled JavaScript (not ts-node)
- All services restart automatically on failure
- Redis data persists in Docker volume
