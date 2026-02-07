import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTVShowsInfinite } from '@/api/hooks/useTVShows';
import { TVShowCard } from './TVShowCard';
import { ViewToggle } from '@/components/media/ViewToggle';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useViewMode } from '@/hooks/useViewMode';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { Search, Loader2, ArrowUpDown, Eye, EyeOff, Tv } from 'lucide-react';
import { getPosterUrl } from '@/lib/image-utils';
import { formatRating, formatYear } from '@/lib/format';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { KodiSort, KodiFilter } from '@/api/types/common';

export function TVShowList() {
  const [searchInput, setSearchInput] = useState('');
  const searchQuery = useDebounce(searchInput, 300);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useViewMode('tvshows', 'list');

  const { setItems } = useBreadcrumbs();

  // Set breadcrumbs
  useEffect(() => {
    setItems([{ label: 'TV Shows' }]);
  }, [setItems]);

  // Build sort object
  const sort: KodiSort = {
    method: sortBy as 'title' | 'year' | 'rating' | 'dateadded',
    order: sortOrder === 'asc' ? 'ascending' : 'descending',
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

  const observerTarget = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  // Extract all TV shows from pages
  const tvshows = useMemo(() => data?.pages.flatMap((page) => page.tvshows) ?? [], [data?.pages]);

  // Extract unique genres for filter
  const genres = useMemo(() => {
    const allGenres = new Set<string>();
    tvshows.forEach((show) => {
      show.genre?.forEach((g) => allGenres.add(g));
    });
    return Array.from(allGenres).sort();
  }, [tvshows]);

  // Extract unique tags for filter
  const tags = useMemo(() => {
    const allTags = new Set<string>();
    tvshows.forEach((show) => {
      show.tag?.forEach((t) => allTags.add(t));
    });
    return Array.from(allTags).sort();
  }, [tvshows]);

  // Apply client-side tag filter
  const filteredTVShows =
    selectedTag === 'all' ? tvshows : tvshows.filter((show) => show.tag?.includes(selectedTag));

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="container space-y-4 py-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
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
      <div className="container space-y-4 py-6">
        <ErrorState title="Error loading TV shows" error={error} />
      </div>
    );
  }

  const totalCount = data?.pages[0]?.total ?? 0;

  return (
    <div className="container space-y-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-end gap-2">
        <div className="bg-muted/50 flex h-11 items-center rounded-lg border px-3">
          <p className="text-muted-foreground text-sm">{totalCount.toLocaleString()} TV shows</p>
        </div>
        <ViewToggle value={viewMode} onChange={setViewMode} className="border" />
      </div>

      {/* TV Shows Grid/List */}
      {filteredTVShows.length === 0 &&
      !searchInput &&
      selectedGenre === 'all' &&
      selectedTag === 'all' ? (
        <EmptyState title="No TV shows found" description="Your TV show library is empty." />
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="bg-muted/50 rounded-md border">
              <Table>
                <TableHeader>
                  {/* Filters Row */}
                  <TableRow className="hover:bg-transparent">
                    <TableHead colSpan={8} className="h-14">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                          <Input
                            type="search"
                            placeholder="Search TV shows..."
                            value={searchInput}
                            onChange={(e) => {
                              setSearchInput(e.target.value);
                            }}
                            className="w-64 pl-8"
                          />
                        </div>

                        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
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

                        {tags.length > 0 && (
                          <Select value={selectedTag} onValueChange={setSelectedTag}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Tag" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Tags</SelectItem>
                              {tags.map((tag) => (
                                <SelectItem key={tag} value={tag}>
                                  {tag}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                  {/* Column Headers Row */}
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
                    <TableHead>Seasons</TableHead>
                    <TableHead>Episodes</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTVShows.map((tvshow) => {
                    const posterUrl = getPosterUrl(tvshow.art);
                    const year = formatYear(tvshow.year ?? tvshow.premiered);
                    const rating = tvshow.rating ? formatRating(tvshow.rating) : null;
                    const genre = tvshow.genre?.[0] ?? '-';
                    const watchedEpisodes = tvshow.watchedepisodes ?? 0;
                    const totalEpisodes = tvshow.episode ?? 0;
                    const isFullyWatched = totalEpisodes > 0 && watchedEpisodes >= totalEpisodes;
                    const isPartiallyWatched = watchedEpisodes > 0 && !isFullyWatched;

                    return (
                      <TableRow key={tvshow.tvshowid}>
                        <TableCell>
                          {posterUrl ? (
                            <img
                              src={posterUrl}
                              alt={tvshow.title}
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
                            to="/tv/$tvshowId"
                            params={{ tvshowId: tvshow.tvshowid.toString() }}
                            className="font-medium hover:underline"
                          >
                            {tvshow.title}
                          </Link>
                          {tvshow.studio && tvshow.studio.length > 0 && (
                            <div className="text-muted-foreground text-sm">{tvshow.studio[0]}</div>
                          )}
                        </TableCell>
                        <TableCell>{year ? year : '-'}</TableCell>
                        <TableCell>{genre}</TableCell>
                        <TableCell>{rating ?? '-'}</TableCell>
                        <TableCell>{tvshow.season ?? '-'}</TableCell>
                        <TableCell>
                          {watchedEpisodes}/{totalEpisodes}
                        </TableCell>
                        <TableCell>
                          {isFullyWatched ? (
                            <Badge variant="secondary" className="gap-1">
                              <Eye className="h-3 w-3" />
                              Complete
                            </Badge>
                          ) : isPartiallyWatched ? (
                            <Badge variant="outline" className="gap-1">
                              <Tv className="h-3 w-3" />
                              In Progress
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <EyeOff className="h-3 w-3" />
                              New
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredTVShows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                        No TV shows found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <>
              {/* Filters for grid view */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search TV shows..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                    }}
                    className="w-64 pl-8"
                  />
                </div>

                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
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

                {tags.length > 0 && (
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {tags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
                {filteredTVShows.map((tvshow) => (
                  <TVShowCard key={tvshow.tvshowid} tvshow={tvshow} />
                ))}
              </div>
            </>
          )}

          {/* Loading indicator */}
          <div ref={observerTarget} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <div className="text-muted-foreground flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading more TV shows...</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
