# Frontend Agent Documentation

## Project Overview
React + TypeScript frontend application for Bill Barta. Built with Vite, styled with Tailwind CSS 4 + shadcn/ui, and uses Google OAuth authentication with JWT tokens. Provides a dashboard for viewing electricity balances, managing accounts, and configuring Telegram notifications.

## Tech Stack
- React 19, TypeScript
- Vite (with SWC plugin)
- Tailwind CSS 4 + shadcn/ui (Radix primitives)
- TanStack Query (React Query) for server state
- React Router for navigation
- React Hook Form + Zod for form validation
- Framer Motion for animations
- Axios for HTTP requests
- Sonner for toast notifications
- Lucide React for icons

## Project Structure
```
client/src/
├── App.tsx                          # Root component (providers wrapper)
├── main.tsx                         # Entry point (ReactDOM render)
├── common/
│   ├── apis/
│   │   ├── accounts.api.ts          # Account CRUD + nickname API calls
│   │   ├── auth.api.ts              # Auth API (getCurrentUser)
│   │   ├── electricity.api.ts       # Electricity usage data fetching
│   │   ├── notificationSettings.api.ts # Telegram settings API
│   │   └── telegram.api.ts          # Send balances API
│   ├── constants/                   # App-wide constants (4 files)
│   ├── hooks/                       # Custom hooks (2 files)
│   └── types/                       # TypeScript type definitions
├── components/
│   ├── auth/
│   │   ├── GoogleLoginButton.tsx    # "Sign in with Google" button
│   │   ├── ProtectedRoute.tsx       # Redirects unauthenticated users to /login
│   │   └── PublicOnlyRoute.tsx      # Redirects authenticated users away from /login
│   ├── layout/
│   │   ├── mainLayout.tsx           # App shell with Outlet
│   │   └── UserMenu.tsx             # User avatar + dropdown (profile, logout)
│   ├── partials/
│   │   ├── animatedLogo/            # Animated Bill Barta logo
│   │   ├── appLoader/               # App loading spinner
│   │   ├── errorBoundary/           # React error boundary
│   │   ├── errorCard/               # Error display card
│   │   ├── multiSelect/             # Multi-select component
│   │   ├── navbar/                  # Navigation bar (3 files)
│   │   └── typography/              # Text components (3 files)
│   ├── test/                        # Test components (2 files)
│   └── ui/                          # shadcn/ui components (28 components)
├── context/
│   ├── AuthContext.tsx              # Auth state: user, token, login(), logout(), isAuthenticated, isLoading
│   └── PreferenceContext.tsx        # User preferences
├── features/
│   ├── accountBalance/
│   │   ├── components/              # Balance display cards (6 components)
│   │   ├── constants/               # Feature-specific constants
│   │   ├── hooks/                   # Data fetching hooks
│   │   ├── utils/                   # Balance formatting utilities
│   │   └── index.tsx                # Feature composition
│   ├── accountManagement/
│   │   ├── components/              # Account CRUD components (5 components)
│   │   ├── hooks/                   # Account management hooks
│   │   └── index.tsx                # Feature composition
│   └── home/
│       └── index.tsx                # Home page content
├── lib/
│   ├── axios.ts                     # Axios instance with JWT interceptor + 401 handling
│   └── cache.ts                     # localStorage cache service (get/set/clear with TTL)
├── pages/
│   ├── LoginPage.tsx                # Public login page with Google sign-in
│   ├── AuthCallbackPage.tsx         # Receives JWT from OAuth redirect, calls login()
│   ├── home.page.tsx                # Home page wrapper
│   ├── accountManagement.page.tsx   # Account management page wrapper
│   └── error.page.tsx               # Generic error page (401/403/404)
├── providers/                       # React context providers (4 files)
├── routes/
│   ├── routes.tsx                   # Router creation (createBrowserRouter)
│   ├── public.route.tsx             # Protected routes: /, /accounts + error pages
│   ├── auth.route.tsx               # Auth routes: /login, /auth/callback
│   ├── notFound.route.tsx           # 404 catch-all
│   └── paths/                       # Path constants
└── styles/                          # Global CSS styles
```

## Authentication Flow

1. User clicks "Sign in with Google" (`GoogleLoginButton`)
2. Browser redirects to `${VITE_BACKEND_URL}/api/v1/auth/google`
3. Server handles Google OAuth and redirects to `/auth/callback?token=<jwt>`
4. `AuthCallbackPage` extracts token from URL, calls `login(token)` on `AuthContext`
5. `AuthContext` stores token in `localStorage` as `auth_token`, fetches user data from `/api/v1/auth/me`
6. User is redirected to home page

**Logout:** Clears all `localStorage` data (token + cached data) to prevent data leak between users.

## Routing

| Path | Route Type | Component | Auth Required |
|------|-----------|-----------|:---:|
| `/` | Protected | `HomePage` | ✅ |
| `/accounts` | Protected | `AccountManagementPage` | ✅ |
| `/login` | Public-only | `LoginPage` | ❌ (redirects if authenticated) |
| `/auth/callback` | Auth | `AuthCallbackPage` | ❌ |
| `/unauthorized` | Public | `ErrorPage` (401) | ❌ |
| `/forbidden` | Public | `ErrorPage` (403) | ❌ |
| `*` | Public | 404 Not Found | ❌ |

## Key Components

### AuthContext (`context/AuthContext.tsx`)
- `user`: Current user object `{ userId, email }` or `null`
- `token`: JWT token string or `null`
- `login(token)`: Stores token, fetches user from `/me`
- `logout()`: Clears all localStorage, resets state
- `isAuthenticated`: Boolean
- `isLoading`: True during initialization

### Axios Instance (`lib/axios.ts`)
- Base URL from `VITE_BACKEND_URL` + `VITE_BACKEND_API_PATH`
- **Request interceptor**: Adds `Authorization: Bearer <token>` from localStorage
- **Response interceptor**: On 401, clears auth and redirects to `/login`

### Cache Service (`lib/cache.ts`)
- `get(key)`: Returns cached data if not expired
- `set(key, data, ttlMs)`: Stores data with expiration
- `clear()`: Removes all cached entries
- TTL: 24 hours default

## Environment Variables

```
CLIENT_PORT=5173
VITE_BACKEND_URL=http://localhost:3000
VITE_BACKEND_API_PATH=/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

All Vite env vars must be prefixed with `VITE_`.

## Development Commands
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (port 5173)
npm run start:dev    # Start with --host 0.0.0.0 (Docker)
npm run build        # Production build (tsc + vite build)
npm run preview      # Preview production build
npm run lint         # ESLint
```

## Key Patterns

1. **Feature-based architecture**: Each feature (`accountBalance`, `accountManagement`) co-locates components, hooks, constants, and utils.
2. **API clients in `common/apis/`**: All API calls centralized, using the shared Axios instance.
3. **shadcn/ui components in `components/ui/`**: 28 reusable UI primitives. Install new ones via `npx shadcn-ui add <component>`.
4. **Path alias**: `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).
5. **TanStack Query**: Used for all server data fetching with automatic caching, refetching, and loading states.
6. **React Hook Form + Zod**: Form validation for account management.
7. **Framer Motion**: Page transitions and micro-animations.

## Known Issues & Fixes

### Triple Toast on Login
**Problem**: Success toast appears three times after login.
**Fix**: Use a `ref` to track if login has been initiated, preventing multiple `useEffect` executions.

### Stale Data After Logout
**Problem**: Previous user's cached data visible after re-login.
**Fix**: `logout()` clears all `localStorage` data, not just the auth token.
