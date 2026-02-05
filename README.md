# Verse

> What comes after the Chorus

A modern, fast, and beautiful web interface for Kodi — the successor to Chorus2.

[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](LICENSE)

---

## Overview

**Verse** is a web interface for Kodi built from the ground up with modern web technologies. It provides a fast, responsive alternative to Chorus2 that meets contemporary expectations while being easier to maintain and extend.

### Current Features

- **Movies & TV Shows** — Browse, filter, sort, and play your full video library
- **Player Controls** — Persistent footer bar with seek, volume, prev/next, and a dedicated full player page
- **Real-time Updates** — WebSocket connection to Kodi keeps the UI in sync
- **Keyboard Shortcuts** — Space, arrows, and letter keys for power users
- **Playlist Queue** — View, reorder, and manage the current playback queue
- **Dark Mode** — Clean, accessible interface with dark/light/system theme
- **Kodi Addon Packaging** — Installable as a Kodi addon

### Planned Features

- Music library browsing
- Global search across all media types
- Live TV/PVR support
- Local browser streaming (dual player mode)
- Progressive Web App (offline, installable)
- Multilingual support (80+ languages)
- Add-on management

---

## Why Verse?

Chorus2 has served Kodi users well, but its technology stack (CoffeeScript, Backbone, Marionette) makes it increasingly difficult to maintain and enhance. Verse addresses this with:

- **Modern Stack**: React 19, TypeScript, Vite 7 — technologies that attract contributors
- **Type Safety**: Full TypeScript with strict mode prevents bugs and improves maintainability
- **Better Performance**: Code splitting, optimized caching, and efficient rendering
- **Mobile First**: Responsive design that works on all devices
- **Developer Experience**: Hot reload, modern tooling, clear architecture

---

## Technology Stack

### Core

- **Framework**: [React 19](https://react.dev) with [TypeScript 5.8](https://www.typescriptlang.org)
- **Build Tool**: [Vite 7](https://vitejs.dev) — Lightning-fast HMR
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) — Utility-first CSS
- **Components**: [shadcn/ui](https://ui.shadcn.com) — Accessible, customizable components

### State & Data

- **API Layer**: [TanStack Query](https://tanstack.com/query) — Data synchronization with automatic caching
- **Client State**: [Zustand](https://zustand-demo.pmnd.rs) — Simple, scalable state management
- **Real-time**: Native WebSocket with automatic reconnection and exponential backoff

### Additional

- **Routing**: [TanStack Router](https://tanstack.com/router) — Type-safe file-based routing
- **Forms**: [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)
- **i18n**: [i18next](https://www.i18next.com) — Internationalization
- **Testing**: [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com)
- **Icons**: [Lucide React](https://lucide.dev)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ and npm
- A running [Kodi](https://kodi.tv) instance with:
  - HTTP control enabled
  - Username and password configured (recommended)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/dangerouslaser/verse.git
cd verse

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Documentation

- [Project Plan](PROJECT_PLAN.md) - Development roadmap
- [Architecture](docs/ARCHITECTURE.md) - Technical design decisions
- [Design System](docs/DESIGN_SYSTEM.md) - UI/UX guidelines
- [API Integration](docs/API.md) - Kodi JSON-RPC implementation

---

## Contributing

Contributions are welcome!

### Ways to Contribute

- Report bugs - Found an issue? Open a bug report
- Suggest features - Have an idea? Start a discussion
- Submit PRs - Fix bugs or implement features
- Improve docs - Help make the documentation better
- Translate - Help translate Verse to your language

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- TypeScript with strict mode enabled
- ESLint + Prettier for code formatting
- Follow React best practices and hooks guidelines
- Write tests for new features
- Keep accessibility in mind (WCAG AA)

---

## Roadmap

### Phase 0: Foundation — COMPLETE

- Project structure, tooling, and build pipeline
- JSON-RPC client with Kodi authentication
- TanStack Router, Query, and shadcn/ui integration
- Dark/light/system theme support

### Phase 1: Movies & TV Shows — COMPLETE

- Full movie browsing with infinite scroll, search, genre filtering, and sorting
- Movie detail pages with fanart, cast, metadata, and watched toggle
- TV show browsing with seasons and episodes
- Resume and play functionality
- Poster/fanart display with image proxying

### Phase 2: Player & Playback — COMPLETE

- Persistent footer bar (artwork, title, transport controls, seek, volume)
- Full `/player` page with large artwork, stream info, and playlist queue
- Zustand player store for cross-route state
- WebSocket real-time updates from Kodi
- Keyboard shortcuts (space, arrows, M/N/P/S/F)

### Phase 3: Music Library — UP NEXT

- Artists, albums, and songs browsing
- Search and filtering
- Virtual scrolling for large libraries

### Coming Later

- Playlists & advanced queue management
- Global search across all media types
- Settings management
- Live TV/PVR
- Add-ons
- Local browser streaming (dual player mode)
- PWA features

[View complete roadmap](PROJECT_PLAN.md)

---

## License

This program is free software; you can redistribute it and/or modify it under the terms of the [GNU General Public License v2](LICENSE) as published by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
