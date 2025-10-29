# Architecture Overview

## Project Structure

```text
electricity-bill-viewer/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── features/      # Main features (accountBalance)
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React contexts
│   │   ├── lib/           # Axios, utils, cache
│   └── nginx.conf         # Production Nginx config
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── services/      # Provider implementations
│   │   ├── controllers/   # Request handlers
│   │   ├── utility/       # Shared utilities
│   │   └── routes/        # API routes
│   └── tsconfig.json      # TypeScript config with path aliases
├── docker-compose.yml      # Development compose
├── docker-compose.prod.yml # Production compose
├── Dockerfile.server       # Multi-stage server build
├── Dockerfile.client       # Multi-stage client build
└── .dockerignore
```

## Tech Stack

- **Frontend:** React 19, Vite, TanStack Query, Tailwind CSS, shadcn/ui, Nginx
- **Backend:** Node.js 22, Express, TypeScript, Redis, Cheerio, Axios, Winston
- **DevOps:** Docker, Docker Compose, Coolify

See the main README for a summary and docs/ for details on each topic.
