/**
 * Settings management for Verse
 *
 * Stores user preferences and API keys in localStorage
 */

const STORAGE_PREFIX = 'verse_';

export interface SidebarNavItem {
  id: string;
  visible: boolean;
}

interface VerseSettings {
  tmdbApiKey: string | null;
  sidebarNavigation: SidebarNavItem[] | null;
}

const DEFAULT_SETTINGS: VerseSettings = {
  tmdbApiKey: null,
  sidebarNavigation: null,
};

/**
 * Get a setting value from localStorage
 */
export function getSetting<K extends keyof VerseSettings>(key: K): VerseSettings[K] {
  try {
    const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (value === null) {
      return DEFAULT_SETTINGS[key];
    }
    return JSON.parse(value) as VerseSettings[K];
  } catch {
    return DEFAULT_SETTINGS[key];
  }
}

/**
 * Set a setting value in localStorage
 */
export function setSetting<K extends keyof VerseSettings>(key: K, value: VerseSettings[K]): void {
  try {
    if (value === null) {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`Failed to save setting ${key}:`, error);
  }
}

/**
 * Get TMDB API key from settings or environment variable
 */
export function getTmdbApiKey(): string | null {
  // Check localStorage first
  const localKey = getSetting('tmdbApiKey');
  if (localKey) {
    return localKey;
  }
  // Fall back to environment variable
  const envKey = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
  return envKey ?? null;
}

/**
 * Set TMDB API key in settings
 */
export function setTmdbApiKey(apiKey: string | null): void {
  setSetting('tmdbApiKey', apiKey);
}

/**
 * Check if TMDB API key is configured
 */
export function hasTmdbApiKey(): boolean {
  const key = getTmdbApiKey();
  return key !== null && key.length > 0;
}

/**
 * Get sidebar navigation config from settings
 */
export function getSidebarNavigation(): SidebarNavItem[] | null {
  return getSetting('sidebarNavigation');
}

/**
 * Set sidebar navigation config in settings
 */
export function setSidebarNavigation(items: SidebarNavItem[] | null): void {
  setSetting('sidebarNavigation', items);
}
