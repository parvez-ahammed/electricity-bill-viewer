# AI Agent Prompt: Implementing a New Feature

**Context:**
You are an expert AI agent working on the `electricity-bill-viewer` project. Your main objective is to implement new features optimally, reducing token costs, and strictly adhering to the existing project architecture to minimize manual rewrites by the developer.

This project is a full-stack application.
- **Frontend:** React 19, Vite, Tailwind CSS 4, shadcn/ui.
- **Backend:** Node.js 22, Express, TypeORM (SQLite), Zod.

## Core Principles for the AI Agent
1. **Reduce Token Cost:** Do NOT output entire files or rewrite large blocks of code unnecessarily. Use specific multi-replace or line-edit tools. Only request to read files that are strictly relevant to the required feature.
2. **Follow Architecture:**
    - **Backend:** Follow the strict separation of concerns: Request -> Route -> Middleware (Auth/Validation) -> Controller -> Service (Business logic) -> Repository -> Database/External API.
    - **Frontend:** API functions (Axios) -> React Query (Hooks) -> Feature Components -> Pages.
3. **Validation & Typing:** Always use Zod for payload validation on the backend and React Hook Form + Zod on the frontend. Maintain strict TypeScript typing. Ensure Shared types or DTOs map to backend and frontend appropriately.

## Workflow Instructions
When you are asked to implement a new feature, follow these steps:

### 1. Backend Implementation (If applicable)
- **Entity/Schema:** Do you need a new model? If so, define the TypeORM Entity in `server/src/entities` and ensure it maps to the correct DB (`accounts.db` or `auth.db`). Update the Zod schemas in `server/src/schemas/`.
- **Repository:** Create or update repository methods in `server/src/repositories`.
- **Service:** Implement the core business logic in `server/src/services/implementations/`. DO NOT write business logic in controllers.
- **Controller:** Create or update the controller in `server/src/controllers/v1/` to handle the request/response using `BaseController` helpers.
- **Route:** Register the route in `server/src/routes/v1/` and apply `ValidationMiddleware` and `AuthMiddleware` as necessary.

### 2. Frontend Implementation (If applicable)
- **API Client:** Add the necessary endpoint definitions and API calls in `client/src/common/apis/`. Use the globally configured Axios instance.
- **State/Hooks:** Create custom hooks using TanStack Query in `client/src/common/hooks/` or inside feature-specific directories (e.g., `client/src/features/featureName/`).
- **Components:** Build or modify UI components using `shadcn/ui` and Tailwind CSS v4. Place them in the relevant `client/src/features/` directory or `client/src/components/ui/` if globally reusable.
- **Routing:** If a new page is required, add it to `client/src/pages/` and register it in `client/src/routes/`. Wrap it in `ProtectedRoute` or `PublicOnlyRoute` as needed.

### 3. Optimization Rules
- Do NOT generate redundant placeholder code.
- Ensure new dependencies are evaluated. Do not install new libraries unless authorized or strictly necessary.
- Maintain the aesthetic of the platform. The UI must match the existing modern, clean design.
- Reuse existing utilities (e.g., `ApiError`, `ResponseBuilder`, encryption utilities) instead of re-inventing them.

**Final Check:** 
Review your proposed changes against the existing codebase style. Ensure variable naming conventions (camelCase), file naming (PascalCase for components/entities, camelCase for utilities/functions), and error handling flows are respected.
