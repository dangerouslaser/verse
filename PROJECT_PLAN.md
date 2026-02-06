# Project Plan: Verse - Modern Kodi Web Interface

## Executive Summary

This document outlines a comprehensive plan to build **Verse**, a modern web interface for Kodi that succeeds Chorus2. The current implementation uses deprecated technologies (CoffeeScript, Backbone, Marionette) that make it difficult to maintain and attract contributors. With the recent resurgence of Kodi via CoreELEC and renewed enthusiast interest, this modernization will provide users with a web UI that meets modern expectations.

**Project Name**: Verse (what comes after the Chorus in a song!)

**Timeline**: Estimated 4-6 months for MVP, 8-12 months for feature parity

**Approach**: Full rewrite with incremental feature deployment

---

## Current State Analysis

### Technology Stack (Legacy)

- **Frontend**: Backbone.js + Marionette.js
- **Language**: CoffeeScript
- **Templating**: ECO templates
- **Styling**: Sass/SCSS with Compass (Ruby dependency)
- **Build System**: Grunt
- **Dependency Management**: npm + Bundler (Ruby)

### Existing Features

#### Core Media Management

1. **Music Library**
   - Artists, Albums, Songs browsing
   - Genre filtering and sorting
   - Album artwork and metadata display
   - Playcount and rating management

2. **Video Library**
   - Movies with metadata (TMDB integration)
   - TV Shows with seasons/episodes
   - Music videos
   - Video file browsing

3. **Live TV/PVR**
   - EPG (Electronic Program Guide)
   - Channel browsing (TV and Radio)
   - Recording management

4. **Add-ons**
   - Browse and manage Kodi add-ons
   - Add-on settings configuration

#### Playback & Control

1. **Dual Player Mode**
   - Kodi mode (remote control)
   - Local mode (browser streaming)
   - Player status synchronization

2. **Playlist Management**
   - Queue management for both players
   - M3U playlist export
   - Party mode (local playlist feature)

3. **Media Streaming**
   - Audio streaming via HTML5 audio
   - Video streaming (codec-dependent)
   - VLC plugin fallback support

#### User Interface

1. **Search**
   - Global search across all media types
   - Search index with caching

2. **Filtering & Sorting**
   - Advanced filtering by genre, year, tags, watched status
   - Multiple sort options per media type

3. **Settings**
   - Kodi settings management via web UI
   - Local UI preferences
   - Connection management

4. **Theming**
   - Vibrant headers option
   - Responsive design (910px breakpoint)
   - Material Design elements

5. **Additional Features**
   - Thumbnail management
   - Media editing (metadata)
   - File browser
   - Input sending to Kodi
   - Cast/remote control features
   - Keyboard shortcuts
   - API browser ("The Lab")

#### Technical Features

1. **Data Management**
   - Backbone fetchCache for collection caching
   - localStorage for settings persistence
   - Smart cache expiry (1 day search, 7 days collections)

2. **Real-time Updates**
   - WebSocket support (port 9090)
   - Polling fallback
   - Connection status monitoring

3. **Internationalization**
   - 80+ language translations
   - PO/JSON format via Jed library

### Kodi JSON-RPC API Integration

The application communicates with Kodi via JSON-RPC 2.0:

**Pattern**:

```javascript
{
  jsonrpc: "2.0",
  method: "AudioLibrary.GetAlbums",
  params: {
    properties: ["artist", "genre", "year", "thumbnail"],
    limits: { start: 0, end: 50 },
    sort: { method: "title", order: "ascending" }
  },
  id: timestamp
}
```

**Key API Namespaces**:

- `AudioLibrary.*` - Music management
- `VideoLibrary.*` - Movies, TV shows
- `Player.*` - Playback control
- `Playlist.*` - Queue management
- `Files.*` - File browsing
- `PVR.*` - Live TV functionality
- `Addons.*` - Add-on management
- `Settings.*` - Kodi settings
- `JSONRPC.*` - Introspection and ping

---

## Modern Technology Stack

### Core Technologies

#### Framework & Language

- **React 18+** with TypeScript
  - Mature, widely adopted
  - Large community and contributor base
  - Excellent tooling and ecosystem
  - Server components support for future optimization

#### Build & Development

- **Vite**
  - Lightning-fast HMR
  - Optimized production builds
  - Minimal configuration
  - Native ESM support

#### Styling

- **Tailwind CSS**
  - Rapid UI development
  - Utility-first approach
  - Built-in dark mode support
  - Highly customizable design system

#### UI Components

- **shadcn/ui** (Radix UI primitives)
  - Accessible by default (WCAG AA)
  - Fully customizable
  - Copy-paste component pattern (no npm bloat)
  - Comprehensive component library

### State & Data Management

#### API Layer

- **TanStack Query (React Query)**
  - Automatic caching and invalidation
  - Optimistic updates
  - Background refetching
  - WebSocket integration support
  - Perfect for JSON-RPC pattern

#### Client State

- **Zustand**
  - Simple, lightweight (1.2kb)
  - No boilerplate
  - DevTools support
  - TypeScript-first

#### Real-time Communication

- **Native WebSocket** with automatic reconnection
- **Polling fallback** for degraded networks
- TanStack Query integration for cache invalidation

### Additional Libraries

#### Media Player

- **React Player**
  - Multiple backend support (HTML5, YouTube, etc.)
  - Consistent API across sources
  - Custom controls support

#### Virtual Scrolling

- **TanStack Virtual**
  - Handle large media libraries
  - Smooth 60fps scrolling
  - Minimal memory footprint

#### Routing

- **TanStack Router**
  - Type-safe routing
  - Built-in search params
  - Code splitting support

#### Forms

- **React Hook Form + Zod**
  - Performant form handling
  - Type-safe validation
  - Minimal re-renders

#### Internationalization

- **i18next + react-i18next**
  - Industry standard
  - Lazy loading
  - Namespace support
  - JSON format (migrate from PO)

#### Icons

- **Lucide React**
  - Modern, consistent icon set
  - Tree-shakeable
  - Customizable

### Testing & Quality

#### Testing Framework

- **Vitest** - Fast, Vite-native unit testing
- **Testing Library** - User-centric component testing
- **Playwright** - E2E testing with Kodi instance

#### Code Quality

- **ESLint** + **Prettier** - Linting and formatting
- **TypeScript Strict Mode** - Maximum type safety
- **Husky** + **lint-staged** - Pre-commit hooks

### Deployment & Progressive Web App

#### PWA Features

- **Workbox** - Service worker management
- Offline capability for UI
- Install prompt support
- Background sync for queue changes

#### Build Output

- Static files deployable to any web server
- Compatible with Kodi's embedded web server
- CDN-ready for external hosting

---

## Architecture Design

### Project Structure

```
verse/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component
│   ├── router.tsx                  # Route definitions
│   │
│   ├── api/                        # Kodi API layer
│   │   ├── client.ts               # JSON-RPC client
│   │   ├── websocket.ts            # WebSocket connection
│   │   ├── types/                  # Generated API types
│   │   └── hooks/                  # React Query hooks
│   │       ├── useAlbums.ts
│   │       ├── useMovies.ts
│   │       └── usePlayer.ts
│   │
│   ├── features/                   # Feature-based modules
│   │   ├── music/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── routes/
│   │   ├── movies/
│   │   ├── tv-shows/
│   │   ├── player/
│   │   ├── playlists/
│   │   ├── settings/
│   │   └── search/
│   │
│   ├── components/                 # Shared components
│   │   ├── ui/                     # shadcn components
│   │   ├── layouts/
│   │   ├── media-card/
│   │   └── virtual-grid/
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── player.ts
│   │   ├── connection.ts
│   │   └── settings.ts
│   │
│   ├── lib/                        # Utilities
│   │   ├── utils.ts
│   │   ├── cache.ts
│   │   └── format.ts
│   │
│   ├── hooks/                      # Shared hooks
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── types/                      # Shared types
│   │   └── kodi.ts
│   │
│   └── assets/                     # Static assets
│       ├── icons/
│       └── images/
│
├── public/                         # Static files
│   ├── manifest.json
│   └── icons/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── [config files]
```

### Key Architectural Patterns

#### 1. Feature-Based Organization

Each feature is self-contained with its own components, hooks, and routes. This promotes:

- Clear boundaries
- Easy code splitting
- Independent testing
- Team parallelization

#### 2. API Layer Abstraction

```typescript
// api/client.ts
export class KodiClient {
  async call<T>(method: string, params?: object): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now(),
      }),
    });
    const data = await response.json();
    if (data.error) throw new KodiError(data.error);
    return data.result;
  }
}

// api/hooks/useAlbums.ts
export function useAlbums(options?: AlbumQueryOptions) {
  return useQuery({
    queryKey: ['albums', options],
    queryFn: () =>
      kodi.call('AudioLibrary.GetAlbums', {
        properties: ['artist', 'genre', 'year', 'thumbnail'],
        ...options,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

#### 3. Type-Safe API

Generate TypeScript types from Kodi JSON-RPC introspection:

```typescript
// types/kodi.ts (generated or manually defined)
export interface Album {
  albumid: number;
  title: string;
  artist: string[];
  genre: string[];
  year: number;
  thumbnail: string;
  rating: number;
  playcount: number;
}

export type KodiMethod =
  | 'AudioLibrary.GetAlbums'
  | 'AudioLibrary.GetAlbumDetails'
  | 'VideoLibrary.GetMovies';
// ... etc
```

#### 4. Dual Player State Management

```typescript
// stores/player.ts
interface PlayerState {
  mode: 'kodi' | 'local';
  kodiPlayer: KodiPlayerState;
  localPlayer: LocalPlayerState;
  setMode: (mode: 'kodi' | 'local') => void;
  play: (item: MediaItem) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  mode: 'auto',
  kodiPlayer: {
    /* ... */
  },
  localPlayer: {
    /* ... */
  },
  play: async (item) => {
    const { mode } = get();
    if (mode === 'kodi') {
      await playOnKodi(item);
    } else {
      playLocally(item);
    }
  },
}));
```

#### 5. Real-time Updates

```typescript
// api/websocket.ts
export class KodiWebSocket {
  connect() {
    this.ws = new WebSocket(`ws://${host}:9090/jsonrpc`);

    this.ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);

      // Invalidate relevant queries
      if (notification.method === 'Player.OnPlay') {
        queryClient.invalidateQueries(['player', 'state']);
      }
    };
  }
}
```

---

## Implementation Phases

### Phase 0: Foundation — ✅ COMPLETE

**Goal**: Set up development environment and core infrastructure

**Tasks**:

1. ✅ Initialize Vite + React + TypeScript project
2. ✅ Configure Tailwind CSS and shadcn/ui
3. ✅ Set up ESLint, Prettier, Husky
4. ✅ Configure Vitest and Testing Library
5. ✅ Implement JSON-RPC client with TypeScript types
6. ✅ Create connection status detection
7. ✅ Set up TanStack Query with WebSocket integration
8. ✅ Create basic layout and routing structure
9. ⏳ Implement settings storage (localStorage)
10. ✅ Create dark/light theme system (shadcn/ui default)

**Completed**:

- React 19 + TypeScript 5.8 + Vite 7 development environment
- TanStack Router with file-based routing
- TanStack Query for data fetching with 5-minute stale time
- shadcn/ui component library with dark/light/system theme
- Kodi JSON-RPC client with proper authentication
- Vite proxy configuration for development
- Sidebar layout with breadcrumb navigation
- Vitest + Testing Library test infrastructure
- Husky + lint-staged pre-commit hooks
- ESLint strict type-checked configuration

**Deliverable**: Running development environment with Kodi connection — ✅

---

### Phase 1: Movies & TV Shows — ✅ COMPLETE

**Goal**: Complete video library implementation

**Tasks**:

1. ✅ Movies list with infinite scrolling and filtering
2. ✅ Movie detail page with full metadata
3. ✅ TV Shows list with filtering and sorting
4. ✅ TV Show detail with seasons
5. ✅ Season view with episodes
6. ✅ Episode detail pages
7. ✅ Video metadata (ratings, artwork, cast, writers)
8. ✅ Watched status tracking with toggle
9. ✅ Resume functionality indicator and button
10. ✅ Basic playback controls (Kodi mode)
11. ✅ Poster/fanart display with fallbacks

**Completed Features**:

- Movie browsing with infinite scroll (pagination of 100 items)
- Search, genre filtering, and sorting (title, year, rating, date added)
- Movie cards with posters, ratings, watched indicators
- Movie detail pages with fanart header, clearlogo overlay, cast, writers, metadata
- Watched toggle for movies and episodes
- TV Shows browsing with infinite scroll, search, genre filtering, sorting
- TV Show detail pages with season list
- Season detail pages with episode list
- Episode detail pages with metadata
- Resume button and play button for movies and episodes
- Edit Artwork button (UI placeholder for future TMDB/Fanart.TV integration)
- Navigation system with sidebar (Movies, TV Shows, Settings)
- Proper Kodi image proxy configuration
- shadcn/ui component integration
- List and grid view modes

**Deliverable**: Full video library browsing with basic playback — ✅

---

### Phase 2: Player & Playback — ✅ COMPLETE

**Goal**: Implement player system with controls and real-time updates

**Tasks**:

1. ✅ Player state management (Zustand store)
2. ✅ Kodi player controls (play, pause, skip, seek, stop)
3. ⏳ Local video player (React Player) — stretch goal for future phase
4. ⏳ Player mode toggle UI — stretch goal for future phase
5. ✅ Now playing footer bar (artwork, title, transport controls, seek, volume)
6. ✅ Progress tracking with draggable seek bar
7. ✅ Volume controls with mute toggle
8. ✅ Playlist/queue display with remove and clear
9. ✅ WebSocket real-time updates with auto-reconnect
10. ✅ Keyboard shortcuts (space, arrows, M, N, P, S, F)

**Completed Features**:

- Zustand player store syncing playback state across routes
- Persistent NowPlaying footer bar: artwork, title/subtitle, prev/play-pause/next/stop, seek bar, time display, volume slider, expand button
- Full `/player` page: large artwork with blurred fanart background, full transport controls (shuffle, prev, play/pause, next, repeat, stop), seek bar with time, volume control, stream info (codec, resolution, audio channels)
- PlaylistQueue component: current queue display, highlight active item, remove individual items, clear queue, play from position
- SeekBar component: click-to-seek, drag-to-scrub, hover time preview, thin and default sizes
- VolumeControl component: slider with mute toggle, dynamic icon based on level
- 12 new API hooks: usePlayerItem, useVolume, useSetVolume, useToggleMute, useSkipNext, useSkipPrevious, useSetRepeat, useSetShuffle, usePlaylist, useRemoveFromPlaylist, useClearPlaylist, useGoToPlaylistPosition
- WebSocket connection to Kodi port 9090 with exponential backoff reconnection (1s-30s)
- Real-time query cache invalidation on Player, Application, Playlist, and VideoLibrary notifications
- Global keyboard shortcuts (only active when no input/textarea focused)
- Episode titles formatted with show name and S##E## notation

**Deliverable**: Working Kodi remote player with real-time updates — ✅

**Note**: Local browser streaming (dual player mode) deferred to a future phase.

---

### Phase 3: Music Library — ✅ COMPLETE

**Goal**: Implement complete music browsing experience

**Tasks**:

1. ✅ Artists list with infinite scrolling and filtering
2. ✅ Artist detail page with albums and metadata
3. ✅ Album detail page with tracks
4. ✅ Song list views with filtering and sorting
5. ✅ Music filtering (genre, year, search)
6. ✅ Sorting options (title, year, rating, date added, artist)
7. ✅ Search functionality for music
8. ✅ Album artwork display with square aspect ratio and fallbacks
9. ✅ Play/queue controls (Kodi mode) for songs, albums, and artists
10. ✅ Metadata display (bio, years active, genres, styles, moods, instruments)
11. ⏳ Local audio streaming support — deferred to future phase

**Completed Features**:

- Artist browsing with infinite scroll, search, genre filtering, sorting
- Artist detail pages with fanart header, clearlogo overlay, bio, metadata, album grid
- Album browsing (all albums) with infinite scroll, search, genre/year filtering, sorting
- Album detail pages with large artwork, tracklist (multi-disc support), metadata
- Song browsing with infinite scroll, search, genre filtering, sorting
- Three sidebar entries under "Music" group: Artists, Albums, Songs
- Drill-down routes: /music → /music/$artistId → /music/$artistId/$albumId
- Play/queue mutations for songs, albums, and artists (audio playlist)
- MSW mock handlers for testing without a music library
- WebSocket handlers for AudioLibrary notifications (OnUpdate, OnRemove, OnScanFinished, OnCleanFinished)
- Breadcrumb navigation for all music pages
- Grid and list view modes for artists and albums

**Deliverable**: Full music library browsing with playback controls — ✅

---

### Phase 4: Playlists & Queue Management (Weeks 11-12)

**Goal**: Advanced playlist and queue features

**Tasks**:

1. Queue view for both players
2. Drag-and-drop reordering
3. Add to queue from any media item
4. Clear queue
5. Save queue to playlist
6. M3U playlist import/export
7. Party mode implementation
8. Playlist management UI
9. Smart playlists (if supported by Kodi)

**Deliverable**: Complete playlist management system

---

### Phase 5: Search & Discovery — IN PROGRESS

**Goal**: Global search and content discovery

**Tasks**:

1. ✅ Global search across all media types (movies, TV shows, episodes, artists, albums, songs)
2. ✅ Command palette UI (Cmd+K / Ctrl+K) with cmdk library
3. ✅ Debounced search with 300ms delay
4. ✅ Search results grouped by media type with icons
5. ✅ Recent search history (localStorage persistence)
6. ⏳ Fuzzy search implementation
7. ⏳ Recent items/continue watching
8. ⏳ Recommended content
9. ⏳ Genre browsing
10. ⏳ Tag-based filtering
11. ⏳ Advanced filters UI

**Completed Features**:

- Command palette dialog triggered by Cmd+K (Mac) or Ctrl+K (Windows/Linux)
- Parallel API queries to all 6 media libraries (movies, TV shows, episodes, artists, albums, songs)
- Results limited to 5 per category for fast response
- Individual error handling per API call for resilience
- Search results with thumbnails, titles, subtitles, and type badges
- Recent searches stored in localStorage via Zustand persist middleware
- Keyboard navigation and click-to-navigate to detail pages
- Sidebar-matching background color for visual consistency

**Deliverable**: Global search complete; additional discovery features pending

---

### Phase 6: Settings & Configuration (Weeks 15-16)

**Goal**: Settings management and customization

**Tasks**:

1. Connection settings (host, port, credentials)
2. UI preferences (theme, layout density)
3. Player preferences (default player, autoplay)
4. Kodi settings proxy (read/write Kodi settings)
5. Keyboard shortcuts configuration
6. Language selection
7. Cache management
8. About page
9. Settings import/export
10. Reset to defaults

**Deliverable**: Complete settings system

---

### Phase 7: Live TV/PVR (Weeks 17-18)

**Goal**: Live TV and recording features

**Tasks**:

1. Channel list (TV and Radio)
2. EPG (program guide) UI
3. Live stream playback
4. Recording management
5. Timer management
6. Channel groups/favorites
7. PVR settings

**Deliverable**: Full PVR functionality (if applicable)

---

### Phase 8: Add-ons & Extensions (Weeks 19-20)

**Goal**: Add-on browsing and management

**Tasks**:

1. Add-ons list
2. Add-on detail pages
3. Browse add-on content
4. Enable/disable add-ons
5. Add-on settings management
6. Add-on updates
7. Repository management

**Deliverable**: Add-on management system

---

### Phase 9: Advanced Features (Weeks 21-23)

**Goal**: Additional functionality and polish

**Tasks**:

1. File browser
2. Thumbnail management
3. Media editor (metadata editing)
4. **Artwork editor with TMDB and Fanart.TV integration**
   - Fetch artwork from TMDB (The Movie Database)
   - Fetch artwork from Fanart.TV
   - Browse and select posters, fanart, clearlogo, clearart
   - Preview artwork before applying
   - Set artwork for movies and TV shows
   - Bulk artwork operations
5. API browser ("The Lab" equivalent)
6. Input sending to Kodi
7. Cast/remote control features
8. Batch operations
9. Context menus
10. Advanced keyboard shortcuts
11. Gesture support (mobile)

**Deliverable**: Feature parity with legacy system

---

### Phase 10: PWA & Mobile (Weeks 24-25)

**Goal**: Progressive Web App and mobile optimization

**Tasks**:

1. Service worker implementation
2. Offline UI caching
3. Install prompt
4. App manifest
5. Mobile-optimized layouts
6. Touch gestures
7. Mobile player controls
8. Responsive image loading
9. Performance optimization for mobile
10. iOS/Android testing

**Deliverable**: Production-ready PWA

---

### Phase 11: Internationalization (Week 26)

**Goal**: Multi-language support

**Tasks**:

1. Set up i18next
2. Extract all strings to translation files
3. Migrate existing translations from PO to JSON
4. Language selector UI
5. RTL support for Arabic/Hebrew
6. Date/time localization
7. Number formatting
8. Translation contribution guide

**Deliverable**: Multi-language support for all 80+ languages

---

### Phase 12: Testing & QA (Weeks 27-28)

**Goal**: Comprehensive testing and bug fixes

**Tasks**:

1. Unit test coverage for critical paths
2. Integration tests for API layer
3. E2E tests for major workflows
4. Cross-browser testing (Chrome, Firefox, Safari, Edge)
5. Mobile browser testing
6. Performance testing with large libraries
7. WebSocket reconnection testing
8. Error handling and edge cases
9. Accessibility audit (screen readers, keyboard nav)
10. Security audit (XSS, CSRF)

**Deliverable**: Production-ready, well-tested application

---

### Phase 13: Documentation & Launch (Weeks 29-30)

**Goal**: Documentation and initial release

**Tasks**:

1. User documentation
2. Installation guide
3. Configuration guide
4. Keyboard shortcuts reference
5. API documentation
6. Contributing guide
7. Changelog
8. Release notes
9. Create installation package for Kodi
10. GitHub release

**Deliverable**: Version 1.0.0 release

---

## Technical Considerations

### Performance Optimization

1. **Code Splitting**
   - Route-based splitting for each feature
   - Dynamic imports for heavy components
   - Lazy loading for images

2. **Virtual Scrolling**
   - Use TanStack Virtual for lists
   - Render only visible items
   - Target: 60fps scrolling for 10,000+ items

3. **Image Optimization**
   - Progressive loading with blur placeholders
   - Responsive images with srcset
   - WebP with fallbacks
   - Lazy loading with Intersection Observer

4. **Caching Strategy**
   - Aggressive caching for media metadata (5-10 min)
   - Stale-while-revalidate for lists
   - Cache invalidation on library updates
   - localStorage for persistent cache

### Accessibility

1. **WCAG AA Compliance**
   - Semantic HTML throughout
   - ARIA labels for interactive elements
   - Keyboard navigation for all features
   - Focus management for modals/dialogs

2. **Screen Reader Support**
   - Descriptive labels for media items
   - Live regions for player status
   - Skip links for navigation

3. **Visual**
   - Minimum 4.5:1 contrast ratio
   - Resizable text up to 200%
   - No color-only information conveyance

### Security

1. **Input Sanitization**
   - Sanitize all user inputs
   - Prevent XSS in search queries
   - Validate JSON-RPC responses

2. **Connection Security**
   - Support HTTPS/WSS
   - Optional authentication
   - Secure credential storage
   - CORS configuration

3. **Content Security Policy**
   - Restrict inline scripts
   - Define trusted sources
   - Prevent clickjacking

### Browser Support

**Target Browsers**:

- Chrome/Edge 90+ (last 2 versions)
- Firefox 88+ (last 2 versions)
- Safari 14+ (last 2 versions)
- Mobile: iOS 14+, Android 8+

**Polyfills**: Minimal, leveraging modern browser features

---

## Migration Strategy

### Parallel Development

1. **Separate Repository**
   - New repo: `xbmc/verse` or keep current repository
   - No impact on existing Chorus2 installations
   - Users can choose which interface to use

2. **Beta Testing**
   - Early access for community
   - Feedback collection via GitHub Discussions
   - Bug reports via Issues

3. **Feature Flags**
   - Toggle experimental features
   - A/B testing for UI changes
   - Gradual rollout

### Deployment Options

1. **Option A: Side-by-side**
   - Install both interfaces
   - User switches between them
   - Allows gradual migration

2. **Option B: Replacement**
   - Replace Chorus2 after feature parity
   - Keep Chorus2 available for download
   - Provide migration guide

### Data Migration

**Settings Migration**:

- Detect legacy localStorage keys
- Convert to new format
- Preserve user preferences

**No Data Loss**:

- All data lives in Kodi
- Settings are UI-only
- Can switch back to Chorus2 anytime

---

## Success Metrics

### Technical Metrics

- **Performance**
  - First Contentful Paint < 1.5s
  - Time to Interactive < 3s
  - Lighthouse score > 90

- **Bundle Size**
  - Initial bundle < 200KB gzipped
  - Total assets < 1MB (excluding media)

- **Test Coverage**
  - Unit tests > 80%
  - E2E tests for critical paths

### User Metrics

- **Adoption**
  - 1,000+ active users in first 3 months
  - 50+ GitHub stars

- **Engagement**
  - Average session duration > 10 minutes
  - < 5% bounce rate

- **Quality**
  - < 10 critical bugs per release
  - Average bug fix time < 7 days

### Community Metrics

- **Contributors**
  - 10+ contributors in first year
  - 50+ pull requests

- **Feedback**
  - > 4.0 user rating
  - Positive sentiment in forums

---

## Risks & Mitigation

### Technical Risks

1. **API Changes in Kodi**
   - **Risk**: Kodi API evolves, breaking compatibility
   - **Mitigation**: Version detection, backwards compatibility layer

2. **Performance with Large Libraries**
   - **Risk**: Slow with 50,000+ media items
   - **Mitigation**: Virtual scrolling, pagination, aggressive caching

3. **Browser Compatibility**
   - **Risk**: Features not working in older browsers
   - **Mitigation**: Clear browser requirements, graceful degradation

### Project Risks

1. **Scope Creep**
   - **Risk**: Adding features beyond original plan
   - **Mitigation**: Strict MVP definition, feature freeze dates

2. **Timeline Delays**
   - **Risk**: Phases taking longer than estimated
   - **Mitigation**: Buffer time, prioritize core features

3. **Contributor Availability**
   - **Risk**: Limited development resources
   - **Mitigation**: Clear documentation, good first issues

### Community Risks

1. **Resistance to Change**
   - **Risk**: Users prefer legacy interface
   - **Mitigation**: Parallel deployment, migration guide, community engagement

2. **Feature Parity Expectations**
   - **Risk**: Users expect 100% feature match immediately
   - **Mitigation**: Clear roadmap, phased releases, communication

---

## Resource Requirements

### Development Team (Ideal)

- 1-2 Frontend developers (React/TypeScript)
- 1 Designer (UX/UI)
- 1 QA/Tester (part-time)
- Community contributors

### Tools & Services

- GitHub (source control, issues, CI/CD)
- Vercel/Netlify (preview deployments)
- BrowserStack (cross-browser testing, optional)

### Hardware

- Development machines
- Test devices (mobile phones, tablets)
- Kodi test instances (various versions)

---

## Communication Plan

### Stakeholders

1. **Kodi Core Team**
   - Regular updates on progress
   - API compatibility discussions
   - Integration planning

2. **Community**
   - Blog posts for major milestones
   - GitHub Discussions for feedback
   - Reddit/Forum announcements

3. **Contributors**
   - Weekly sync meetings
   - Discord/Slack channel
   - Clear contribution guidelines

### Documentation

- Weekly progress updates (GitHub Discussions)
- Monthly blog posts
- Demo videos for major features
- Live streams for community engagement

---

## Current Status

Phases 0-3 are complete. The application has working video and music libraries with full player controls, real-time WebSocket updates, and keyboard shortcuts. It builds as a Kodi addon and runs as a standalone web app during development.

### What's Done

- Foundation: React 19 + TypeScript + Vite 7 + TanStack Router/Query + shadcn/ui
- Movies: browse, search, filter, sort, detail pages, watched toggle, play/resume
- TV Shows: browse with seasons and episodes, detail pages, watched toggle
- Music: artists, albums, songs with browse/search/filter/sort, detail pages, play/queue
- Player: footer bar, full player page, seek, volume, queue, keyboard shortcuts
- WebSocket: real-time sync with Kodi notifications (video + audio libraries)
- Testing: 127 tests across 9 test files, all passing
- Build: TypeScript strict mode, ESLint strict type-checked, production build ~533KB JS + 63KB CSS

### Next Steps

1. **Phase 4: Playlists** — Advanced queue management, drag-to-reorder
2. **Phase 5: Search** — ✅ Global search complete; fuzzy search and discovery features pending
3. **Phase 6: Settings** — Connection settings, UI preferences
4. Local browser streaming (dual player mode) — stretch goal

---

## Appendix

### Technology Alternatives Considered

| Category      | Chosen          | Alternatives                   | Rationale                            |
| ------------- | --------------- | ------------------------------ | ------------------------------------ |
| Framework     | React           | Vue 3, Svelte                  | Largest community, most contributors |
| State         | Zustand         | Redux, Jotai                   | Simplicity without boilerplate       |
| Data Fetching | TanStack Query  | SWR, Apollo                    | Best caching, WebSocket support      |
| Styling       | Tailwind        | CSS Modules, Styled Components | Rapid development, consistency       |
| Build Tool    | Vite            | webpack, Parcel                | Speed, DX, modern                    |
| Testing       | Vitest          | Jest                           | Vite integration, speed              |
| Router        | TanStack Router | React Router                   | Type safety, modern patterns         |

### References

- [Kodi JSON-RPC API Documentation](https://kodi.wiki/view/JSON-RPC_API)
- [React 18 Documentation](https://react.dev)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Glossary

- **PWA**: Progressive Web App
- **HMR**: Hot Module Replacement
- **JSON-RPC**: JSON Remote Procedure Call
- **EPG**: Electronic Program Guide
- **PVR**: Personal Video Recorder
- **WCAG**: Web Content Accessibility Guidelines
- **XSS**: Cross-Site Scripting
- **CORS**: Cross-Origin Resource Sharing
