# AI Agent Prompt: Fixing a Bug

**Context:**
You are an expert AI agent working on the `electricity-bill-viewer` project to fix a bug. Your main objective is to identify and resolve issues precisely without introducing regressions. You must optimize your token usage, minimize changes, and adhere strictly to the existing architecture.

This project is a full-stack application.
- **Frontend:** React 19, Vite, Tailwind CSS 4, shadcn/ui.
- **Backend:** Node.js 22, Express, TypeORM (SQLite), Zod.

## Core Principles for the AI Agent
1. **Reduce Token Cost:**  Pinpoint the exact lines causing the bug. Do not rewrite entire files or output full files. Use precise editing tools like `replace_file_content` or `multi_replace_file_content`. Only read the files directly involved in the issue's execution path to minimize context length.
2. **Minimal Changes:** Fix the bug with the smallest code change possible. Do not refactor unrelated code unless the bug is systemic.
3. **Full-Stack Awareness:** A bug can stem from the frontend, backend, or the interaction between them. Trace the execution flow fully across the stack.

## Workflow Instructions
When you are asked to fix a bug, follow these steps:

### 1. Diagnosis and Tracing
- **Frontend Bug:** If the issue is visual or UI behavior, check `client/src/features/` or `client/src/components/`. If it's a data loading or synchronization issue, verify the API request in `client/src/common/apis/` and the React Query hook being used. Use `grep_search` to trace variable names or class names directly.
- **Backend Bug:** If the frontend is receiving 4xx or 5xx errors, begin tracing the API endpoint starting from `server/src/routes/v1/` to find the controller mapping.
- **Flow Tracing:** Follow the path: Route -> Middleware -> Controller -> Service -> Repository -> Database / Third-party API. Check where the breakdown occurs. Common issues include Zod validation failures, TypeORM mismatches, or third-party API issues (e.g., DPDC/NESCO endpoints).

### 2. Applying the Fix
- **Backend Fixes:** 
  - If a validation is too strict, update `server/src/schemas/`.
  - If business logic is failing, update `server/src/services/implementations/`. Do not apply logic fixes in the Controller.
  - Ensure any errors thrown use the custom `ApiError` class properly managed by the `GlobalErrorHandler`. Avoid returning raw Express `res.send()` in controllers. Always use the `BaseController` standard builder.
- **Frontend Fixes:**
  - Fix state mismatches, prop drilling, or context issues in feature components.
  - Update TanStack Query invalidation if cached data is stale or requires re-fetching.
  - Fix Tailwind CSS or `shadcn/ui` styling, layout, or responsiveness glitches. Avoid introducing inline styles.

### 3. Optimization Rules
- Investigate systematically. Avoid attempting to fix code without first understanding the root cause.
- Only read the files in the suspected trace. If you know the error originates from `AuthController.ts`, start reading there instead of hunting randomly.
- Ensure your fix does not break the `Controller -> Service -> Repository` pattern.
- If a package dependency conflict occurs, strictly use `npm` package overrides or verify the package version lock.

**Final Check:** 
Did you address the root cause of the bug, or just silence the symptom? Ensure the change is consistent with existing error handling and architectural patterns. Review the related tests if available.
