# Development Guide

This guide covers development workflow, coding standards, and how to contribute to Bill Barta.

## Project Structure

```
electricity-bill-viewer/
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── common/                  # Shared utilities
│   │   │   ├── apis/                # API client functions
│   │   │   ├── constants/           # App-wide constants
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   └── types/               # TypeScript types
│   │   ├── components/              # Reusable components
│   │   │   ├── auth/                # Auth components
│   │   │   ├── layout/              # Layout components
│   │   │   ├── partials/            # Partial components
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── context/                 # React contexts
│   │   ├── features/                # Feature modules
│   │   │   ├── accountBalance/      # Balance display
│   │   │   ├── accountManagement/   # Account CRUD
│   │   │   └── home/                # Home page
│   │   ├── lib/                     # Utility libraries
│   │   ├── pages/                   # Page components
│   │   ├── providers/               # Context providers
│   │   ├── routes/                  # Route definitions
│   │   └── styles/                  # Global styles
│   └── ...
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── configs/                 # Configuration
│   │   ├── controllers/             # Route handlers
│   │   │   └── v1/                  # API v1 controllers
│   │   ├── entities/                # TypeORM entities
│   │   ├── helpers/                 # Helper utilities
│   │   ├── interfaces/              # TypeScript interfaces
│   │   ├── middlewares/             # Express middlewares
│   │   ├── repositories/            # Data access layer
│   │   ├── routes/                  # Route definitions
│   │   │   └── v1/                  # API v1 routes
│   │   ├── schemas/                 # Zod validation
│   │   ├── services/                # Business logic
│   │   │   ├── implementations/     # Service implementations
│   │   │   └── interfaces/          # Service interfaces
│   │   └── utility/                 # Utility functions
│   └── data/                        # SQLite database files
├── docs/                            # Documentation
├── ai/                              # AI agent context
└── scripts/                         # Utility scripts
```

## Development Setup

### Prerequisites

- Node.js 22+
- npm 10+
- Docker (for Redis)
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/parvez-ahammed/electricity-bill-viewer.git
cd electricity-bill-viewer

# Install dependencies
cd server && npm install
cd ../client && npm install

# Setup environment files
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Starting Development Servers

**Option 1: Docker Compose (Recommended)**

```bash
docker compose up -d
```

**Option 2: Manual**

```bash
# Terminal 1: Start Redis
docker run -d --name redis -p 6379:6379 redis:7.4-alpine

# Terminal 2: Start server
cd server
npm run start:dev

# Terminal 3: Start client
cd client
npm run dev
```

## Coding Standards

### TypeScript

- Strict mode enabled
- No implicit `any`
- Explicit return types for public functions
- Prefer interfaces over type aliases for objects

```typescript
// ✅ Good
interface UserData {
  id: string;
  email: string;
}

async function getUser(id: string): Promise<UserData> {
  // ...
}

// ❌ Avoid
type UserData = {
  id: any;
  email: any;
};

async function getUser(id) {
  // ...
}
```

### React

- Functional components only
- Custom hooks for reusable logic
- Props interfaces explicitly defined
- Use TanStack Query for server state

```typescript
// ✅ Good
interface CardProps {
    title: string;
    children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
    return (
        <div>
            <h2>{title}</h2>
            {children}
        </div>
    );
}

// ✅ Custom hook
export function useAccounts() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: () => accountsApi.getAll(),
    });
}
```

### Backend Architecture

Follow the layered architecture:

```
Controller → Service → Repository → Entity
```

**Controller**: HTTP handling only

```typescript
class AccountController extends BaseController {
  async getAll(req: AuthenticatedRequest, res: Response) {
    const userId = this.getValidatedUserId(req);
    const accounts = await this.accountService.getAllForUser(userId);
    this.ok(res, accounts, "Accounts retrieved");
  }
}
```

**Service**: Business logic

```typescript
class AccountService {
  async getAllForUser(userId: string): Promise<Account[]> {
    const accounts = await this.repository.findByUserId(userId);
    return accounts.map(this.sanitizeAccount);
  }
}
```

**Repository**: Data access

```typescript
class AccountRepository {
  async findByUserId(userId: string): Promise<Account[]> {
    return this.repository.find({ where: { userId } });
  }
}
```

### Validation

Use Zod for all input validation:

```typescript
// Define schema
const CreateAccountSchema = z.object({
  provider: z.nativeEnum(ElectricityProvider),
  credentials: z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  }),
});

// Apply in route
router.post("/", validate({ body: CreateAccountSchema }), controller.create);
```

### Error Handling

Use `ApiError` for HTTP errors:

```typescript
import ApiError from "@helpers/ApiError";

if (!account) {
  throw new ApiError(404, "Account not found");
}
```

### Logging

Use the Winston logger:

```typescript
import logger from "@helpers/Logger";

logger.info("Operation started", { userId, operation: "fetch" });
logger.error("Operation failed", { error: error.message });
logger.debug("Debug info", { data });
```

## Development Workflow

### 1. Create Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Changes

Follow the coding standards above.

### 3. Run Lint

```bash
# Server
cd server && npm run lint

# Client
cd client && npm run lint
```

### 4. Test Changes

```bash
# Manual testing
# Run the full application and verify functionality
```

### 5. Commit

Use conventional commit messages:

```bash
git commit -m "feat(server): add account nickname support"
git commit -m "fix(client): handle empty balance response"
git commit -m "docs: update API reference"
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
# Create PR on GitHub
```

## Adding New Features

### Backend Feature

1. **Define interfaces** (`server/src/interfaces/`)
2. **Create entity** if DB needed (`server/src/entities/`)
3. **Create repository** (`server/src/repositories/`)
4. **Create service** (`server/src/services/implementations/`)
5. **Create schema** (`server/src/schemas/`)
6. **Create controller** (`server/src/controllers/v1/`)
7. **Add routes** (`server/src/routes/v1/`)
8. **Update docs** (`docs/API_REFERENCE.md`)

### Frontend Feature

1. **Create feature directory** (`client/src/features/newFeature/`)
2. **Create API client** (`client/src/common/apis/`)
3. **Create hooks** (`client/src/features/newFeature/hooks/`)
4. **Create components** (`client/src/features/newFeature/components/`)
5. **Create page** if needed (`client/src/pages/`)
6. **Add route** (`client/src/routes/`)

## Debugging

### Server Debugging

```bash
# Enable debug logging
ENABLE_LATENCY_LOGGER=true npm run start:dev

# View logs
docker compose logs -f server
```

### Client Debugging

- Use React DevTools
- Use TanStack Query DevTools
- Check browser console
- Check Network tab

### Database Debugging

```bash
# SQLite CLI
sqlite3 server/data/accounts.db

# Common queries
.tables
SELECT * FROM accounts;
SELECT * FROM users;
```

### Redis Debugging

```bash
# Connect to Redis CLI
docker exec -it bill-barta-redis redis-cli

# Common commands
KEYS *
GET "key:name"
TTL "key:name"
```

## Environment Variables

### Adding New Variables

1. **Add to schema** (`server/src/configs/config.ts`)
2. **Add to .env.example files**
3. **Update documentation** (`docs/CONFIGURATION.md`)

```typescript
// config.ts
const envSchema = z.object({
  // ... existing
  NEW_VARIABLE: z.string().optional().default("default"),
});
```

## Path Aliases

### Server Aliases

Defined in `server/tsconfig.json`:

| Alias             | Path                             |
| ----------------- | -------------------------------- |
| `@configs/*`      | `src/configs/*`                  |
| `@controllers/*`  | `src/controllers/*`              |
| `@services/*`     | `src/services/implementations/*` |
| `@repositories/*` | `src/repositories/*`             |
| `@middlewares/*`  | `src/middlewares/*`              |
| `@interfaces/*`   | `src/interfaces/*`               |
| `@helpers/*`      | `src/helpers/*`                  |
| `@utility/*`      | `src/utility/*`                  |
| `@routes/*`       | `src/routes/*`                   |

### Client Aliases

Defined in `client/vite.config.ts`:

| Alias | Path    |
| ----- | ------- |
| `@/*` | `src/*` |

## Code Formatting

The project uses ESLint and Prettier:

```bash
# Format code
npm run format

# Fix lint issues
npm run lint -- --fix
```

Pre-commit hooks via Husky enforce linting.

## FAQ

**Q: Where do I put shared types between client and server?**

A: Currently they're duplicated. Consider a shared `types/` package for future.

**Q: How do I add a new shadcn/ui component?**

A: Components are manually added to `client/src/components/ui/`. Copy from shadcn/ui docs.

**Q: How do I test encryption?**

A: Use the `EncryptionService` directly in a test file or REPL.

**Q: Why separate databases?**

A: To isolate auth data from application data for security and backup purposes.
