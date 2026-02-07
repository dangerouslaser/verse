import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { Calendar, Clock, Star, Film, Eye } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMovieDetails } from '@/api/hooks/useMovieDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaImage } from '@/components/media/MediaImage';
import { MovieActions } from './MovieActions';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getFanartUrl, getPosterUrl, getImageUrl } from '@/lib/image-utils';
import { formatRuntime, formatDate, joinArray } from '@/lib/format';
import { useUpdateMovieArtwork } from '@/api/hooks/useMovieArtwork';
import { FetchArtworkDialog } from '@/components/artwork/FetchArtworkDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { CastGrid } from '@/components/media/CastGrid';
import { ArtworkManagementTab } from '@/components/media/ArtworkManagementTab';
import type { KodiArt } from '@/api/types/common';

// Kodi standard artwork dimensions and aspect ratios
const ARTWORK_TYPES = [
  { key: 'poster', label: 'Poster', width: 1000, height: 1500, aspectRatio: '2/3' },
  { key: 'fanart', label: 'Fanart', width: 1920, height: 1080, aspectRatio: '16/9' },
  { key: 'clearlogo', label: 'Clear Logo', width: 800, height: 310, aspectRatio: '800/310' },
  { key: 'clearart', label: 'Clear Art', width: 1000, height: 562, aspectRatio: '1000/562' },
  { key: 'landscape', label: 'Landscape', width: 500, height: 281, aspectRatio: '16/9' },
  { key: 'banner', label: 'Banner', width: 1000, height: 185, aspectRatio: '1000/185' },
] as const;

export function MovieDetails() {
  const { movieId } = useParams({ strict: false });
  const movieIdNum = parseInt(movieId ?? '0', 10);
  const queryClient = useQueryClient();

  const { data: movie, isLoading, isError, error } = useMovieDetails(movieIdNum);
  const { setItems } = useBreadcrumbs();

  // Dialog states
  const [fetchArtworkDialogOpen, setFetchArtworkDialogOpen] = useState(false);

  // Artwork mutation
  const updateArtworkMutation = useUpdateMovieArtwork();

  // Set breadcrumbs when movie data is loaded
  useEffect(() => {
    if (movie) {
      const movieLabel = movie.year ? `${movie.title} (${String(movie.year)})` : movie.title;
      setItems([{ label: 'Movies', href: '/movies' }, { label: movieLabel }]);
    } else {
      setItems([{ label: 'Movies', href: '/movies' }, { label: 'Loading...' }]);
    }
  }, [movie, setItems]);

  if (isLoading) {
    return (
      <div className="container space-y-6 py-6">
        <div className="relative overflow-hidden rounded-lg">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="container py-6">
        <ErrorState
          title="Error loading movie"
          error={error ?? undefined}
          message="Movie not found"
          centered
        />
      </div>
    );
  }

  const fanartUrl = getFanartUrl(movie.art);
  const posterUrl = getPosterUrl(movie.art);
  const directors = joinArray(movie.director);
  const writers = joinArray(movie.writer);
  const studios = joinArray(movie.studio);
  const countries = joinArray(movie.country);
  const genres = joinArray(movie.genre);

  return (
    <div className="container space-y-6 py-6">
      {/* Hero Section with Fanart */}
      <div className="bg-muted relative overflow-hidden rounded-lg">
        {fanartUrl ? (
          <>
            <MediaImage
              src={fanartUrl}
              alt=""
              aspectRatio="fanart"
              loading="eager"
              placeholderType="fanart"
              className="h-64 w-full object-cover"
            />
            <div className="from-background via-background/80 absolute inset-0 bg-gradient-to-t to-transparent" />
          </>
        ) : (
          <div className="h-32 w-full" />
        )}

        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="flex items-end gap-6">
            {/* Poster */}
            {posterUrl ? (
              <MediaImage
                src={posterUrl}
                alt={movie.title}
                aspectRatio="poster"
                placeholderType="poster"
                className="h-48 w-32 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="bg-muted flex h-48 w-32 items-center justify-center rounded-lg">
                <Film className="text-muted-foreground h-12 w-12" />
              </div>
            )}

            {/* Title and metadata */}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-3xl font-bold">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-muted-foreground mt-1 italic">{movie.tagline}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {movie.year && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {movie.year}
                  </Badge>
                )}
                {movie.runtime && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRuntime(movie.runtime)}
                  </Badge>
                )}
                {movie.rating && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    {movie.rating.toFixed(1)}
                  </Badge>
                )}
                {movie.mpaa && <Badge variant="outline">{movie.mpaa}</Badge>}
              </div>
            </div>

            {/* Play button */}
            <div className="hidden gap-2 md:flex">
              <MovieActions movie={movie} compact />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile actions */}
      <div className="md:hidden">
        <MovieActions movie={movie} />
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="cast">Cast</TabsTrigger>
          <TabsTrigger value="artwork">Artwork</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Plot */}
          {movie.plot && (
            <Card>
              <CardHeader>
                <CardTitle>Plot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{movie.plot}</p>
              </CardContent>
            </Card>
          )}

          {/* Metadata Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {directors && (
                  <div>
                    <span className="text-muted-foreground text-sm">Director</span>
                    <p>{directors}</p>
                  </div>
                )}
                {writers && (
                  <div>
                    <span className="text-muted-foreground text-sm">Writers</span>
                    <p>{writers}</p>
                  </div>
                )}
                {genres && (
                  <div>
                    <span className="text-muted-foreground text-sm">Genre</span>
                    <p>{genres}</p>
                  </div>
                )}
                {studios && (
                  <div>
                    <span className="text-muted-foreground text-sm">Studio</span>
                    <p>{studios}</p>
                  </div>
                )}
                {countries && (
                  <div>
                    <span className="text-muted-foreground text-sm">Country</span>
                    <p>{countries}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Playback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-muted-foreground text-sm">Status</span>
                  <p className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {movie.playcount && movie.playcount > 0 ? 'Watched' : 'Unwatched'}
                  </p>
                </div>
                {movie.lastplayed && (
                  <div>
                    <span className="text-muted-foreground text-sm">Last Played</span>
                    <p>{formatDate(movie.lastplayed)}</p>
                  </div>
                )}
                {movie.dateadded && (
                  <div>
                    <span className="text-muted-foreground text-sm">Date Added</span>
                    <p>{formatDate(movie.dateadded)}</p>
                  </div>
                )}
                {movie.imdbnumber && (
                  <div>
                    <span className="text-muted-foreground text-sm">IMDB</span>
                    <p>
                      <a
                        href={`https://www.imdb.com/title/${movie.imdbnumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {movie.imdbnumber}
                      </a>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cast">
          <Card>
            <CardHeader>
              <CardTitle>Cast</CardTitle>
            </CardHeader>
            <CardContent>
              <CastGrid cast={movie.cast ?? []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artwork">
          <ArtworkManagementTab
            artworkTypes={ARTWORK_TYPES}
            getArtworkUrl={(key) => {
              if (!movie.art) return undefined;
              const artPath = movie.art[key as keyof KodiArt];
              return artPath ? getImageUrl(artPath) : undefined;
            }}
            onSaveArtwork={(key, url) => {
              updateArtworkMutation.mutate(
                { movieId: movie.movieid, artworkType: key, url },
                { onSuccess: () => {} }
              );
            }}
            isSaving={updateArtworkMutation.isPending}
            onFetchArtwork={() => {
              setFetchArtworkDialogOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Fetch Artwork Dialog */}
      <FetchArtworkDialog
        open={fetchArtworkDialogOpen}
        onOpenChange={setFetchArtworkDialogOpen}
        mediaType="movie"
        title={movie.title}
        year={movie.year}
        movieId={movie.movieid}
        onArtworkUpdated={() => {
          void queryClient.invalidateQueries({ queryKey: ['movie', movieIdNum] });
        }}
      />
    </div>
  );
}
