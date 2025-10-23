# Bill Barta Docker Configuration

## Centralized Environment Variables

All environment variables are now managed from a single location: **`docker/.env`**

### Setup

1. Copy the example environment file:

   ```bash
   cd docker
   cp .env.example .env
   ```

2. Update `.env` with your actual values:

   - `DPDC_CLIENT_SECRET`: Your DPDC client secret
   - `VITE_ELECTRICITY_CREDENTIALS`: Your electricity account credentials
   - `TELEGRAM_BOT_TOKEN` & `TELEGRAM_CHAT_ID`: (Optional) For Telegram notifications
   - `ELECTRICITY_CREDENTIALS`: (Optional) For server-side Telegram reports

3. Start the application:
   ```bash
   docker-compose up -d
   ```

### Running Without Docker

If you want to run the server or client locally (without Docker):

**Server:**

```bash
cd server
# Create a symlink to the docker .env file (or copy it)
# On Windows (PowerShell as Admin):
New-Item -ItemType SymbolicLink -Path ".env" -Target "..\docker\.env"
# On Linux/Mac:
ln -s ../docker/.env .env

npm run start:dev
```

**Client:**

```bash
cd client
# Create a symlink to the docker .env file (or copy it)
# On Windows (PowerShell as Admin):
New-Item -ItemType SymbolicLink -Path ".env" -Target "..\docker\.env"
# On Linux/Mac:
ln -s ../docker/.env .env

npm run dev
```

### Benefits

- ✅ **Single source of truth** - All environment variables in one place
- ✅ **No duplication** - No need to maintain multiple `.env` files
- ✅ **Easier management** - Update once, applies everywhere
- ✅ **Docker-first** - Optimized for containerized deployment
- ✅ **Local development support** - Can still run services individually

### Environment Variable Groups

- **Project**: `PROJECT_NAME`, `NODE_ENV`
- **Ports**: `PORT`, `CLIENT_PORT`, `REDIS_PORT`
- **Redis**: `REDIS_HOST`, `REDIS_PASSWORD`, `REDIS_TTL`
- **CORS**: `FRONTEND_URL`
- **Client**: `VITE_BACKEND_API_PATH`, `VITE_ELECTRICITY_CREDENTIALS`
- **Providers**: `DPDC_CLIENT_SECRET`
- **Telegram**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ELECTRICITY_CREDENTIALS`
- **Logging**: `ENABLE_LATENCY_LOGGER`

### Notes

- Client environment variables must be prefixed with `VITE_` to be accessible in the browser
- The docker-compose file uses `env_file: .env` to load all variables
- Redis connection defaults are overridden in docker-compose for container networking
