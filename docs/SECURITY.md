# Security Policy

This document outlines security practices, vulnerability reporting, and security considerations for Bill Barta.

## Supported Versions

| Version | Supported |
| ------- | :-------: |
| 1.x.x   |    ✅     |
| < 1.0   |    ❌     |

## Reporting a Vulnerability

If you discover a security vulnerability, please **DO NOT** create a public issue.

### Reporting Process

1. **Email** security concerns to the repository owner
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. **Expect** acknowledgment within 48 hours
4. **Cooperate** on the fix timeline

### What to Expect

- Acknowledgment within 48 hours
- Assessment within 1 week
- Fix timeline based on severity
- Credit in release notes (if desired)

## Security Architecture

### Authentication

```
┌─────────┐     ┌─────────┐     ┌─────────────┐
│ Browser │────▶│ Server  │────▶│   Google    │
│         │◀────│         │◀────│   OAuth     │
└─────────┘     └─────────┘     └─────────────┘
    │                │
    │ JWT Token      │ User Created
    ▼                ▼
┌─────────┐     ┌─────────┐
│ Client  │     │ auth.db │
│ Storage │     └─────────┘
└─────────┘
```

- **Google OAuth 2.0** for user authentication
- **JWT tokens** for session management
- **Stateless sessions** (no server-side session storage)
- **Token expiration** configurable (default: 7 days)

### Data Protection

```
┌─────────────────────────────────────────────┐
│                accounts.db                  │
├─────────────────────────────────────────────┤
│ Account                                      │
│ ├─ id (UUID)                                │
│ ├─ userId (string)                          │
│ ├─ provider (enum)                          │
│ └─ credentials (JSON)                       │
│     ├─ username (plaintext)                 │
│     ├─ password (AES encrypted) ──────────▶│ Encryption
│     └─ clientSecret (AES encrypted) ──────▶│ Service
└─────────────────────────────────────────────┘
```

- **AES-256 encryption** for sensitive credentials (passwords, client secrets)
- **Encryption key** stored in environment variable (not in code)
- **Credentials never returned** in API responses
- **Separate databases** for auth vs. application data

## Security Best Practices

### For Operators

1. **Use strong encryption key**

   ```bash
   # Generate 32+ character key
   openssl rand -base64 32
   ```

2. **Use strong JWT secret**

   ```bash
   # Generate 64+ character secret
   openssl rand -base64 64
   ```

3. **Enable HTTPS in production**
   - Use a reverse proxy (Nginx, Caddy)
   - Get SSL certificates (Let's Encrypt)

4. **Configure CORS properly**

   ```env
   ALLOWED_ORIGINS=https://your-domain.com
   ```

5. **Set production environment**

   ```env
   NODE_ENV=production
   ```

6. **Rate limiting**
   - Default: 10,000 requests per 15 minutes
   - Adjust based on your needs

7. **Regular updates**
   - Keep dependencies updated
   - Monitor security advisories

### For Developers

1. **Never commit secrets**
   - Use `.env` files (gitignored)
   - Use `.env.example` for templates

2. **Always validate input**
   - Use Zod schemas
   - Validate on server, never trust client

3. **Sanitize log output**

   ```typescript
   // ✅ Good
   const masked = token ? `****${token.slice(-4)}` : "none";
   logger.info(`Token suffix: ${masked}`);

   // ❌ Bad
   logger.info(`Token: ${token}`);
   ```

4. **Use parameterized queries**
   - TypeORM handles this automatically
   - Never concatenate user input in queries

5. **Check authorization**
   ```typescript
   // Always verify resource ownership
   const account = await this.repository.findById(id);
   if (account.userId !== requestingUserId) {
     throw new ApiError(403, "Access denied");
   }
   ```

## Security Controls

### Implemented

| Control                | Implementation                                        |
| ---------------------- | ----------------------------------------------------- |
| **Authentication**     | Google OAuth 2.0 + JWT                                |
| **Authorization**      | Per-request JWT validation, resource ownership checks |
| **Input Validation**   | Zod schemas on all endpoints                          |
| **Encryption at Rest** | AES-256 for sensitive fields                          |
| **Transport Security** | HTTPS recommended (production)                        |
| **Rate Limiting**      | Express rate limiter                                  |
| **Security Headers**   | Helmet middleware                                     |
| **CORS**               | Configurable allowed origins                          |
| **Error Handling**     | Centralized, sanitized error responses                |

### Environment-Specific

| Control                |    Development    |   Production    |
| ---------------------- | :---------------: | :-------------: |
| Default encryption key | Allowed (warning) | Blocked (error) |
| Debug logging          |      Enabled      |    Disabled     |
| Source maps            |      Enabled      |    Disabled     |
| Rate limits            |      Relaxed      |     Strict      |

## Common Security Considerations

### SQL Injection

**Risk**: Mitigated

TypeORM uses parameterized queries:

```typescript
// Safe - TypeORM parameterization
const account = await repo.findOne({ where: { id } });
```

### XSS (Cross-Site Scripting)

**Risk**: Mitigated

- React escapes output by default
- Helmet sets security headers
- No `dangerouslySetInnerHTML` usage

### CSRF (Cross-Site Request Forgery)

**Risk**: Mitigated

- JWT-based authentication (no cookies for auth)
- CORS configured to allow only specific origins

### Credential Theft

**Risk**: Mitigated

- Credentials encrypted at rest
- Never returned in API responses
- Encrypted before database storage

### Token Theft

**Risk**: Partially Mitigated

Mitigations:

- HTTPS in production
- Token expiration (configurable)
- Client-side storage in localStorage

Remaining Risk:

- Stateless JWT cannot be revoked server-side
- XSS could potentially access localStorage

### Server-Side Request Forgery (SSRF)

**Risk**: Limited

- External API calls go to known endpoints only (DPDC, NESCO, Telegram)
- No user-controlled URLs in requests

## Security Checklist

### Pre-Deployment

- [ ] Strong `ENCRYPTION_KEY` set (32+ chars)
- [ ] Strong `JWT_SECRET` set (64+ chars)
- [ ] `NODE_ENV=production`
- [ ] HTTPS configured
- [ ] `ALLOWED_ORIGINS` configured
- [ ] Rate limiting enabled
- [ ] Database files have proper permissions
- [ ] `.env` files not in version control

### Ongoing

- [ ] Regular dependency updates
- [ ] Monitor error logs for anomalies
- [ ] Backup databases regularly
- [ ] Review access logs periodically
- [ ] Test recovery procedures

## Incident Response

### If Encryption Key is Compromised

1. Generate new encryption key
2. Stop the server
3. Decrypt existing credentials with old key
4. Re-encrypt with new key
5. Update environment variables
6. Restart server
7. Invalidate any cached data

### If JWT Secret is Compromised

1. Generate new JWT secret
2. Update environment variables
3. Restart server
4. All existing tokens become invalid (users must re-login)

### If Database is Compromised

1. Assess extent of breach
2. If `accounts.db`: credentials are encrypted, but rotate them
3. If `auth.db`: user profiles exposed, notify affected users
4. Investigate breach vector
5. Remediate and document

## Compliance Notes

This application is designed for personal use. For enterprise deployment, consider:

- Data retention policies
- GDPR compliance (if applicable)
- Audit logging
- Penetration testing
- Security certifications
