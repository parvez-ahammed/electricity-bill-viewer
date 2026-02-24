# Backend Agent Documentation

## Project Overview
This is a Node.js + TypeScript backend API server that provides authentication services using Google OAuth and manages electricity bill payment data. The server uses Express.js framework with TypeORM for database operations.

## Tech Stack
- Node.js with TypeScript
- Express.js for HTTP server
- TypeORM for database ORM
- SQLite for database (development)
- PostgreSQL support (production)
- Google OAuth 2.0 for authentication
- JWT for token-based authentication
- Redis for caching (optional)

## Project Structure
```
server/
├── src/
│   ├── configs/
│   │   ├── database.ts        # Database configuration
│   │   └── redis.ts           # Redis cache configuration
│   ├── controllers/
│   │   ├── v1/
│   │   │   ├── AuthController.ts    # Authentication endpoints
│   │   │   └── BillController.ts    # Bill management endpoints
│   │   └── BaseController.ts        # Base controller with common methods
│   ├── entities/
│   │   └── User.ts            # User entity model
│   ├── interfaces/
│   │   └── Auth.ts            # Authentication interfaces
│   ├── middlewares/
│   │   └── AuthMiddleware.ts  # JWT authentication middleware
│   ├── repositories/
│   │   └── UserRepository.ts  # User data access layer
│   ├── routes/
│   │   └── v1/
│   │       └── auth.routes.ts # Authentication routes
│   ├── services/
│   │   ├── implementations/
│   │   │   ├── AuthService.ts      # Authentication business logic
│   │   │   └── JwtService.ts       # JWT token operations
│   │   └── interfaces/             # Service interfaces
│   └── server.ts              # Application entry point
├── scripts/                   # Utility scripts (DPDC, NESCO)
└── docs/                      # Documentation
```

## Authentication Architecture

### Google OAuth Flow
1. Client requests `/api/v1/auth/google`
2. Server generates Google OAuth URL and redirects
3. User authenticates with Google
4. Google redirects to `/api/v1/auth/google/callback?code=<auth_code>`
5. Server exchanges code for Google tokens
6. Server fetches user profile from Google
7. Server finds or creates user in database
8. Server generates JWT token
9. Server redirects to frontend with token: `${FRONTEND_URL}/auth/callback?token=<jwt>`

### JWT Authentication
- Tokens are signed with `JWT_SECRET` environment variable
- Default expiration: 7 days (configurable via `JWT_EXPIRES_IN`)
- Tokens contain: `userId` and `email`
- Protected routes require `Authorization: Bearer <token>` header

## Key Components

### AuthService (`src/services/implementations/AuthService.ts`)
Handles authentication business logic:
- `getAuthUrl()`: Generates Google OAuth URL
- `handleGoogleCallback(code)`: Processes OAuth callback
- `findOrCreateUser(profile)`: Finds existing user or creates new one
- `generateJWT(user)`: Creates JWT token for user
- `verifyToken(token)`: Validates JWT and returns user

### JwtService (`src/services/implementations/JwtService.ts`)
JWT token operations:
- `sign(payload)`: Creates signed JWT token
- `verify(token)`: Validates and decodes token
- `decode(token)`: Decodes token without verification

### AuthMiddleware (`src/middlewares/AuthMiddleware.ts`)
Protects routes requiring authentication:
- Extracts Bearer token from Authorization header
- Verifies token validity
- Attaches user payload to request object
- Returns 401 for invalid/missing tokens

### UserRepository (`src/repositories/UserRepository.ts`)
Data access layer for User entity:
- `findByGoogleId(googleId)`: Find user by Google ID
- `findByEmail(email)`: Find user by email
- `findById(id)`: Find user by ID
- `create(data)`: Create new user

## Database Schema

### User Entity
```typescript
{
  id: string;          // Google ID (primary key)
  name: string;        // User's full name
  email: string;       // User's email (unique)
  createdAt: Date;     // Account creation timestamp
}
```

## API Endpoints

### Authentication Routes (`/api/v1/auth`)

#### `GET /google`
Initiates Google OAuth flow
- Redirects to Google authentication page
- No authentication required

#### `GET /google/callback`
Handles Google OAuth callback
- Query params: `code` (authorization code)
- Exchanges code for user data
- Redirects to frontend with JWT token
- No authentication required

#### `GET /me`
Get current authenticated user
- Requires: Bearer token
- Returns: User object (userId, email)
- Status: 200 OK or 401 Unauthorized

#### `POST /logout`
Logout endpoint (stateless)
- JWT is stateless, so logout is client-side
- Returns: Success message
- Status: 200 OK

## Environment Variables
Required in `.env`:
```
# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Database
DB_TYPE=sqlite
DB_DATABASE=./data/database.sqlite

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback

# JWT
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Middleware Stack
1. CORS (configured for frontend URL)
2. Body parser (JSON)
3. Request logging
4. Route handlers
5. Error handling middleware

## Error Handling
- BaseController provides standard response methods:
  - `ok(res, data, message)`: 200 success response
  - `fail(res, message)`: 400 bad request
  - `unauthorized(res, message)`: 401 unauthorized
  - `notFound(res, message)`: 404 not found
  - `serverError(res, error)`: 500 internal error

## Security Considerations
1. JWT tokens are stateless (cannot be revoked server-side)
2. Tokens expire after configured duration
3. HTTPS required in production
4. CORS configured to allow only frontend origin
5. Environment variables for sensitive data
6. Google OAuth scopes limited to profile and email

## Development Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server
npm run typeorm      # Run TypeORM CLI commands
```

## Database Migrations
```bash
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
npm run typeorm migration:revert
```

## Caching Strategy
- Redis cache for frequently accessed data
- Cache keys prefixed by data type
- TTL configured per data type
- Cache invalidation on data updates

## Logging
- Request/response logging in development
- Error logging to console
- Production: Consider external logging service

## Testing
- Unit tests for services
- Integration tests for API endpoints
- Test authentication flows
- Mock Google OAuth in tests

## Deployment
- Build with `npm run build`
- Set production environment variables
- Use PostgreSQL for production database
- Configure Redis for caching
- Use process manager (PM2) for Node.js
- Set up reverse proxy (nginx)
- Enable HTTPS with SSL certificates

## Best Practices
1. Use dependency injection for services
2. Keep controllers thin, business logic in services
3. Use repositories for data access
4. Validate input data
5. Handle errors gracefully
6. Use TypeScript types consistently
7. Follow RESTful API conventions
8. Document API endpoints
9. Use environment variables for configuration
10. Implement proper logging

## Known Issues & Considerations

### JWT Stateless Nature
Since JWT tokens are stateless, they cannot be invalidated server-side. Consider:
- Short token expiration times
- Refresh token mechanism
- Token blacklist (requires Redis/database)

### Google OAuth Redirect URI
The redirect URI must match exactly in:
- Google Cloud Console configuration
- Environment variable `GOOGLE_REDIRECT_URI`
- OAuth client initialization

## Monitoring
- Monitor API response times
- Track authentication success/failure rates
- Monitor database connection pool
- Track Redis cache hit rates
- Set up alerts for errors

## API Documentation
- Consider adding Swagger/OpenAPI documentation
- Document request/response schemas
- Provide example requests
- Document error responses
