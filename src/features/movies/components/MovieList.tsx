import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { MediaCardSkeletonGrid } from '@/components/media/MediaCardSkeleton';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MovieCard } from './MovieCard';
import { ViewToggle } from '@/components/media/ViewToggle';
import { useMoviesInfinite } from '@/api/hooks/useMoviesInfinite';
import { useMovieFilters } from '../hooks/useMovieFilters';
import { useViewMode } from '@/hooks/useViewMode';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { usePlayMovie } from '@/api/hooks/usePlayer';
import { Search, Loader2, Eye, EyeOff, Play, ArrowUpDown } from 'lucide-react';
import { getPosterUrl } from '@/lib/image-utils';
import { formatRuntime, formatRating, formatYear } from '@/lib/format';

export function MovieList() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMoviesInfinite();

  const observerTarget = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useViewMode('movies', 'list');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const playMovie = usePlayMovie();

  // Flatten all pages into a single array
  const allMovies = data?.pages.flatMap((page) => page.movies ?? []) ?? [];

  // Get the total count from Kodi's API response
  const kodiTotal = data?.pages[0]?.total;

  const { filters, setFilters, filteredMovies, genres, filteredCount, totalCount } =
    useMovieFilters(allMovies, kodiTotal);

  const { setItems } = useBreadcrumbs();

  // Set breadcrumbs
  useEffect(() => {
    setItems([{ label: 'Movies' }]);
  }, [setItems]);

  // Sync debounced search to filters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch, setFilters]);

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

  const handleSort = (field: 'title' | 'year' | 'rating' | 'dateadded') => {
    if (filters.sortBy === field) {
      setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      setFilters({ ...filters, sortBy: field, sortOrder: 'asc' });
    }
  };

  const handlePlay = (movieid: number, title: string) => {
    playMovie.mutate({ movieid, title });
  };

  if (isLoading) {
    return (
      <div className="container space-y-4 py-6">
        <div className="space-y-4">
          <div className="bg-muted h-10 w-full max-w-md animate-pulse rounded-lg" />
          <div className="bg-muted h-8 w-48 animate-pulse rounded-lg" />
        </div>
        <MediaCardSkeletonGrid count={20} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container space-y-4 py-6">
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
      <div className="container space-y-4 py-6">
        <div className="bg-muted/50 rounded-lg border p-12 text-center">
          <h2 className="mb-2 text-xl font-semibold">No movies found</h2>
          <p className="text-muted-foreground">Your movie library is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movies</h1>
          <p className="text-muted-foreground">
            {filteredCount !== totalCount
              ? `${filteredCount.toLocaleString()} of ${totalCount.toLocaleString()} movies`
              : `${totalCount.toLocaleString()} movies in your library`}
          </p>
        </div>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search movies..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            className="w-64 pl-8"
          />
        </div>

        {genres.length > 0 && (
          <Select
            value={filters.genre ?? 'all'}
            onValueChange={(value) => {
              setFilters({ ...filters, genre: value === 'all' ? undefined : value });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Genre" />
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
        )}

        <Select
          value={filters.watched === undefined ? 'all' : filters.watched ? 'true' : 'false'}
          onValueChange={(value) => {
            setFilters({
              ...filters,
              watched: value === 'all' ? undefined : value === 'true',
            });
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Watched</SelectItem>
            <SelectItem value="false">Unwatched</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {filteredMovies.length > 0 ? (
        <>
          {viewMode === 'list' ? (
            <div className="bg-muted/50 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3"
                        onClick={() => {
                          handleSort('title');
                        }}
                      >
                        Title
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3"
                        onClick={() => {
                          handleSort('year');
                        }}
                      >
                        Year
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3"
                        onClick={() => {
                          handleSort('rating');
                        }}
                      >
                        Rating
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovies.map((movie) => {
                    const posterUrl = getPosterUrl(movie.art);
                    const year = formatYear(movie.year ?? movie.premiered);
                    const rating = movie.rating ? formatRating(movie.rating) : null;
                    const runtime = formatRuntime(movie.runtime);
                    const genre = movie.genre?.[0] ?? '-';
                    const isWatched = (movie.playcount ?? 0) > 0;

                    return (
                      <TableRow key={movie.movieid}>
                        <TableCell>
                          {posterUrl ? (
                            <img
                              src={posterUrl}
                              alt={movie.title}
                              className="h-14 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="bg-muted text-muted-foreground flex h-14 w-10 items-center justify-center rounded text-xs">
                              N/A
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            to="/movies/$movieId"
                            params={{ movieId: movie.movieid.toString() }}
                            className="font-medium hover:underline"
                          >
                            {movie.title}
                          </Link>
                          {movie.director && movie.director.length > 0 && (
                            <div className="text-muted-foreground text-sm">{movie.director[0]}</div>
                          )}
                        </TableCell>
                        <TableCell>{year ? year : '-'}</TableCell>
                        <TableCell>{genre}</TableCell>
                        <TableCell>{rating ? rating : '-'}</TableCell>
                        <TableCell>{runtime ? runtime : '-'}</TableCell>
                        <TableCell>
                          {isWatched ? (
                            <Badge variant="secondary" className="gap-1">
                              <Eye className="h-3 w-3" />
                              {movie.playcount}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <EyeOff className="h-3 w-3" />
                              New
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              handlePlay(movie.movieid, movie.title);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredMovies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                        No movies found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.movieid} movie={movie} />
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
