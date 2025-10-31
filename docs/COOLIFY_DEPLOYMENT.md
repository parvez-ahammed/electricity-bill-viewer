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
# Encryption Key for Database Security (Required for production)
# Generate a strong random key for production: openssl rand -base64 32
ENCRYPTION_KEY=your-super-secret-encryption-key-change-this-in-production

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

3. **Client** (Frontend)
   - Port: 80
   - React + Vite (built to static files)
   - Served via Nginx

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
2. Build logs for specific errors

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

1. Push changes to your repository or In Coolify, click **Redeploy**
2. Monitor deployment logs

## Rollback

If deployment fails:

1. Go to **Deployments** tab
2. Select a previous successful deployment
3. Click **Redeploy**

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
