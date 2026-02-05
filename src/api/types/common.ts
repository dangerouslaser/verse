/**
 * Common types shared across Kodi API
 */

/**
 * Image artwork from Kodi
 */
export interface KodiArt {
  poster?: string;
  fanart?: string;
  banner?: string;
  clearart?: string;
  clearlogo?: string;
  landscape?: string;
  thumb?: string;
  icon?: string;
}

/**
 * Cast member (actor, director, writer, etc.)
 */
export interface KodiCast {
  name: string;
  role: string;
  order?: number;
  thumbnail?: string;
}

/**
 * Resume point information
 */
export interface KodiResume {
  position: number;
  total: number;
}

/**
 * Rating information
 */
export interface KodiRating {
  default?: boolean;
  rating: number;
  votes?: number;
}

/**
 * Unique ID from different providers
 */
export interface KodiUniqueId {
  [provider: string]: string;
}

/**
 * Stream details for a video
 */
export interface KodiStreamDetails {
  audio?: Array<{
    channels: number;
    codec: string;
    language: string;
  }>;
  video?: Array<{
    aspect: number;
    codec: string;
    duration: number;
    height: number;
    width: number;
    language?: string;
  }>;
  subtitle?: Array<{
    language: string;
  }>;
}

/**
 * Common properties for all media items
 */
export interface KodiMediaBase {
  label: string;
  title?: string;
  art?: KodiArt;
  dateadded?: string;
  fanart?: string;
  thumbnail?: string;
  playcount?: number;
  lastplayed?: string;
}

/**
 * List response wrapper from Kodi
 */
export interface KodiListResponse<T> {
  limits: {
    start: number;
    end: number;
    total: number;
  };
  [key: string]: T[] | { start: number; end: number; total: number } | undefined;
}

/**
 * Sort options for Kodi queries
 */
export interface KodiSort {
  method?:
    | 'none'
    | 'label'
    | 'title'
    | 'date'
    | 'year'
    | 'rating'
    | 'playcount'
    | 'lastplayed'
    | 'dateadded'
    | 'random'
    | 'artist'
    | 'album'
    | 'track';
  order?: 'ascending' | 'descending';
  ignorearticle?: boolean;
}

/**
 * Limits for pagination
 */
export interface KodiLimits {
  start?: number;
  end?: number;
}

/**
 * Filter options for Kodi queries
 */
export interface KodiFilter {
  field?: string;
  operator?: 'is' | 'isnot' | 'contains' | 'doesnotcontain' | 'startswith' | 'endswith';
  value?: string | number | boolean;
}
