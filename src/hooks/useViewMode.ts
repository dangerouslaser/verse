import { useState } from 'react';
import type { ViewMode } from '@/components/media/ViewToggle';

const STORAGE_KEY_PREFIX = 'verse-view-mode';

/**
 * Hook to manage view mode (grid/list) with localStorage persistence
 * @param scope Scope identifier for the view mode (e.g., 'movies', 'tvshows')
 * @param defaultMode Default view mode if none is stored
 */
export function useViewMode(
  scope: string,
  defaultMode: ViewMode = 'grid'
): [ViewMode, (mode: ViewMode) => void] {
  const storageKey = `${STORAGE_KEY_PREFIX}-${scope}`;

  // Initialize state from localStorage
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'grid' || stored === 'list') {
        return stored;
      }
    } catch (error) {
      console.error('Failed to read view mode from localStorage:', error);
    }
    return defaultMode;
  });

  // Update localStorage when view mode changes
  const setViewMode = (mode: ViewMode) => {
    try {
      localStorage.setItem(storageKey, mode);
      setViewModeState(mode);
    } catch (error) {
      console.error('Failed to save view mode to localStorage:', error);
      setViewModeState(mode);
    }
  };

  return [viewMode, setViewMode];
}
