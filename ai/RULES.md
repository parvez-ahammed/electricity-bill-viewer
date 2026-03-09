# Development Rules

This document defines strict constraints that must be followed when contributing to the Bill Barta codebase. These rules ensure consistency, security, and maintainability.

## Architecture Rules

### Rule 1: Maintain Layered Architecture

```
Controller → Service → Repository → Database
```

**DO**:

- Controllers delegate to services
- Services contain business logic
- Repositories handle data access
- Entities define database schema

**DON'T**:

- Put business logic in controllers
- Access database directly from controllers
- Call external APIs from repositories
- Mix concerns between layers

### Rule 2: Keep Controllers Thin

Controllers should only:

- Extract data from requests
- Call service methods
- Format responses

```typescript
// ✅ GOOD: Thin controller
getUsageData = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = this.getValidatedUserId(req);
  const skipCache = req.headers["x-skip-cache"] === "true";
  const result = await this.electricityService.getUsageDataForUser(
    userId,
    skipCache,
  );
  this.ok(res, result, "Usage data retrieved successfully");
};

// ❌ BAD: Fat controller with business logic
getUsageData = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;
  const accounts = await this.accountRepository.findByUserId(userId);
  const results = await Promise.all(
    accounts.map(async (acc) => {
      // Business logic should NOT be here
    }),
  );
  // ...
};
```

### Rule 3: Business Logic in Services Only

All business logic, data transformation, and orchestration belongs in the service layer.

### Rule 4: Database Access Through Repositories Only

Never use TypeORM's `getRepository()` or `DataSource` directly in services or controllers.

```typescript
// ✅ GOOD: Use repository
const account = await this.accountRepository.findById(id);

// ❌ BAD: Direct database access
const account = await AppDataSource.getRepository(Account).findOne({
  where: { id },
});
```

## API Rules

### Rule 5: Never Break Public APIs

Existing API endpoints must remain backward compatible. If changes are needed:

- Add new endpoints instead of modifying existing ones
- Use API versioning (`/api/v2/`) for breaking changes
- Document deprecations before removal

### Rule 6: Consistent Response Format

All API responses must follow this format:

```json
{
    "status": "success" | "error",
    "data": { ... },
    "message": "Human-readable message"
}
```

Use the `BaseController` helper methods:

- `this.ok(res, data, message)`
- `this.fail(res, message)`
- `this.unauthorized(res, message)`
- `this.notFound(res, message)`

### Rule 7: All Input Validation via Zod

Every API endpoint that accepts input must have a Zod schema.

```typescript
// Define schema in schemas/
export const CreateAccountSchema = z.object({
    provider: z.nativeEnum(ElectricityProvider),
    credentials: z.object({ ... })
});

// Apply in route
router.post('/', validate(createAccountValidation), controller.create);
```

## Security Rules

### Rule 8: Never Commit Secrets

**Never commit**:

- `.env` files
- API keys
- Encryption keys
- JWT secrets
- Credentials

Use `.env.example` files with placeholder values.

### Rule 9: Always Sanitize Logs

Never log:

- Passwords
- Tokens (except masked)
- Encryption keys
- Full credentials

```typescript
// ✅ GOOD: Masked logging
const masked = this.botToken ? `****${this.botToken.slice(-4)}` : "none";
logger.info(`TelegramService initialized (botTokenSuffix=${masked})`);

// ❌ BAD: Full secret in logs
logger.info(`Using token: ${this.botToken}`);
```

### Rule 10: Use Encryption for Sensitive Data

All sensitive data stored in the database must be encrypted:

- `password` fields → AES encrypted
- `clientSecret` fields → AES encrypted

Use `EncryptionService.encryptCredentials()` and `decryptCredentials()`.

### Rule 11: Validate JWT on All Protected Routes

All routes except `/auth/google` and `/auth/google/callback` must use `authMiddleware`.

```typescript
// Protected routes
router.use(authMiddleware);
router.get("/usage", controller.getUsageData);
```

## Code Style Rules

### Rule 12: Follow Existing Code Style

The codebase uses ESLint + Prettier with strict configuration:

- Run `npm run lint` before committing
- Use the existing naming conventions
- Match indentation (4 spaces)
- Match import organization

### Rule 13: TypeScript Strict Mode

- No `any` types without explicit justification
- Enable strict null checks
- Use proper type annotations
- Prefer interfaces over type aliases for objects

### Rule 14: Async/Await Over Promises

```typescript
// ✅ GOOD
const result = await someAsyncFunction();

// ❌ AVOID (unless necessary)
someAsyncFunction().then(result => { ... });
```

### Rule 15: Error Handling

- Use `ApiError` for HTTP errors
- Use try/catch in services for external calls
- Let `express-async-errors` handle uncaught async errors
- Always log errors before throwing

```typescript
try {
  const result = await externalApi.call();
  return result;
} catch (error) {
  logger.error(`External API failed: ${error.message}`);
  throw new ApiError(502, "External service unavailable");
}
```

## Dependency Rules

### Rule 16: Follow Dependency Direction

```
Controllers → Services → Repositories → Entities
     ↓            ↓            ↓
  Middlewares  External    DataSources
               APIs
```

Dependencies flow downward and outward. Never import:

- Controllers from services
- Services from repositories
- Entities from anything except repositories

### Rule 17: Use Path Aliases

```typescript
// ✅ GOOD: Use path aliases
import { appConfig } from "@configs/config";
import logger from "@helpers/Logger";

// ❌ BAD: Relative paths
import { appConfig } from "../../configs/config";
```

## Testing Rules

### Rule 18: Test Business Logic

Focus tests on service layer where business logic lives.

### Rule 19: Mock External Dependencies

- Mock Redis
- Mock external APIs (DPDC/NESCO)
- Mock Telegram API
- Use test database

## Documentation Rules

### Rule 20: Update Documentation

When adding features:

1. Update relevant `docs/*.md` files
2. Update `AGENTS.md` files if architecture changes
3. Add JSDoc comments for complex functions

### Rule 21: Meaningful Commit Messages

```
feat: Add account nickname support
fix: Handle corrupted credential decryption
docs: Update API reference for telegram endpoints
refactor: Extract validation logic to middleware
```

## Feature Development Rules

### Rule 22: Feature Module Structure

New features should follow the existing structure:

```
features/
└── newFeature/
    ├── components/      # Feature-specific components
    ├── hooks/           # Feature-specific hooks
    ├── constants/       # Feature-specific constants
    ├── utils/           # Feature-specific utilities
    └── index.tsx        # Feature entry point
```

### Rule 23: API Client Separation

Each domain should have its own API client in `common/apis/`:

```typescript
// common/apis/newFeature.api.ts
export const newFeatureApi = {
  getAll: () => axiosInstance.get("/new-feature"),
  create: (data) => axiosInstance.post("/new-feature", data),
};
```
