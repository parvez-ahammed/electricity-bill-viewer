# AI Task Templates

This document provides structured templates for common AI agent tasks. Each template includes a clear step-by-step execution process.

---

## Template 1: Generate Documentation

**Purpose**: Create or update documentation for a feature, API, or component.

### Steps

1. **Identify Target**
   - Determine what needs documentation
   - Locate the source code files
   - Identify the audience (developers, users, AI agents)

2. **Gather Context**

   ```
   Read source files:
   - Implementation code
   - Related interfaces/types
   - Existing tests (if any)
   - Related documentation
   ```

3. **Extract Information**
   - Public API surface
   - Configuration options
   - Input/output formats
   - Error conditions
   - Dependencies

4. **Write Documentation**

   ```markdown
   # Feature/Component Name

   ## Overview

   Brief description of purpose.

   ## Usage

   How to use the feature.

   ## API Reference

   Detailed API documentation.

   ## Configuration

   Available options.

   ## Examples

   Code examples.

   ## Troubleshooting

   Common issues.
   ```

5. **Validate**
   - Verify accuracy against code
   - Check for broken links
   - Ensure consistency with existing docs

---

## Template 2: Refactor Code Safely

**Purpose**: Improve code structure without changing behavior.

### Steps

1. **Understand Current State**

   ```
   - Read the code being refactored
   - Identify all callers/usages
   - Document current behavior
   - Note any side effects
   ```

2. **Plan Refactoring**

   ```
   - Define target structure
   - List files to modify
   - Identify potential risks
   - Plan rollback strategy
   ```

3. **Execute Incrementally**

   ```
   For each change:
   a. Make smallest possible change
   b. Verify TypeScript compiles
   c. Verify ESLint passes
   d. Test affected functionality
   ```

4. **Verify No Regression**

   ```
   - Run existing tests
   - Manual verification of key paths
   - Check error handling
   ```

5. **Document Changes**
   ```
   - Update inline comments
   - Update AGENTS.md if architecture changed
   - Note any breaking changes
   ```

---

## Template 3: Security Audit

**Purpose**: Identify and report security vulnerabilities.

### Steps

1. **Scan Authentication/Authorization**

   ```
   Check:
   - AuthMiddleware applied to all protected routes
   - JWT verification implementation
   - Token expiration handling
   - User ID extraction and validation
   ```

2. **Scan Input Validation**

   ```
   Check:
   - All endpoints have Zod schemas
   - Schemas validate all fields
   - No unvalidated user input
   - SQL/NoSQL injection prevention
   ```

3. **Scan Secrets Management**

   ```
   Check:
   - No hardcoded secrets
   - .env files in .gitignore
   - Encryption key requirements
   - Logging doesn't expose secrets
   ```

4. **Scan Data Protection**

   ```
   Check:
   - Sensitive fields encrypted
   - HTTPS enforced (production)
   - CORS properly configured
   - Rate limiting enabled
   ```

5. **Generate Report**

   ```markdown
   # Security Audit Report

   Date: [date]

   ## Critical Issues

   ...

   ## High Severity

   ...

   ## Medium Severity

   ...

   ## Low Severity

   ...

   ## Recommendations

   ...
   ```

---

## Template 4: Add New API Endpoint

**Purpose**: Implement a new REST API endpoint following the layered architecture.

### Steps

1. **Define Interface**

   ```typescript
   // server/src/interfaces/NewFeature.ts
   export interface NewFeatureInput { ... }
   export interface NewFeatureOutput { ... }
   ```

2. **Create/Update Entity** (if DB needed)

   ```typescript
   // server/src/entities/NewEntity.ts
   @Entity('new_entities')
   export class NewEntity { ... }
   ```

3. **Create Repository**

   ```typescript
   // server/src/repositories/NewEntityRepository.ts
   export class NewEntityRepository {
       async findById(id: string) { ... }
       async create(data: CreateDto) { ... }
   }
   ```

4. **Create Service**

   ```typescript
   // server/src/services/implementations/NewFeatureService.ts
   export class NewFeatureService implements INewFeatureService {
     private repository: NewEntityRepository;

     async doSomething(userId: string): Promise<NewFeatureOutput> {
       // Business logic here
     }
   }
   ```

5. **Create Schema**

   ```typescript
   // server/src/schemas/NewFeatureSchemas.ts
   export const CreateNewFeatureSchema = z.object({ ... });
   export const createNewFeatureValidation: IZodValidationSchema = {
       body: CreateNewFeatureSchema
   };
   ```

6. **Create Controller**

   ```typescript
   // server/src/controllers/v1/NewFeatureController.ts
   export class NewFeatureController extends BaseController {
     private service: NewFeatureService;

     create = async (req: AuthenticatedRequest, res: Response) => {
       const userId = this.getValidatedUserId(req);
       const result = await this.service.create(userId, req.body);
       this.ok(res, result, "Created successfully");
     };
   }
   ```

7. **Create Routes**

   ```typescript
   // server/src/routes/v1/newFeature.routes.ts
   const router = Router();
   const controller = new NewFeatureController();

   router.use(authMiddleware);
   router.post("/", validate(createNewFeatureValidation), controller.create);

   export default router;
   ```

8. **Register Routes**

   ```typescript
   // server/src/routes/v1/index.ts
   import newFeatureRoutes from "./newFeature.routes";
   router.use("/new-feature", newFeatureRoutes);
   ```

9. **Update Documentation**
   - Add to `docs/API_REFERENCE.md`
   - Update `docs/AGENTS.md` if significant feature

---

## Template 5: Add New Frontend Feature

**Purpose**: Implement a new feature in the React frontend.

### Steps

1. **Create Feature Directory**

   ```
   client/src/features/newFeature/
   ├── components/
   │   ├── NewFeatureCard.tsx
   │   └── NewFeatureList.tsx
   ├── hooks/
   │   └── useNewFeature.ts
   ├── constants/
   │   └── index.ts
   └── index.tsx
   ```

2. **Create API Client**

   ```typescript
   // client/src/common/apis/newFeature.api.ts
   import axiosInstance from "@/lib/axios";

   export const newFeatureApi = {
     getAll: () => axiosInstance.get("/new-feature"),
     create: (data: CreateInput) => axiosInstance.post("/new-feature", data),
     update: (id: string, data: UpdateInput) =>
       axiosInstance.put(`/new-feature/${id}`, data),
     delete: (id: string) => axiosInstance.delete(`/new-feature/${id}`),
   };
   ```

3. **Create Custom Hook**

   ```typescript
   // client/src/features/newFeature/hooks/useNewFeature.ts
   import {
     useQuery,
     useMutation,
     useQueryClient,
   } from "@tanstack/react-query";
   import { newFeatureApi } from "@/common/apis/newFeature.api";

   export function useNewFeature() {
     return useQuery({
       queryKey: ["newFeature"],
       queryFn: () => newFeatureApi.getAll(),
     });
   }
   ```

4. **Create Components**

   ```typescript
   // client/src/features/newFeature/components/NewFeatureCard.tsx
   export function NewFeatureCard({ data }: Props) {
       return (
           <Card>
               {/* Component JSX */}
           </Card>
       );
   }
   ```

5. **Create Feature Entry Point**

   ```typescript
   // client/src/features/newFeature/index.tsx
   import { NewFeatureList } from './components/NewFeatureList';
   import { useNewFeature } from './hooks/useNewFeature';

   export function NewFeature() {
       const { data, isLoading, error } = useNewFeature();

       if (isLoading) return <Skeleton />;
       if (error) return <ErrorCard error={error} />;

       return <NewFeatureList items={data} />;
   }
   ```

6. **Add Page** (if needed)

   ```typescript
   // client/src/pages/newFeature.page.tsx
   import { NewFeature } from '@/features/newFeature';

   export function NewFeaturePage() {
       return (
           <MainLayout>
               <NewFeature />
           </MainLayout>
       );
   }
   ```

7. **Add Route**
   ```typescript
   // client/src/routes/public.route.tsx
   {
       path: '/new-feature',
       element: <NewFeaturePage />,
   }
   ```

---

## Template 6: Improve Test Coverage

**Purpose**: Add tests for untested code.

### Steps

1. **Identify Untested Code**

   ```
   - Review service methods
   - Check edge cases
   - Find error paths
   ```

2. **Set Up Test File**

   ```typescript
   // server/tests/services/NewService.test.ts
   import { NewService } from "@services/implementations/NewService";

   describe("NewService", () => {
     let service: NewService;

     beforeEach(() => {
       service = new NewService();
       // Mock dependencies
     });
   });
   ```

3. **Write Happy Path Tests**

   ```typescript
   describe("methodName", () => {
     it("should return expected result", async () => {
       const result = await service.methodName(validInput);
       expect(result).toEqual(expectedOutput);
     });
   });
   ```

4. **Write Error Path Tests**

   ```typescript
   it("should throw when invalid input", async () => {
     await expect(service.methodName(invalidInput)).rejects.toThrow(
       "Expected error message",
     );
   });
   ```

5. **Write Edge Case Tests**
   ```typescript
   it("should handle empty array", async () => {
     const result = await service.methodName([]);
     expect(result).toEqual([]);
   });
   ```

---

## Template 7: Add Observability

**Purpose**: Improve logging, metrics, or monitoring.

### Steps

1. **Identify Key Operations**

   ```
   - API endpoints
   - Database operations
   - External API calls
   - Background jobs
   ```

2. **Add Structured Logging**

   ```typescript
   logger.info("Operation started", {
     operation: "fetchBalance",
     userId: userId,
     provider: "DPDC",
   });

   logger.info("Operation completed", {
     operation: "fetchBalance",
     duration: endTime - startTime,
     success: true,
   });
   ```

3. **Add Error Logging**

   ```typescript
   logger.error("Operation failed", {
     operation: "fetchBalance",
     error: error.message,
     stack: error.stack,
     userId: userId,
   });
   ```

4. **Add Performance Markers**
   ```typescript
   const startTime = Date.now();
   try {
     const result = await slowOperation();
     const duration = Date.now() - startTime;
     logger.debug(`Slow operation completed in ${duration}ms`);
     return result;
   } catch (error) {
     const duration = Date.now() - startTime;
     logger.error(`Slow operation failed after ${duration}ms`);
     throw error;
   }
   ```

---

## Template 8: Dependency Upgrade

**Purpose**: Safely upgrade npm dependencies.

### Steps

1. **Review Current Dependencies**

   ```bash
   npm outdated
   ```

2. **Check for Breaking Changes**
   - Read changelogs
   - Check migration guides
   - Review peer dependencies

3. **Upgrade Incrementally**

   ```bash
   npm update <package-name>
   ```

4. **Verify Functionality**
   - Run TypeScript compiler
   - Run ESLint
   - Run tests
   - Manual testing of affected features

5. **Document Changes**
   - Update any affected documentation
   - Note breaking changes in commit message
