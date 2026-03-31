# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2025-03-31

### Added

- **Google OAuth 2.0** authentication with JWT session management
- **DPDC** electricity provider integration (username/password + client secret)
- **NESCO** electricity provider integration (customer number only)
- **Account management** — full CRUD with AES-256 encrypted credential storage
- **Account nicknames** — custom labels for easy identification
- **Telegram notifications** — automated daily balance reports at 12:00 PM BST
- **Manual Telegram trigger** — on-demand balance report via API
- **Per-user notification settings** — configurable Telegram chat ID and toggle
- **Redis caching** — server-side with 24h TTL and cache bypass support
- **Client-side caching** — localStorage with smart invalidation
- **Multi-provider dashboard** — unified view of all DPDC and NESCO accounts
- **Responsive design** — mobile-first with Tailwind CSS 4 and shadcn/ui
- **Docker support** — development and production Docker Compose configurations
- **Coolify-ready** — production deployment with health checks
- **Comprehensive documentation** — architecture, API reference, security, troubleshooting
- **AI agent documentation** — project context, rules, templates, and prompts
