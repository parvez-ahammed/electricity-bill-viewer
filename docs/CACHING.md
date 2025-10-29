# Caching Strategy

## Server-side (Redis)

- **TTL:** 24 hours per credential
- **Eviction:** LRU policy
- **Bypass:** Send `x-skip-cache: true` header

## Client-side (localStorage)

- **TTL:** 24 hours
- **Format:** `{ data, timestamp, expiresAt }`
- **Auto-cleanup:** On manual refresh

See the main README for a summary. For advanced cache configuration, see the codebase.
