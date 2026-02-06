import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Clock, Film, Tv, PlaySquare, User, Disc3, Music, X } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchStore } from '@/stores/search';
import { useGlobalSearch } from '@/api/hooks/useGlobalSearch';
import { SearchResultItem } from './SearchResultItem';
import type { SearchResult, MediaType } from '@/api/types/search';

const CATEGORY_CONFIG: Record<
  MediaType,
  { label: string; icon: React.ElementType; order: number }
> = {
  movie: { label: 'Movies', icon: Film, order: 1 },
  tvshow: { label: 'TV Shows', icon: Tv, order: 2 },
  episode: { label: 'Episodes', icon: PlaySquare, order: 3 },
  artist: { label: 'Artists', icon: User, order: 4 },
  album: { label: 'Albums', icon: Disc3, order: 5 },
  song: { label: 'Songs', icon: Music, order: 6 },
};

// Skeleton placeholder indices
const SKELETON_INDICES = [0, 1, 2];

export function GlobalSearch() {
  const navigate = useNavigate();
  const { isOpen, close, recentSearches, addRecentSearch, clearRecentSearches } = useSearchStore();
  const [query, setQuery] = useState('');

  const { data: results, isLoading } = useGlobalSearch(query);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      addRecentSearch(query);
      close();
      void navigate({ to: result.route });
    },
    [query, addRecentSearch, close, navigate]
  );

  const handleRecentSelect = useCallback((recentQuery: string) => {
    setQuery(recentQuery);
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        close();
        // Reset query when dialog closes
        setQuery('');
      }
    },
    [close]
  );

  // Only show loading skeleton on initial load, not background refetches
  const showLoading = isLoading && !results;
  const showResults = results && results.totalCount > 0;
  const showNoResults = query.length >= 2 && results && results.totalCount === 0 && !showLoading;
  const showRecentSearches = query.length < 2 && recentSearches.length > 0;
  const showEmptyState = query.length < 2 && recentSearches.length === 0;

  // Group results by category for rendering
  const groupedResults: Array<{ type: MediaType; results: SearchResult[] }> = results
    ? [
        { type: 'movie' as const, results: results.movies },
        { type: 'tvshow' as const, results: results.tvshows },
        { type: 'episode' as const, results: results.episodes },
        { type: 'artist' as const, results: results.artists },
        { type: 'album' as const, results: results.albums },
        { type: 'song' as const, results: results.songs },
      ]
        .filter((group) => group.results.length > 0)
        .sort((a, b) => CATEGORY_CONFIG[a.type].order - CATEGORY_CONFIG[b.type].order)
    : [];

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder="Search movies, TV shows, music..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[400px]">
        {/* Loading State */}
        {showLoading && (
          <div className="space-y-2 p-3">
            {SKELETON_INDICES.map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {showRecentSearches && !showLoading && (
          <CommandGroup heading="Recent Searches">
            {recentSearches.map((recentQuery) => (
              <CommandItem
                key={recentQuery}
                value={`recent-${recentQuery}`}
                onSelect={() => {
                  handleRecentSelect(recentQuery);
                }}
                className="flex items-center gap-2"
              >
                <Clock className="text-muted-foreground h-4 w-4" />
                <span>{recentQuery}</span>
              </CommandItem>
            ))}
            <CommandSeparator className="my-1" />
            <CommandItem
              onSelect={clearRecentSearches}
              className="text-muted-foreground justify-center text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Clear recent searches
            </CommandItem>
          </CommandGroup>
        )}

        {/* Empty State (before typing) */}
        {showEmptyState && !showLoading && (
          <CommandEmpty>
            <p className="text-muted-foreground">Type to search movies, TV shows, and music...</p>
          </CommandEmpty>
        )}

        {/* No Results */}
        {showNoResults && (
          <CommandEmpty>
            <p className="text-muted-foreground">No results found for &ldquo;{query}&rdquo;</p>
          </CommandEmpty>
        )}

        {/* Search Results */}
        {showResults &&
          !showLoading &&
          groupedResults.map((group) => {
            const config = CATEGORY_CONFIG[group.type];
            const Icon = config.icon;
            return (
              <CommandGroup
                key={group.type}
                heading={
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>
                }
              >
                {group.results.map((result) => (
                  <SearchResultItem
                    key={`${result.type}-${String(result.id)}`}
                    result={result}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            );
          })}
      </CommandList>
    </CommandDialog>
  );
}
