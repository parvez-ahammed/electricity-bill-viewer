# Authentication

Bill Barta uses **Google OAuth 2.0** for user authentication with **JWT tokens** for session management.

## Overview

- Users authenticate exclusively via Google sign-in
- User data is stored in a separate `auth.db` SQLite database
- JWT tokens are issued on successful login and used for all subsequent API requests
- The frontend stores the JWT in `localStorage` and attaches it to every request via an Axios interceptor

## Google OAuth 2.0 Flow

```text
┌──────────┐    ①     ┌──────────┐    ②     ┌──────────────┐
│  Client   │ ──────→ │  Server   │ ──────→ │    Google     │
│ (Browser) │         │ /auth/    │         │ OAuth 2.0    │
│           │         │  google   │         │              │
│           │ ←────── │           │ ←────── │              │
│           │    ⑤    │ /auth/    │    ④    │              │
│           │         │ google/   │         │              │
│           │         │ callback  │         │              │
└──────────┘         └──────────┘         └──────────────┘
```

1. Client redirects to `GET /api/v1/auth/google`
2. Server generates Google OAuth URL and redirects user to Google
3. User authenticates with their Google account
4. Google redirects to `GET /api/v1/auth/google/callback?code=<auth_code>`
5. Server exchanges code for Google tokens, fetches user profile, finds/creates user in `auth.db`, generates JWT, and redirects to `${FRONTEND_URL}/auth/callback?token=<jwt>`

## JWT Tokens

### Token Contents

| Claim | Description |
|-------|-------------|
| `userId` | User's Google ID (primary key) |
| `email` | User's Google email |

### Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `JWT_SECRET` | _(required)_ | Secret key for signing tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |

### Token Lifecycle

- **Issued** on successful Google OAuth callback
- **Verified** by `AuthMiddleware` on every protected route
- **Stored** in `localStorage` as `auth_token` on the frontend
- **Attached** to requests via Axios request interceptor (`Authorization: Bearer <token>`)
- **Invalidated** client-side on logout (token removed from `localStorage`)
- **Stateless** — tokens cannot be revoked server-side

## Database Schema

### User Entity (`auth.db`)

```typescript
@Entity('users')
class User {
    @PrimaryColumn()
    id: string;         // Google ID

    @Column()
    name: string;       // Google display name

    @Column({ unique: true })
    email: string;      // Google email

    @CreateDateColumn()
    createdAt: Date;
}
```

> The `auth.db` is completely separate from `accounts.db` which stores encrypted provider credentials. The `userId` field in `Account` and `TelegramNotificationSettings` entities references `User.id` but is stored as a plain string (no foreign key constraint across databases).

## Server-Side Components

| Component | File | Role |
|-----------|------|------|
| `AuthController` | `controllers/v1/AuthController.ts` | Handles OAuth routes and user info |
| `AuthService` | `services/implementations/AuthService.ts` | OAuth flow logic, JWT generation, user management |
| `JwtService` | `services/implementations/JwtService.ts` | JWT sign, verify, decode operations |
| `AuthMiddleware` | `middlewares/AuthMiddleware.ts` | Extracts & verifies JWT from `Authorization` header |
| `UserRepository` | `repositories/UserRepository.ts` | User CRUD in `auth.db` |
| `User` | `entities/User.ts` | TypeORM entity |

## Client-Side Components

| Component | File | Role |
|-----------|------|------|
| `AuthContext` | `context/AuthContext.tsx` | Global auth state: `user`, `token`, `login()`, `logout()`, `isAuthenticated`, `isLoading` |
| `GoogleLoginButton` | `components/auth/GoogleLoginButton.tsx` | "Sign in with Google" button |
| `ProtectedRoute` | `components/auth/ProtectedRoute.tsx` | Redirects unauthenticated users to login |
| `PublicOnlyRoute` | `components/auth/PublicOnlyRoute.tsx` | Redirects authenticated users away from login |
| `AuthCallbackPage` | `pages/AuthCallbackPage.tsx` | Receives JWT from OAuth redirect and calls `login(token)` |
| `LoginPage` | `pages/LoginPage.tsx` | Public login page with Google sign-in |
| Axios interceptor | `lib/axios.ts` | Adds Bearer token to requests, handles 401 by clearing auth |

## Environment Variables

### Server

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Client

```bash
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_BACKEND_URL=http://localhost:3000
```

## Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Create **OAuth 2.0 Client ID** (Web application type)
5. Add authorized redirect URI: `http://localhost:3000/api/v1/auth/google/callback`
6. Copy the **Client ID** and **Client Secret** to your `.env` files

> ⚠️ The redirect URI in Google Console must **exactly** match `GOOGLE_REDIRECT_URI` in your server `.env`.

## Security Considerations

1. **Use HTTPS** in production for all OAuth redirects
2. **Rotate JWT_SECRET** if compromised — this will invalidate all existing tokens
3. **Keep token expiration short** — default is 7 days; consider shorter for sensitive deployments
4. **CORS** is configured to only allow requests from `FRONTEND_URL` / `ALLOWED_ORIGINS`
5. **OAuth scopes** are limited to `profile` and `email` only
