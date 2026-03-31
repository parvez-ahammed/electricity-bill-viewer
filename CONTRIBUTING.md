# Contributing to Bill Barta

Thank you for your interest in contributing to Bill Barta! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/electricity-bill-viewer.git
   cd electricity-bill-viewer
   ```
3. **Set up** the development environment — see [Installation Guide](./docs/INSTALLATION.md)
4. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Read the [Development Guide](./docs/DEVELOPMENT.md) for detailed coding standards
2. Make your changes in a feature branch
3. Test your changes locally
4. Commit with meaningful messages
5. Push and open a Pull Request

### Branch Naming

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/export-pdf` |
| `fix/` | Bug fixes | `fix/cache-invalidation` |
| `docs/` | Documentation | `docs/api-examples` |
| `refactor/` | Code refactoring | `refactor/service-layer` |
| `chore/` | Maintenance tasks | `chore/update-deps` |

## Coding Standards

### Backend (Express + TypeScript)

- **Architecture**: Follow `Controller → Service → Repository` pattern strictly
- **Validation**: Use Zod for all input validation via `ValidationMiddleware`
- **Error handling**: Throw `ApiError` from services; use `BaseController` response helpers
- **Types**: Zero `any` — use `unknown` with type guards when needed
- **Logging**: Use Winston logger (no `console.log` in business logic)

### Frontend (React + TypeScript)

- **State**: Server state via TanStack Query; client state via React Context
- **Components**: Feature-scoped in `src/features/`; shared UI in `src/components/`
- **Forms**: `react-hook-form` + Zod resolvers — no manual form state
- **Styling**: Tailwind CSS with `cn()` utility — no inline styles
- **API calls**: Always through centralized Axios instance in `lib/axios.ts`

### General

- ESLint + Prettier enforced (run `npm run lint` before committing)
- Meaningful commit messages (imperative mood: `Add`, `Fix`, `Update`)
- Keep PRs focused and small when possible

## Submitting Changes

1. Ensure your code passes linting: `npm run lint`
2. Update documentation if your change affects user-facing behavior
3. Push to your fork and submit a Pull Request against `main`
4. Fill out the PR template completely
5. Wait for review — maintainers may request changes

## Reporting Bugs

Use the [Bug Report](https://github.com/parvez-ahammed/electricity-bill-viewer/issues/new?template=bug_report.md) template. Please include:

- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
- Screenshots or logs if applicable

## Suggesting Features

Use the [Feature Request](https://github.com/parvez-ahammed/electricity-bill-viewer/issues/new?template=feature_request.md) template. Please include:

- Clear description of the feature
- Use case and motivation
- Any implementation ideas (optional)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

Thank you for helping make Bill Barta better! ⚡
