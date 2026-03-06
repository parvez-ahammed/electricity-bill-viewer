# Bill Barta Documentation

This folder contains detailed documentation for the Bill Barta Electricity Bill Viewer project.

## Contents

### Getting Started
- [AUTHENTICATION.md](./AUTHENTICATION.md): Google OAuth 2.0 + JWT authentication system
- [ACCOUNT_MANAGEMENT.md](./ACCOUNT_MANAGEMENT.md): Database-driven account management system
- [DPDC_SETUP.md](./DPDC_SETUP.md): DPDC account setup and client secret discovery
- [CONFIGURATION.md](./CONFIGURATION.md): Environment variable and configuration guide

### Architecture & API
- [ARCHITECTURE.md](./ARCHITECTURE.md): Project structure, tech stack, and technical overview
- [API.md](./API.md): Complete API endpoints reference (all 5 route groups)

### Features
- [TELEGRAM_INTEGRATION.md](./TELEGRAM_INTEGRATION.md): Telegram bot setup and notification settings
- [CACHING.md](./CACHING.md): Redis + localStorage caching strategies

### Deployment
- [DEPLOYMENT.md](./DEPLOYMENT.md): General deployment instructions for all platforms
- [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md): Coolify-specific deployment guide

### Agent Reference
- [AGENTS.md](./AGENTS.md): Unified AI agent reference for the full codebase

## Key Features

- 🔐 **Google OAuth Authentication**: Secure sign-in with JWT session management
- 🏠 **Account Management UI**: Add/edit/delete DPDC & NESCO accounts through web interface
- 🔒 **Encryption**: All sensitive credentials encrypted (AES) in database
- 🤖 **Telegram Integration**: Database-driven notification settings, daily automated reports
- ⚡ **Smart Caching**: Redis server-side + localStorage client-side with bypass support
- ✅ **Validation**: Centralized Zod schema validation on all input
- 📊 **Multi-Provider**: DPDC and NESCO accounts in one dashboard

Refer to these documents for in-depth information on each topic. For a quick start, see the [main README](../README.md).
