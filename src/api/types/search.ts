/**
 * Media types that can be searched
 */
export type MediaType = 'movie' | 'tvshow' | 'episode' | 'artist' | 'album' | 'song';

/**
 * Unified search result that works across all media types
 */
export interface SearchResult {
  /** Unique ID for the media item (movieid, tvshowid, episodeid, etc.) */
  id: number;
  /** Type of media */
  type: MediaType;
  /** Primary title to display */
  title: string;
  /** Secondary info (year, episode info, artist name, etc.) */
  subtitle?: string;
  /** Poster/thumbnail URL */
  imageUrl?: string;
  /** Route to navigate to when selected */
  route: string;
}

/**
 * Grouped search results by media type
 */
export interface SearchResults {
  movies: SearchResult[];
  tvshows: SearchResult[];
  episodes: SearchResult[];
  artists: SearchResult[];
  albums: SearchResult[];
  songs: SearchResult[];
  /** Total count across all categories */
  totalCount: number;
}

/**
 * Category metadata for display
 */
export interface SearchCategory {
  type: MediaType;
  label: string;
  pluralLabel: string;
}

/**
 * Search category definitions
 */
export const SEARCH_CATEGORIES: SearchCategory[] = [
  { type: 'movie', label: 'Movie', pluralLabel: 'Movies' },
  { type: 'tvshow', label: 'TV Show', pluralLabel: 'TV Shows' },
  { type: 'episode', label: 'Episode', pluralLabel: 'Episodes' },
  { type: 'artist', label: 'Artist', pluralLabel: 'Artists' },
  { type: 'album', label: 'Album', pluralLabel: 'Albums' },
  { type: 'song', label: 'Song', pluralLabel: 'Songs' },
];
