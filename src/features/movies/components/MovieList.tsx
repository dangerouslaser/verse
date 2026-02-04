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
import { MovieCard } from './MovieCard';
import { MovieListItem } from './MovieListItem';
import { ViewToggle } from '@/components/media/ViewToggle';
import { useMoviesInfinite } from '@/api/hooks/useMoviesInfinite';
import { useMovieFilters } from '../hooks/useMovieFilters';
import { useViewMode } from '@/hooks/useViewMode';
import { Search, Loader2 } from 'lucide-react';

export function MovieList() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMoviesInfinite();

  const observerTarget = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useViewMode('movies', 'grid');

  // Flatten all pages into a single array
  const allMovies = data?.pages.flatMap((page) => page.movies) || [];

  const { filters, setFilters, filteredMovies, genres, filteredCount, totalCount } =
    useMovieFilters(allMovies);

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
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading movies</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (allMovies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-muted/50 rounded-lg border p-12 text-center">
          <h2 className="mb-2 text-xl font-semibold">No movies found</h2>
          <p className="text-muted-foreground">Your movie library is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Movies</h1>
        <p className="text-muted-foreground">
          {filteredCount} {filteredCount === 1 ? 'movie' : 'movies'}
          {filteredCount !== totalCount && ` of ${String(totalCount)} total`}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search and View Toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search movies..."
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
            onValueChange={(value) => {
              setFilters({ ...filters, sortBy: value });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="dateadded">Date Added</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort order */}
          <Select
            value={filters.sortOrder}
            onValueChange={(value) => {
              setFilters({ ...filters, sortOrder: value });
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Movie grid/list */}
      {filteredMovies.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.movieid} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMovies.map((movie) => (
                <MovieListItem key={movie.movieid} movie={movie} />
              ))}
            </div>
          )}

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <div className="text-muted-foreground flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading more movies...</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-muted/50 rounded-lg border p-12 text-center">
          <h2 className="mb-2 text-xl font-semibold">No results found</h2>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
