import { create } from 'zustand';

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = 'verse-recent-searches';

function loadRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // Ignore localStorage errors (e.g., quota exceeded)
  }
}

interface SearchState {
  /** Whether the search dialog is open */
  isOpen: boolean;
  /** Recent search queries (persisted to localStorage) */
  recentSearches: string[];

  /** Open the search dialog */
  open: () => void;
  /** Close the search dialog */
  close: () => void;
  /** Toggle the search dialog */
  toggle: () => void;
  /** Add a query to recent searches */
  addRecentSearch: (query: string) => void;
  /** Clear all recent searches */
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>()((set, get) => ({
  isOpen: false,
  recentSearches: loadRecentSearches(),

  open: () => {
    set({ isOpen: true });
  },
  close: () => {
    set({ isOpen: false });
  },
  toggle: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  addRecentSearch: (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;

    const current = get().recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...current].slice(0, MAX_RECENT_SEARCHES);
    saveRecentSearches(updated);
    set({ recentSearches: updated });
  },

  clearRecentSearches: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    set({ recentSearches: [] });
  },
}));
