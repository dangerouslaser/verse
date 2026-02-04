# Development Guide

This guide will help you set up a local development environment for Verse.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- A running Kodi instance (local or network-accessible)

## Initial Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Configure your Kodi connection (see below)

3. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Connecting to Your Kodi Instance

Verse needs to connect to a Kodi instance to function. Follow these steps to configure the connection:

### 1. Enable Kodi's Web Server

In Kodi:

1. Go to **Settings** → **Services** → **Control**
2. Enable **Allow remote control via HTTP**
3. Set the port (default is 8080)
4. Optionally set a username and password for authentication

### 2. Configure Verse Connection

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Kodi connection details:

```env
# Your Kodi instance URL
VITE_KODI_HOST=http://localhost:8080

# JSON-RPC endpoint (usually /jsonrpc)
VITE_KODI_JSONRPC_PATH=/jsonrpc

# Authentication (if enabled in Kodi)
VITE_KODI_USERNAME=kodi
VITE_KODI_PASSWORD=your-password
```

**Important:** Never commit `.env.local` to git - it's already in `.gitignore`

### 3. Configuration Examples

#### Local Kodi Instance

```env
VITE_KODI_HOST=http://localhost:8080
VITE_KODI_JSONRPC_PATH=/jsonrpc
VITE_KODI_USERNAME=
VITE_KODI_PASSWORD=
```

#### Network Kodi Instance (e.g., on Raspberry Pi)

```env
VITE_KODI_HOST=http://192.168.1.100:8080
VITE_KODI_JSONRPC_PATH=/jsonrpc
VITE_KODI_USERNAME=kodi
VITE_KODI_PASSWORD=mypassword
```

#### Kodi with Custom Port

```env
VITE_KODI_HOST=http://localhost:9090
VITE_KODI_JSONRPC_PATH=/jsonrpc
VITE_KODI_USERNAME=
VITE_KODI_PASSWORD=
```

### 4. Test the Connection

After configuring, restart the dev server and open the browser console. You should see successful API calls to Kodi.

You can also test the connection by running:

```bash
curl -X POST http://localhost:8080/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"JSONRPC.Ping","id":1}'
```

Expected response:

```json
{ "id": 1, "jsonrpc": "2.0", "result": "pong" }
```

## How It Works

### Development Proxy

During development, Vite proxies API requests to your Kodi instance:

- Browser requests: `http://localhost:5173/jsonrpc`
- Proxied to: `http://your-kodi-host:port/jsonrpc`

This avoids CORS issues and simulates the production environment where Verse will be served from Kodi itself.

### Authentication

If your Kodi instance requires authentication:

1. The Vite dev server adds `Authorization: Basic` headers to proxied requests
2. The `KodiClient` class includes credentials in all API calls
3. Credentials are read from environment variables (never hardcoded)

### Environment Variables

Vite exposes variables prefixed with `VITE_` to your client code:

```typescript
// Accessible in your code
import.meta.env.VITE_KODI_HOST;
import.meta.env.VITE_KODI_USERNAME;
```

## Troubleshooting

### Cannot connect to Kodi

1. Verify Kodi's web server is enabled and running
2. Check the port number matches your configuration
3. Ensure there's no firewall blocking the connection
4. Test with curl (see above) to verify connectivity

### CORS errors

CORS errors shouldn't occur because of Vite's proxy. If you see them:

1. Ensure you're accessing the app via `http://localhost:5173` (not directly opening the HTML file)
2. Verify the proxy configuration in `vite.config.ts`
3. Restart the dev server after changing `.env.local`

### Authentication failures

1. Verify username/password in Kodi settings
2. Check `.env.local` has the correct credentials
3. Ensure there are no extra spaces in the `.env.local` file
4. Try without authentication first to isolate the issue

## Development Scripts

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
verse/
├── src/
│   ├── api/           # Kodi API client and hooks
│   ├── components/    # Reusable UI components
│   ├── features/      # Feature-based modules
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── stores/        # Zustand stores
│   └── types/         # TypeScript type definitions
├── .env.example       # Environment variable template
├── .env.local         # Your local config (not in git)
└── vite.config.ts     # Vite configuration
```

## Next Steps

- Read the [PROJECT_PLAN.md](PROJECT_PLAN.md) for the roadmap
- Check out [CLAUDE.md](CLAUDE.md) for AI assistant guidance
- See the main [README.md](README.md) for project overview
