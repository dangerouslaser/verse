import { useEffect, useRef, useState } from 'react';
import { useTVShowsInfinite } from '@/api/hooks/useTVShows';
import { TVShowCard } from './TVShowCard';
import { TVShowListItem } from './TVShowListItem';
import { ViewToggle } from '@/components/media/ViewToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useViewMode } from '@/hooks/useViewMode';
import { Search } from 'lucide-react';
import type { KodiSort, KodiFilter } from '@/api/types/common';

export function TVShowList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');
  const [viewMode, setViewMode] = useViewMode('tvshows', 'grid');

  const observerTarget = useRef<HTMLDivElement>(null);

  // Build sort object
  const sort: KodiSort = {
    method: sortBy as 'title' | 'year' | 'rating' | 'dateadded',
    order: 'ascending',
  };

  // Build filter object
  let filter: KodiFilter | undefined;
  if (searchQuery) {
    filter = {
      field: 'title',
      operator: 'contains',
      value: searchQuery,
    };
  } else if (selectedGenre !== 'all') {
    filter = {
      field: 'genre',
      operator: 'contains',
      value: selectedGenre,
    };
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTVShowsInfinite({ sort, filter });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Extract all TV shows from pages
  const tvshows = data?.pages.flatMap((page) => page.tvshows) || [];

  // Extract unique genres for filter
  const allGenres = new Set<string>();
  tvshows.forEach((show) => {
    show.genre?.forEach((g) => allGenres.add(g));
  });
  const genres = Array.from(allGenres).sort();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading TV shows</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'Failed to fetch TV shows'}
          </p>
        </div>
      </div>
    );
  }

  const totalCount = data?.pages[0]?.total || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">TV Shows</h1>

        {/* Search and View Toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search TV shows..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="pl-10"
            />
          </div>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="dateadded">Date Added</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Count */}
        <p className="text-muted-foreground text-sm">
          Showing {tvshows.length} of {totalCount} TV shows
        </p>
      </div>

      {/* TV Shows Grid/List */}
      {tvshows.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-lg">No TV shows found</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {tvshows.map((tvshow) => (
                <TVShowCard key={tvshow.tvshowid} tvshow={tvshow} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {tvshows.map((tvshow) => (
                <TVShowListItem key={tvshow.tvshowid} tvshow={tvshow} />
              ))}
            </div>
          )}

          {/* Loading indicator */}
          <div ref={observerTarget} className="mt-8 flex justify-center">
            {isFetchingNextPage && (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
