# Caching Strategy

Bill Barta uses a two-tier caching strategy: **Redis** on the server and **localStorage** on the client.

## Server-Side (Redis)

The `RedisCacheService` manages all server-side caching. Configuration is loaded from environment variables.

### Configuration

| Setting | Default | Env Variable | Description |
|---------|---------|-------------|-------------|
| Host | `localhost` | `REDIS_HOST` | Redis server hostname |
| Port | `6379` | `REDIS_PORT` | Redis server port |
| Password | _(none)_ | `REDIS_PASSWORD` | Optional authentication |
| TTL | `86400` (24h) | `REDIS_TTL` | Default cache entry TTL in seconds |
| Max Memory | `256mb` | _(Redis config)_ | Memory limit |
| Eviction Policy | `allkeys-lru` | _(Redis config)_ | LRU eviction when memory full |
| Persistence | AOF enabled | _(Redis config)_ | Append-only file for durability |

### Cache Behavior

- Electricity data is cached per credential set
- Cached responses are returned on subsequent requests within TTL
- **Bypass cache** by sending `x-skip-cache: true` header
- The scheduled daily Telegram notification always bypasses cache (`skipCache = true`)

### Graceful Fallback

If Redis is unavailable, the server continues to operate without caching — requests are served directly from provider APIs.

## Client-Side (localStorage)

The frontend `cache.ts` service stores data in the browser's localStorage.

### Format

```typescript
{
  data: any,        // Cached response payload
  timestamp: number, // When the data was cached (ms since epoch)
  expiresAt: number  // Expiration time (ms since epoch)
}
```

### Behavior

- **TTL:** 24 hours
- **Auto-cleanup:** Expired entries are cleaned on manual refresh
- **Cache invalidation:** All cached data is cleared on user logout to prevent data leak between users

## Cache Bypass

| Method | Where | How |
|--------|-------|-----|
| **API header** | Server | `x-skip-cache: true` request header |
| **Manual refresh** | Client | User clicks the refresh button in the UI |
| **Scheduled tasks** | Server | Scheduler always sets `skipCache = true` |
| **Logout** | Client | Clears all localStorage data |
