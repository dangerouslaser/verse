# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Verse** is a modern web interface for Kodi, succeeding Chorus2. It's a full rewrite using React, TypeScript, and Vite. The name "Verse" represents what comes after the Chorus in a song.

The legacy Chorus2 code (CoffeeScript/Backbone/Marionette) lives in the `legacy/` directory and is excluded from linting. All new development is in the modern stack. See `PROJECT_PLAN.md` for the full roadmap and current progress.

**Current status**: Phase 0 (Foundation) is complete. Phase 1 (Movies & TV Shows) is in progress with movie browsing, TV shows, seasons, and episodes implemented.

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type check
npm run type-check

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check

# Run tests
npm test                # single run
npm run test:watch      # watch mode
npm run test:coverage   # with coverage

# Build for production
npm run build           # tsc + vite build

# Build and install to local Kodi
npm run build:kodi

# Package release zip for Kodi addon
npm run release         # runs scripts/release.sh
```

## Technology Stack

- **React 19** + **TypeScript** (strict mode with `noUncheckedIndexedAccess`)
- **Vite 7** for dev server and builds
- **TanStack Router** (file-based routing with auto-generated route tree)
- **TanStack Query** for data fetching with 5-minute stale time default
- **TanStack Virtual** for virtual scrolling of large media libraries
- **Tailwind CSS 4** with **shadcn/ui** components (Radix UI primitives)
- **Zustand** for client state
- **Vitest** + **Testing Library** + **MSW** for testing (happy-dom environment)
- **Husky** + **lint-staged** for pre-commit hooks (ESLint + Prettier)

## Architecture

### Project Structure

```
src/
├── main.tsx                  # Entry point: creates router, renders app
├── routes/                   # TanStack Router file-based routes
│   ├── __root.tsx            # Root layout: providers, sidebar, header, NowPlaying
│   ├── index.tsx             # Home page (redirects to /movies)
│   ├── movies/
│   │   ├── index.tsx         # Movie list with infinite scroll
│   │   └── $movieId.tsx      # Movie detail page
│   ├── tv/
│   │   ├── index.tsx         # TV show list
│   │   ├── $tvshowId.tsx     # TV show detail
│   │   └── $tvshowId/$season.tsx       # Season detail
│   │       └── $episodeId.tsx           # Episode detail
│   └── settings/index.tsx
├── api/
│   ├── client.ts             # KodiClient singleton - JSON-RPC over fetch
│   ├── types/                # Kodi API type definitions
│   │   ├── common.ts         # Shared types (KodiArt, KodiCast, etc.)
│   │   ├── video.ts          # Movie/TVShow/Episode types + property lists
│   │   └── player.ts         # Player state types
│   └── hooks/                # TanStack Query hooks
│       ├── useMovies.ts / useMoviesInfinite.ts
│       ├── useMovieDetails.ts
│       ├── useTVShows.ts / useTVShowDetails.ts
│       ├── useSeasons.ts / useEpisodes.ts
│       ├── usePlayback.ts    # Playback control mutations
│       └── useKodiConnection.ts
├── features/                 # Feature-based modules
│   ├── movies/
│   │   ├── components/       # MovieCard, MovieList, MovieDetails, etc.
│   │   └── hooks/            # useMovieFilters
│   └── tv/
│       └── components/       # TVShowCard, TVShowList, SeasonList, etc.
├── components/
│   ├── ui/                   # shadcn/ui components (button, card, dialog, etc.)
│   ├── layout/               # AppSidebar, AppBreadcrumbs, BreadcrumbContext
│   ├── media/                # MediaPoster, MediaImage, VirtualGrid, Backdrop
│   ├── player/               # NowPlaying
│   ├── video/                # PlayButton, WatchedIndicator, ResumeButton
│   └── theme-provider.tsx
├── hooks/                    # Shared hooks (useViewMode, use-mobile)
├── lib/
│   ├── utils.ts              # cn() utility for Tailwind class merging
│   ├── format.ts             # Duration, rating, date formatting helpers
│   └── image-utils.ts        # Kodi image URL encoding (image:// protocol)
└── test/
    ├── setup.ts              # Vitest setup with MSW
    ├── utils.tsx             # Test render utilities
    └── mocks/                # MSW handlers and server
```

### Key Architectural Patterns

**Kodi JSON-RPC Client** (`src/api/client.ts`): Singleton `kodi` instance wraps all Kodi API calls. In development, Vite proxy handles auth and forwards requests to the Kodi host. In production, the client adds Basic auth headers directly.

**Image URL handling** (`src/lib/image-utils.ts`): Kodi returns image paths as `image://encoded_path/`. These must be URL-encoded and accessed via `/image/{encodedPath}`. Use `getPosterUrl()`, `getFanartUrl()`, `getClearLogoUrl()` helpers.

**File-based routing**: Routes are in `src/routes/`. The route tree is auto-generated into `src/routeTree.gen.ts` by the TanStack Router Vite plugin. Don't edit `routeTree.gen.ts` manually.

**Root layout** (`src/routes/__root.tsx`): Sets up all providers (ThemeProvider > QueryClientProvider > BreadcrumbProvider > SidebarProvider) and renders the persistent sidebar, header with breadcrumbs, and NowPlaying bar.

**Path alias**: `@/` maps to `./src/` (configured in tsconfig.json, vite.config.ts, and vitest.config.ts).

### Environment Variables

Configure Kodi connection in `.env.local` (copy from `.env.example`):

- `VITE_KODI_HOST` - Kodi host URL (default: `http://localhost:8080`)
- `VITE_KODI_JSONRPC_PATH` - JSON-RPC endpoint (default: `/jsonrpc`)
- `VITE_KODI_USERNAME` / `VITE_KODI_PASSWORD` - Optional Basic auth credentials

### Kodi Integration

- Communicates via JSON-RPC 2.0 over HTTP POST to `/jsonrpc`
- WebSocket on port 9090 for real-time updates (planned)
- Dual-player mode: "Kodi" mode (remote control) vs "Local" mode (browser playback)
- API types in `src/api/types/` mirror Kodi's JSON-RPC schema with property lists as `const` arrays

### Code Conventions

- ESLint uses `tseslint.configs.strictTypeChecked` with `interface` enforced over `type`
- Unused variables must be prefixed with `_` (enforced by ESLint)
- `react-refresh/only-export-components` warns on non-component exports from route files
- Production builds use relative paths (`base: './'`) for Kodi's embedded web server compatibility
- Manual chunk splitting in Vite: `react-vendor` and `tanstack-vendor`

## Claude Code Instructions

### Firefox MCP Usage

- **ALWAYS ask for user confirmation before taking screenshots** using the Firefox MCP tools (`mcp__firefox-devtools__screenshot_page`, `mcp__firefox-devtools__screenshot_by_uid`). Do this EVERY TIME, even if a screenshot was recently taken or seems obviously needed. Never assume permission.
