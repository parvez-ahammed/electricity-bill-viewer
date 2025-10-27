# Bill Barta - Frontend Client

React + Vite frontend for the Electricity Bill Viewer application. Modern, responsive UI with TypeScript, Tailwind CSS, and multi-tier caching.

## 🚀 Features

- **React 19**: Latest React with TypeScript
- **Vite 6**: Lightning-fast build tool and dev server
- **TanStack Query**: Powerful server state management
- **Tailwind CSS + shadcn/ui**: Modern, accessible components
- **i18n**: Multi-language support (English, Norwegian)
- **localStorage Caching**: 24-hour client-side cache with auto-expiry
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching support

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your backend API URL
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `client` directory:

```env
# Backend API URL
VITE_BACKEND_API_PATH=http://localhost:3000/api/v1
```

## 🏃 Running the Client

### Development Mode

```bash
npm run dev
```

Starts Vite dev server at <http://localhost:5173>

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The build output is in the `dist/` directory.

## 📁 Project Structure

```text
client/
├── src/
│   ├── features/          # Feature-based modules
│   │   ├── accountBalance/
│   │   │   ├── api/       # API calls
│   │   │   ├── components/ # Feature components
│   │   │   ├── hooks/     # useBalanceData hook
│   │   │   └── utils/     # localStorage utilities
│   │   ├── auth/
│   │   └── user/
│   ├── components/        # Shared components
│   │   ├── layout/        # Layout components
│   │   ├── partials/      # Header, Footer, Navbar
│   │   └── ui/            # shadcn/ui components
│   ├── pages/             # Page components
│   │   ├── home.page.tsx
│   │   ├── error.page.tsx
│   │   └── user/
│   ├── context/           # React contexts
│   │   ├── AuthContext.tsx
│   │   └── PreferenceContext.tsx
│   ├── providers/         # Provider wrappers
│   │   ├── appProvider.tsx
│   │   ├── reactQueryProvider.tsx
│   │   └── themeProvider.tsx
│   ├── lib/               # Utilities and config
│   │   ├── axios.ts       # Axios instance
│   │   ├── cache.ts       # Cache utilities
│   │   └── utils.ts       # Helper functions
│   ├── locales/           # i18n translations
│   │   ├── en.json
│   │   └── no.json
│   ├── routes/            # Route configuration
│   ├── styles/            # Global styles
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── public/                # Static assets
│   └── robots.txt
├── nginx.conf             # Production Nginx config
├── components.json        # shadcn/ui config
├── tailwind.config.js     # Tailwind configuration
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript config
└── .env                   # Environment variables
```

## 🎨 Styling

### Tailwind CSS

Utility-first CSS framework with custom configuration.

### shadcn/ui

Pre-built accessible components:

- Button, Card, Table, Dialog, etc.
- Fully customizable with Tailwind

### Theme Support

Toggle between light and dark modes using `ThemeProvider`.

## 💾 Caching Strategy

### localStorage Implementation

Located in `features/accountBalance/utils/localStorage.ts`:

```typescript
interface StoredData {
  data: ElectricityAccount[];
  timestamp: number;
  expiresAt: number;
}
```

**Features:**

- 24-hour TTL (86,400,000 ms)
- Automatic expiry checking
- Manual refresh capability
- Storage format versioning

### useBalanceData Hook

Smart data fetching with caching:

```typescript
const { data, isLoading, error, refresh } = useBalanceData();
```

**Flow:**

1. Check localStorage for valid cached data
2. Return cached data if valid
3. Otherwise, fetch from backend API
4. Save response to localStorage
5. Manual refresh with `refresh()` bypasses cache

## 🌐 Internationalization (i18n)

Powered by `i18next`:

```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('welcome')}</h1>;
}
```

**Supported Languages:**

- English (`en`)
- Norwegian (`no`)

Translation files are in `src/locales/`.

## 🔌 API Integration

### Axios Instance

Configured in `lib/axios.ts`:

- Base URL from environment
- Request/response interceptors
- Error handling

### TanStack Query

Server state management:

```typescript
const { data } = useQuery({
  queryKey: ['electricity-data'],
  queryFn: fetchElectricityData,
  staleTime: 24 * 60 * 60 * 1000, // 24 hours
});
```

## 🐳 Docker

### Development

```bash
# From repository root
docker compose up -d client
```

### Production

The production build uses Nginx to serve static files:

```bash
# Build production image
docker build -f Dockerfile.client -t bill-barta-client .

# Run container
docker run -p 80:80 bill-barta-client
```

**Nginx Configuration** (`nginx.conf`):

- Gzip compression
- Security headers
- Client-side routing support
- Static asset caching (1 year)
- No cache for index.html

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Run linter
npm run lint

# Type checking
npm run type-check
```

## 📦 Building for Production

```bash
npm run build
```

**Optimizations:**

- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Source maps (optional)

Output: `dist/` directory ready for deployment.

## 🚀 Deployment

### Static Hosting

Deploy the `dist/` folder to:

- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Docker/Nginx

Use `Dockerfile.client` for containerized deployment.

See:

- [../DEPLOYMENT.md](../DEPLOYMENT.md) - General deployment guide
- [../COOLIFY_DEPLOYMENT.md](../COOLIFY_DEPLOYMENT.md) - Coolify-specific guide

## 🎯 Key Components

### Account Balance Feature

**Location:** `features/accountBalance/`

**Components:**

- Balance display cards
- Refresh button
- Loading states
- Error handling

**Hooks:**

- `useBalanceData()`: Fetch and cache electricity data

**Utils:**

- `localStorage.ts`: Client-side cache management

## 🤝 Contributing

1. Follow React best practices
2. Use TypeScript for type safety
3. Follow component naming conventions
4. Add PropTypes or TypeScript interfaces
5. Write accessible components (ARIA)
6. Run linter before committing

## 📄 License

MIT License - See [../LICENSE](../LICENSE) file for details

## 🙏 Credits

- React team for React 19
- Vite team for amazing build tool
- shadcn for beautiful UI components
- TanStack for powerful query library
