# Installation Guide

This guide covers all installation methods for Bill Barta.

## Prerequisites

### Required

| Requirement    | Version | Purpose                       |
| -------------- | ------- | ----------------------------- |
| Node.js        | 22+     | Runtime for development       |
| npm            | 10+     | Package management            |
| Docker         | 24+     | Container runtime             |
| Docker Compose | 2.20+   | Multi-container orchestration |

### Optional

| Requirement | Purpose                              |
| ----------- | ------------------------------------ |
| Redis       | Caching (included in Docker Compose) |
| Git         | Version control                      |
| OpenSSL     | Generating encryption keys           |

### External Services

| Service              | Required | Purpose                  |
| -------------------- | :------: | ------------------------ |
| Google Cloud Console |   Yes    | OAuth 2.0 credentials    |
| Telegram Bot         |    No    | Notification integration |

## Quick Installation (Docker)

### 1. Clone the Repository

```bash
git clone https://github.com/parvez-ahammed/electricity-bill-viewer.git
cd electricity-bill-viewer
```

### 2. Copy Environment Files

```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Generate Encryption Key

```bash
# Generate a secure 32-character key
openssl rand -base64 32
```

Add the generated key to both `.env` and `server/.env`:

```env
ENCRYPTION_KEY=your_generated_key_here
```

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/v1/auth/google/callback`
7. Copy the Client ID and Client Secret

Add to `server/.env`:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
```

### 5. Configure JWT Secret

Generate a secure JWT secret:

```bash
openssl rand -base64 64
```

Add to `server/.env`:

```env
JWT_SECRET=your_jwt_secret_here
```

### 6. Start the Application

```bash
docker compose up -d --build
```

### 7. Verify Installation

| Service | URL                          | Expected                  |
| ------- | ---------------------------- | ------------------------- |
| Client  | http://localhost:5173        | Login page                |
| Server  | http://localhost:3000/api/v1 | 404 (root has no handler) |
| Redis   | localhost:6379               | Connected                 |

## Local Development (Without Docker)

### 1. Clone and Setup

```bash
git clone https://github.com/parvez-ahammed/electricity-bill-viewer.git
cd electricity-bill-viewer
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Setup Environment Files

Follow steps 2-5 from Quick Installation above.

### 4. Start Redis (Optional)

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:7.4-alpine

# Or install locally (varies by OS)
```

### 5. Start the Server

```bash
cd server
npm run start:dev
```

### 6. Start the Client

In a new terminal:

```bash
cd client
npm run dev
```

## Production Deployment

### Using docker-compose.prod.yml

```bash
# Build and start production containers
docker compose -f docker-compose.prod.yml up -d --build
```

### Production Environment Variables

Ensure these are set for production:

| Variable              | Production Value        |
| --------------------- | ----------------------- |
| `NODE_ENV`            | `production`            |
| `FRONTEND_URL`        | Your production domain  |
| `GOOGLE_REDIRECT_URI` | Production callback URL |
| `ALLOWED_ORIGINS`     | Production domain(s)    |
| `ENCRYPTION_KEY`      | Unique secure key       |
| `JWT_SECRET`          | Unique secure key       |

### Database Setup

The application uses SQLite, which auto-initializes on first run. For production:

1. Ensure the `server/data/` directory exists and is writable
2. Consider setting up regular backups of `accounts.db` and `auth.db`
3. The database files will be created automatically

### Backup Strategy

```bash
# Backup databases
cp server/data/accounts.db server/data/accounts.db.backup
cp server/data/auth.db server/data/auth.db.backup

# Or use Docker volumes
docker run --rm -v bill-barta_server-data:/data -v $(pwd):/backup alpine \
    tar cvf /backup/server-data-backup.tar /data
```

## Coolify Deployment

See [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) for detailed Coolify-specific instructions.

## Environment Configuration Reference

### Root `.env`

```env
PROJECT_NAME=bill-barta
SERVER_PORT=3000
CLIENT_PORT=5173
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_TTL=86400
ENCRYPTION_KEY=your_encryption_key_here
```

### Server `.env`

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your_encryption_key_here
TELEGRAM_BOT_TOKEN=optional_telegram_token
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=86400
```

### Client `.env`

```env
CLIENT_PORT=5173
VITE_BACKEND_URL=http://localhost:3000
VITE_BACKEND_API_PATH=/api/v1
VITE_GOOGLE_CLIENT_ID=your_client_id
```

## Troubleshooting Installation

### Docker Issues

**Container won't start:**

```bash
# Check logs
docker compose logs -f

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

**Port conflicts:**

```bash
# Change ports in .env
SERVER_PORT=3001
CLIENT_PORT=5174
```

### Node.js Issues

**Module not found:**

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**

```bash
# Rebuild
npm run build
```

### Database Issues

**Database corrupted:**

```bash
# Remove and recreate (WARNING: data loss)
rm server/data/*.db
# Restart server - databases will be recreated
```

### Authentication Issues

**OAuth redirect error:**

- Verify `GOOGLE_REDIRECT_URI` matches Google Console exactly
- Check `FRONTEND_URL` is correct
- Ensure no trailing slashes

**JWT errors:**

- Regenerate `JWT_SECRET`
- Clear browser localStorage
- Check token expiration

## Verification Checklist

After installation, verify:

- [ ] Client loads at http://localhost:5173
- [ ] Google login button appears
- [ ] Google OAuth flow completes
- [ ] Redirected back to app after login
- [ ] Account management page accessible
- [ ] Can add a test account
- [ ] Balance fetching works
- [ ] Logout works properly
