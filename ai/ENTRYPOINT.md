# AI Agent Entrypoint

Welcome, AI Agent. This is your starting point for understanding and working with the Bill Barta codebase.

## Quick Orientation

**Bill Barta** is a full-stack web application for viewing electricity bill balances from DPDC and NESCO providers in Bangladesh. It features Google OAuth authentication, encrypted credential storage, and Telegram notification integration.

## How to Navigate This Repository

### Step 1: Understand the Project Context

Read these files in order:

1. **[ai/PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** — Project purpose, goals, architecture summary
2. **[ai/RULES.md](./RULES.md)** — Development constraints and coding rules
3. **[ai/AGENTS.md](./AGENTS.md)** — How to operate as an AI agent in this codebase

### Step 2: Understand the Architecture

1. **[../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)** — Full system architecture
2. **[../server/AGENTS.md](../server/AGENTS.md)** — Backend-specific agent guidance
3. **[../client/AGENTS.md](../client/AGENTS.md)** — Frontend-specific agent guidance

### Step 3: Understand Key Domains

| Domain               | Primary Files                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| **Authentication**   | `server/src/services/implementations/AuthService.ts`, `client/src/context/AuthContext.tsx`         |
| **Accounts**         | `server/src/services/implementations/AccountService.ts`, `client/src/features/accountManagement/`  |
| **Electricity Data** | `server/src/services/implementations/ElectricityService.ts`, `client/src/features/accountBalance/` |
| **Telegram**         | `server/src/services/implementations/TelegramService.ts`                                           |
| **Caching**          | `server/src/services/implementations/RedisCacheService.ts`, `client/src/lib/cache.ts`              |

### Step 4: Reference API Documentation

- **[../docs/API_REFERENCE.md](../docs/API_REFERENCE.md)** — Complete API documentation

## Repository Layout

```
electricity-bill-viewer/
├── client/           # React 19 + Vite frontend
├── server/           # Node.js + Express backend
├── docs/             # Human documentation
├── ai/               # AI agent context (you are here)
├── scripts/          # Utility scripts
└── docker-compose.*  # Container orchestration
```

## Key Patterns to Know

1. **Backend**: Controller → Service → Repository → Database
2. **Frontend**: Pages → Features → Components → Context
3. **API**: RESTful with `/api/v1` prefix, JWT authentication
4. **Validation**: Zod schemas on both client and server
5. **Encryption**: AES-256 for stored credentials

## Common Tasks

| Task                      | Start Here                                                                       |
| ------------------------- | -------------------------------------------------------------------------------- |
| Add a new API endpoint    | `server/src/routes/v1/`, then controller, service, repository                    |
| Add a new UI feature      | `client/src/features/`, create components subdirectory                           |
| Fix authentication issues | `server/src/middlewares/AuthMiddleware.ts`, `client/src/context/AuthContext.tsx` |
| Add environment variable  | `server/src/configs/config.ts` (Zod schema), then `.env.example` files           |
| Debug caching             | `server/src/services/implementations/RedisCacheService.ts`                       |

## Task Templates

For structured task execution, see **[ai/TASK_TEMPLATES.md](./TASK_TEMPLATES.md)**.

## Prompts Library

For reusable AI prompts, see **[ai/PROMPTS.md](./PROMPTS.md)**.

## Rules Summary

Before making changes, review **[ai/RULES.md](./RULES.md)**. Key rules:

- Keep controllers thin (delegation only)
- Business logic belongs in services
- Database access through repositories only
- All input validation via Zod
- Never commit secrets or `.env` files
- Maintain existing code style (ESLint/Prettier)

## Getting Help

If you need more context:

1. Use `grep_search` to find implementations
2. Read related test files (if they exist)
3. Check existing documentation in `docs/`
4. Review commit history for recent changes
