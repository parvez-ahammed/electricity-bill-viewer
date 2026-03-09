# Troubleshooting Guide

This guide covers common issues and their solutions for Bill Barta.

## Quick Diagnostics

### Check System Status

```bash
# Check Docker containers
docker compose ps

# Check server logs
docker compose logs server

# Check client logs
docker compose logs client

# Check Redis
docker compose logs redis
```

### Verify Configuration

```bash
# Check environment variables loaded
docker compose exec server printenv | grep -E "^(NODE_ENV|PORT|REDIS)"

# Test Redis connection
docker compose exec redis redis-cli PING
```

---

## Installation Issues

### Docker: `docker compose up` fails

**Symptom**: Containers fail to start or crash immediately.

**Solutions**:

1. **Check Docker resources**

   ```bash
   docker system df
   docker system prune -a  # Clean up (warning: removes images)
   ```

2. **Check port conflicts**

   ```bash
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :5173

   # Linux/Mac
   lsof -i :3000
   lsof -i :5173
   ```

3. **Rebuild from scratch**
   ```bash
   docker compose down -v
   docker compose up -d --build
   ```

### npm install fails

**Symptom**: Dependency installation errors.

**Solutions**:

1. **Clear npm cache**

   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Node version mismatch**

   ```bash
   node --version  # Should be 22+
   nvm use 22
   ```

3. **Permission issues (Linux/Mac)**
   ```bash
   sudo chown -R $USER:$USER node_modules
   ```

---

## Authentication Issues

### Google OAuth redirect error

**Symptom**: "redirect_uri_mismatch" error from Google.

**Solutions**:

1. **Verify redirect URI matches exactly**
   - Check `server/.env`: `GOOGLE_REDIRECT_URI`
   - Check Google Cloud Console: Authorized redirect URIs
   - Must match exactly, including protocol and port

2. **Common mistakes**:
   ```
   ❌ http://localhost:3000/api/v1/auth/google/callback/
   ✅ http://localhost:3000/api/v1/auth/google/callback
   ```

### JWT token invalid

**Symptom**: 401 errors after successful login.

**Solutions**:

1. **Check JWT secret consistency**

   ```bash
   # Ensure same secret in all environments
   grep JWT_SECRET server/.env
   ```

2. **Clear browser storage**

   ```javascript
   // In browser console
   localStorage.clear();
   ```

3. **Regenerate JWT secret**
   ```bash
   openssl rand -base64 64
   # Update server/.env and restart
   ```

### Login loop

**Symptom**: Keeps redirecting to login after authenticating.

**Solutions**:

1. **Check FRONTEND_URL**

   ```env
   FRONTEND_URL=http://localhost:5173  # No trailing slash
   ```

2. **Check browser cookies/storage enabled**

3. **Check for CORS errors** in browser console

---

## API Issues

### 401 Unauthorized on all requests

**Symptom**: All API calls return 401.

**Solutions**:

1. **Check token in request**

   ```javascript
   // Browser console
   localStorage.getItem("auth_token");
   ```

2. **Verify token format**

   ```
   Authorization: Bearer <token>
   ```

3. **Check server logs for JWT errors**
   ```bash
   docker compose logs server | grep -i jwt
   ```

### 404 Not Found

**Symptom**: Endpoint returns 404.

**Solutions**:

1. **Verify endpoint path**
   - All routes are under `/api/v1`
   - Check for typos

2. **Check route registration**
   ```bash
   # List all routes
   grep -r "router\." server/src/routes/
   ```

### 429 Rate Limited

**Symptom**: Too many requests error.

**Solutions**:

1. **Wait for rate limit window** (default: 15 minutes)

2. **Increase limits** (development only)
   ```env
   RATE_LIMIT_MAX=100000
   RATE_LIMIT_WINDOW_MS=900000
   ```

---

## Database Issues

### Database file not found

**Symptom**: Server crashes with "no such table" or database errors.

**Solutions**:

1. **Check data directory exists**

   ```bash
   ls -la server/data/
   ```

2. **Let server create databases**
   - Remove existing (corrupted) files
   - Restart server
   - Databases auto-create

### Corrupted account (decryption fails)

**Symptom**: "Decryption failed" errors for specific accounts.

**Solutions**:

1. **Force delete the corrupted account**

   ```bash
   curl -X DELETE http://localhost:3000/api/v1/accounts/<id>/force \
     -H "Authorization: Bearer <token>"
   ```

2. **Re-add the account** through the UI

### Encryption key changed

**Symptom**: All accounts fail to decrypt.

**Solutions**:

1. **Restore original encryption key**
   - Check backups for old `.env`

2. **If key is lost**: Delete all accounts and re-add
   ```bash
   # WARNING: Data loss
   rm server/data/accounts.db
   # Restart server, re-add accounts
   ```

---

## Provider Issues

### DPDC: Login failed

**Symptom**: DPDC account shows login failed.

**Solutions**:

1. **Verify credentials**
   - Test manually on DPDC website
   - Check username/password correct

2. **Verify client secret**
   - See [DPDC_SETUP.md](./DPDC_SETUP.md) for finding client secret
   - Client secret may change periodically

3. **Check DPDC service status**
   - May be temporarily unavailable

### NESCO: Data fetch failed

**Symptom**: NESCO account fails to load data.

**Solutions**:

1. **Verify customer number**
   - Should be the full customer number from your bill

2. **Check NESCO portal availability**
   - Try accessing https://nesco.gov.bd directly

3. **CSRF token issues**
   - Temporary; retry later

---

## Caching Issues

### Stale data (not refreshing)

**Symptom**: Balance doesn't update even after payment.

**Solutions**:

1. **Manual cache bypass**
   - Click refresh button in UI
   - Or use `x-skip-cache: true` header

2. **Clear Redis cache**

   ```bash
   docker compose exec redis redis-cli FLUSHALL
   ```

3. **Clear browser cache**
   ```javascript
   // Browser console
   localStorage.clear();
   ```

### Redis connection failed

**Symptom**: Redis errors in logs.

**Solutions**:

1. **Check Redis is running**

   ```bash
   docker compose ps redis
   ```

2. **Check Redis host configuration**

   ```env
   REDIS_HOST=redis  # In Docker
   REDIS_HOST=localhost  # Without Docker
   ```

3. **Server continues without Redis** (graceful degradation)

---

## Telegram Issues

### Notifications not sent

**Symptom**: Telegram notifications never arrive.

**Solutions**:

1. **Check bot token**

   ```env
   TELEGRAM_BOT_TOKEN=123456:ABC...
   ```

2. **Check chat ID configured**
   - Via UI: Notification settings
   - Via API: GET `/api/v1/notification-settings/telegram`

3. **Test manually**

   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=test"
   ```

4. **Start conversation with bot**
   - User must send a message to the bot first

### Scheduler not running

**Symptom**: Automated daily reports not happening.

**Solutions**:

1. **Verify bot token is set**
   - Scheduler only starts if `TELEGRAM_BOT_TOKEN` is set

2. **Check server logs**

   ```bash
   docker compose logs server | grep -i scheduler
   ```

3. **Restart server**
   ```bash
   docker compose restart server
   ```

---

## Frontend Issues

### Blank page after build

**Symptom**: Production build shows blank page.

**Solutions**:

1. **Check browser console** for errors

2. **Verify VITE_BACKEND_URL**

   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

3. **Rebuild client**
   ```bash
   cd client
   npm run build
   ```

### API calls failing (CORS)

**Symptom**: CORS errors in browser console.

**Solutions**:

1. **Check ALLOWED_ORIGINS**

   ```env
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

2. **Include correct protocol and port**

3. **Restart server** after changing CORS config

### Components not rendering

**Symptom**: UI elements missing or broken.

**Solutions**:

1. **Clear browser cache** (Ctrl+Shift+Delete)

2. **Check React DevTools** for errors

3. **Rebuild node_modules**
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## Performance Issues

### Slow API responses

**Symptom**: API calls take several seconds.

**Solutions**:

1. **Check Redis is working** (caching)

   ```bash
   docker compose exec redis redis-cli PING
   ```

2. **Check external API status**
   - DPDC/NESCO may be slow

3. **Check server resources**
   ```bash
   docker stats
   ```

### High memory usage

**Symptom**: Containers using excessive memory.

**Solutions**:

1. **Check for memory leaks**

   ```bash
   docker compose logs server | grep -i memory
   ```

2. **Restart containers**

   ```bash
   docker compose restart
   ```

3. **Adjust Docker resource limits** in `docker-compose.yml`

---

## Getting Help

If you can't resolve an issue:

1. **Check existing issues** on GitHub
2. **Collect diagnostic info**:
   - Error messages
   - Server logs
   - Browser console output
   - Steps to reproduce
3. **Create an issue** with the collected information

### Useful Commands

```bash
# Full diagnostic dump
echo "=== Docker Status ===" && docker compose ps
echo "=== Server Logs ===" && docker compose logs --tail=50 server
echo "=== Client Logs ===" && docker compose logs --tail=50 client
echo "=== Redis Status ===" && docker compose exec redis redis-cli INFO
```
