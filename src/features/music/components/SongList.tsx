import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SongRow } from './SongRow';
import { useSongsInfinite } from '@/api/hooks/useSongs';
import { usePlaySong } from '@/api/hooks/useMusicPlayback';
import { useSongFilters } from '../hooks/useSongFilters';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { Search, Loader2, ListMusic, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

export function SongList() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSongsInfinite();

  const observerTarget = useRef<HTMLDivElement>(null);
  const playMutation = usePlaySong();

  // Flatten all pages into a single array
  const allSongs = data?.pages.flatMap((page) => page.songs) || [];

  // Get the total count from Kodi's API response
  const kodiTotal = data?.pages[0]?.total;

  const { filters, setFilters, filteredSongs, genres, filteredCount, totalCount } = useSongFilters(
    allSongs,
    kodiTotal
  );

  const { setItems } = useBreadcrumbs();

  // Set breadcrumbs
  useEffect(() => {
    setItems([{ label: 'Music' }, { label: 'Songs' }]);
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

  const handlePlaySong = async (songId: number) => {
    try {
      await playMutation.mutateAsync(songId);

      const song = allSongs.find((s) => s.songid === songId);
      toast.success('Playing', {
        description: song ? `Now playing: ${song.title}` : 'Now playing',
      });
    } catch (error) {
      toast.error('Playback Error', {
        description: error instanceof Error ? error.message : 'Failed to start playback',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <div className="bg-muted h-10 w-full max-w-md animate-pulse rounded-lg" />
          <div className="bg-muted h-8 w-48 animate-pulse rounded-lg" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading songs</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (allSongs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-muted/50 rounded-lg border p-12 text-center">
          <ListMusic className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="mb-2 text-xl font-semibold">No songs found</h2>
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
        {/* Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search songs..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
              }}
              className="pl-10"
            />
          </div>
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
            onValueChange={(value: 'title' | 'artist' | 'album' | 'year' | 'dateadded') => {
              setFilters({ ...filters, sortBy: value });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="artist">Artist</SelectItem>
              <SelectItem value="album">Album</SelectItem>
              <SelectItem value="year">Year</SelectItem>
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
          Showing {filteredCount} of {totalCount} songs
        </p>
      </div>

      {/* Song table */}
      {filteredSongs.length > 0 ? (
        <>
          {/* Table header */}
          <div className="text-muted-foreground mb-2 flex items-center gap-3 px-2 text-sm font-medium">
            <div className="w-8 text-right">#</div>
            <div className="flex-1">Title</div>
            <div className="hidden flex-1 sm:block">Artist</div>
            <div className="hidden flex-1 md:block">Album</div>
            <div className="w-16 text-right">Duration</div>
            <div className="w-8" /> {/* Spacer for play button */}
          </div>

          {/* Song rows */}
          <div className="space-y-0.5">
            {filteredSongs.map((song) => (
              <SongRow
                key={song.songid}
                song={song}
                showArtist={true}
                showAlbum={true}
                onPlay={() => void handlePlaySong(song.songid)}
              />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <div className="text-muted-foreground flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading more songs...</span>
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
