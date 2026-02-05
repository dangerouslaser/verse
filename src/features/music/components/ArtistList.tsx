import { useEffect, useRef } from 'react';
import { MediaCardSkeletonGrid } from '@/components/media/MediaCardSkeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArtistCard } from './ArtistCard';
import { ArtistListItem } from './ArtistListItem';
import { ViewToggle } from '@/components/media/ViewToggle';
import { useArtistsInfinite } from '@/api/hooks/useArtists';
import { useArtistFilters } from '../hooks/useArtistFilters';
import { useViewMode } from '@/hooks/useViewMode';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { Search, Loader2, Music, ArrowUp, ArrowDown } from 'lucide-react';

export function ArtistList() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useArtistsInfinite();

  const observerTarget = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useViewMode('artists', 'grid');

  // Flatten all pages into a single array
  const allArtists = data?.pages.flatMap((page) => page.artists) || [];

  // Get the total count from Kodi's API response
  const kodiTotal = data?.pages[0]?.total;

  const { filters, setFilters, filteredArtists, genres, filteredCount, totalCount } =
    useArtistFilters(allArtists, kodiTotal);

  const { setItems } = useBreadcrumbs();

  // Set breadcrumbs
  useEffect(() => {
    setItems([{ label: 'Music' }, { label: 'Artists' }]);
  }, [setItems]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <div className="bg-muted h-10 w-full max-w-md animate-pulse rounded-lg" />
          <div className="bg-muted h-8 w-48 animate-pulse rounded-lg" />
        </div>
        <MediaCardSkeletonGrid count={20} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading artists</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (allArtists.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-muted/50 rounded-lg border p-12 text-center">
          <Music className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="mb-2 text-xl font-semibold">No artists found</h2>
          <p className="text-muted-foreground">
            Your music library is empty. Add music to your Kodi library to see it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search and View Toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search artists..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
              }}
              className="pl-10"
            />
          </div>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-4">
          {/* Genre filter */}
          {genres.length > 0 && (
            <Select
              value={filters.genre || 'all-genres'}
              onValueChange={(value) => {
                setFilters({ ...filters, genre: value === 'all-genres' ? undefined : value });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-genres">All genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Sort by */}
          <Select
            value={filters.sortBy}
            onValueChange={(value: 'artist' | 'dateadded') => {
              setFilters({ ...filters, sortBy: value });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="artist">Artist Name</SelectItem>
              <SelectItem value="dateadded">Date Added</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort order */}
          <Button
            variant="outline"
            size="default"
            onClick={() => {
              setFilters({
                ...filters,
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
              });
            }}
            className="gap-2"
          >
            {filters.sortOrder === 'asc' ? (
              <>
                <ArrowUp className="h-4 w-4" />
                Ascending
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4" />
                Descending
              </>
            )}
          </Button>
        </div>

        {/* Count */}
        <p className="text-muted-foreground text-sm">
          Showing {filteredCount} of {totalCount} artists
        </p>
      </div>

      {/* Artist grid/list */}
      {filteredArtists.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {filteredArtists.map((artist) => (
                <ArtistCard key={artist.artistid} artist={artist} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArtists.map((artist) => (
                <ArtistListItem key={artist.artistid} artist={artist} />
              ))}
            </div>
          )}

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <div className="text-muted-foreground flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading more artists...</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-muted/50 rounded-lg border p-12 text-center">
          <h2 className="mb-2 text-xl font-semibold">No results found</h2>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
