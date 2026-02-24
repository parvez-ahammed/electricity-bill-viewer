# Frontend Agent Documentation

## Project Overview
This is a React + TypeScript frontend application using Vite as the build tool. The application implements Google OAuth authentication with JWT tokens and provides a user interface for managing electricity bill payments.

## Tech Stack
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- TanStack Query (React Query) for data fetching
- Axios for HTTP requests
- Tailwind CSS + shadcn/ui for styling
- Sonner for toast notifications
- Zustand for state management (preferences)

## Project Structure
```
client/
├── src/
│   ├── common/
│   │   ├── apis/          # API client functions
│   │   ├── constants/     # App-wide constants
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript type definitions
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── layout/        # Layout components (Header, UserMenu)
│   │   ├── partials/      # Reusable partial components
│   │   └── ui/            # shadcn/ui components
│   ├── context/
│   │   ├── AuthContext.tsx       # Authentication state management
│   │   └── PreferenceContext.tsx # User preferences
│   ├── lib/
│   │   ├── axios.ts       # Axios instance with interceptors
│   │   └── cache.ts       # LocalStorage cache service
│   ├── pages/             # Page components
│   ├── providers/         # React context providers
│   └── routes/            # Route definitions
├── public/                # Static assets
└── dist/                  # Build output
```

## Authentication Flow
1. User clicks "Sign in with Google" button
2. Redirects to backend `/api/v1/auth/google`
3. Backend handles Google OAuth and redirects to `/auth/callback?token=<jwt>`
4. Frontend AuthCallbackPage receives token and calls `login(token)`
5. AuthContext stores token in localStorage and fetches user data
6. User is redirected to home page

## Key Components

### AuthContext (`src/context/AuthContext.tsx`)
Manages authentication state across the application:
- `user`: Current user object (userId, email)
- `token`: JWT token string
- `login(token)`: Authenticates user with JWT token
- `logout()`: Clears authentication state
- `isAuthenticated`: Boolean flag
- `isLoading`: Loading state during initialization

### Axios Instance (`src/lib/axios.ts`)
Configured with interceptors:
- Request interceptor: Adds Bearer token to all requests
- Response interceptor: Handles 401 errors by clearing auth and redirecting to login

### Cache Service (`src/lib/cache.ts`)
Manages localStorage operations for:
- User preferences
- Other cached data

## Environment Variables
Required in `.env`:
```
VITE_BACKEND_URL=http://localhost:3000
VITE_BACKEND_API_URL=http://localhost:3000/api/v1
```

## Known Issues & Fixes

### Issue 1: Triple Toast Notification on Login
**Problem**: After successful login, the success toast appears three times.

**Root Cause**: The useEffect in AuthCallbackPage has dependencies that cause it to re-run multiple times, triggering the login flow repeatedly.

**Solution**: Add a ref to track if login has been initiated to prevent multiple executions.

### Issue 2: Previous User Data Persists After Logout
**Problem**: When a user logs out and another user logs in, the previous user's cached data is still visible.

**Root Cause**: The logout function only removes the `auth_token` from localStorage but doesn't clear other cached data like preferences or API cache.

**Solution**: Clear all localStorage data on logout to ensure no user data persists.

## Development Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## API Integration
All API calls go through the axios instance which:
- Automatically adds JWT token from localStorage
- Handles 401 responses by clearing auth
- Supports cache control with `x-skip-cache` header

## State Management
- **Authentication**: React Context (AuthContext)
- **Preferences**: Zustand store (PreferenceContext)
- **Server State**: TanStack Query for data fetching and caching

## Routing
- Public routes: `/login`, `/signup`
- Protected routes: `/`, `/dashboard`, etc.
- Auth callback: `/auth/callback` (handles OAuth redirect)

## Best Practices
1. Use the `useAuth()` hook to access authentication state
2. Use TanStack Query for all server data fetching
3. Follow the existing component structure (ui components in `components/ui`)
4. Use TypeScript types from `common/types`
5. Keep API calls in `common/apis` directory
6. Use the cache service for localStorage operations

## Testing
- Run tests with appropriate test commands
- Ensure authentication flows work correctly
- Test logout clears all user data
- Verify toast notifications appear only once

## Deployment
- Build with `npm run build`
- Deploy `dist` folder to static hosting
- Configure environment variables for production backend URL
- Use nginx.conf for production server configuration
