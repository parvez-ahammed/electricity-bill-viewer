# Bill Barta Documentation

This folder contains detailed documentation for the Bill Barta Electricity Bill Viewer project.

## Documentation Index

### Core Documentation

| Document                                   | Description                                     |
| ------------------------------------------ | ----------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)       | System design, patterns, data flow, scalability |
| [API_REFERENCE.md](./API_REFERENCE.md)     | Complete API documentation with examples        |
| [INSTALLATION.md](./INSTALLATION.md)       | Setup and installation guide                    |
| [DEVELOPMENT.md](./DEVELOPMENT.md)         | Development workflow and coding standards       |
| [DEPLOYMENT.md](./DEPLOYMENT.md)           | Production deployment guide                     |
| [SECURITY.md](./SECURITY.md)               | Security practices and policies                 |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions                     |

### Feature Documentation

| Document                                             | Description                           |
| ---------------------------------------------------- | ------------------------------------- |
| [AUTHENTICATION.md](./AUTHENTICATION.md)             | Google OAuth 2.0 + JWT authentication |
| [ACCOUNT_MANAGEMENT.md](./ACCOUNT_MANAGEMENT.md)     | Account CRUD with encryption          |
| [TELEGRAM_INTEGRATION.md](./TELEGRAM_INTEGRATION.md) | Telegram bot and notifications        |
| [CACHING.md](./CACHING.md)                           | Redis + localStorage caching          |
| [CONFIGURATION.md](./CONFIGURATION.md)               | Environment variables                 |
| [DPDC_SETUP.md](./DPDC_SETUP.md)                     | DPDC client secret discovery          |
| [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)     | Coolify-specific deployment           |

### Legacy Documentation

| Document                 | Description                                 |
| ------------------------ | ------------------------------------------- |
| [API.md](./API.md)       | Legacy API reference (see API_REFERENCE.md) |
| [AGENTS.md](./AGENTS.md) | AI agent reference                          |

## AI Agent Documentation

For AI agents, see the `ai/` directory:

| Document                                          | Description             |
| ------------------------------------------------- | ----------------------- |
| [ai/ENTRYPOINT.md](../ai/ENTRYPOINT.md)           | AI agent starting point |
| [ai/PROJECT_CONTEXT.md](../ai/PROJECT_CONTEXT.md) | Project context for AI  |
| [ai/RULES.md](../ai/RULES.md)                     | Development constraints |
| [ai/AGENTS.md](../ai/AGENTS.md)                   | AI agent guidelines     |
| [ai/TASK_TEMPLATES.md](../ai/TASK_TEMPLATES.md)   | Reusable task templates |
| [ai/PROMPTS.md](../ai/PROMPTS.md)                 | AI prompts library      |

## Quick Links

### Getting Started

1. [Installation Guide](./INSTALLATION.md) — Set up the project
2. [Configuration Guide](./CONFIGURATION.md) — Configure environment variables
3. [DPDC Setup](./DPDC_SETUP.md) — Find your DPDC client secret

### For Developers

1. [Development Guide](./DEVELOPMENT.md) — Coding standards and workflow
2. [Architecture](./ARCHITECTURE.md) — System design and patterns
3. [API Reference](./API_REFERENCE.md) — Complete API documentation

### For Operators

1. [Deployment Guide](./DEPLOYMENT.md) — Deploy to production
2. [Security Guide](./SECURITY.md) — Security best practices
3. [Troubleshooting](./TROUBLESHOOTING.md) — Solve common issues

## Key Features

| Feature                  | Description                                |
| ------------------------ | ------------------------------------------ |
| **Google OAuth**         | Secure sign-in with JWT session management |
| **Account Management**   | Add/edit/delete DPDC & NESCO accounts      |
| **AES Encryption**       | Sensitive credentials encrypted at rest    |
| **Telegram Integration** | Daily automated reports + manual trigger   |
| **Smart Caching**        | Redis + localStorage with bypass support   |
| **Input Validation**     | Zod schemas on all endpoints               |
| **Multi-Provider**       | DPDC and NESCO in one dashboard            |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React 19)                       │
│   Vite + TypeScript + Tailwind CSS 4 + shadcn/ui           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Server (Express.js)                     │
│   Controller → Service → Repository → SQLite (TypeORM)     │
│                     │                                       │
│              ┌──────┴──────┐                                │
│              │   Redis     │     External APIs              │
│              │   Cache     │     (DPDC, NESCO, Telegram)    │
│              └─────────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Contributing

For contribution guidelines, see:

- [Development Guide](./DEVELOPMENT.md) — Coding standards
- [Main README](../README.md) — Contribution workflow

## Support

If you encounter issues:

1. Check [Troubleshooting](./TROUBLESHOOTING.md)
2. Search existing GitHub issues
3. Create a new issue with diagnostic information
