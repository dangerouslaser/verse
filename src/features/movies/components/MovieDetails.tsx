import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { Calendar, Clock, Star, Film, Eye, Loader2, Download, ImageIcon, Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMovieDetails } from '@/api/hooks/useMovieDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MediaImage } from '@/components/media/MediaImage';
import { MovieActions } from './MovieActions';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getFanartUrl, getPosterUrl, getImageUrl } from '@/lib/image-utils';
import { formatRuntime, formatDate, joinArray } from '@/lib/format';
import { useUpdateMovieArtwork } from '@/api/hooks/useMovieArtwork';
import { FetchArtworkDialog } from '@/components/artwork/FetchArtworkDialog';
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

type ArtworkType = (typeof ARTWORK_TYPES)[number]['key'];

export function MovieDetails() {
  const { movieId } = useParams({ strict: false });
  const movieIdNum = parseInt(movieId ?? '0', 10);
  const queryClient = useQueryClient();

  const { data: movie, isLoading, isError, error } = useMovieDetails(movieIdNum);
  const { setItems } = useBreadcrumbs();

  // Dialog states
  const [artworkDialogOpen, setArtworkDialogOpen] = useState(false);
  const [fetchArtworkDialogOpen, setFetchArtworkDialogOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<{ type: ArtworkType; url: string } | null>(
    null
  );

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

  const handleEditArtwork = (type: ArtworkType, currentUrl: string | undefined) => {
    setEditingArtwork({ type, url: currentUrl ?? '' });
    setArtworkDialogOpen(true);
  };

  const handleSaveArtwork = () => {
    if (editingArtwork && movie) {
      updateArtworkMutation.mutate(
        {
          movieId: movie.movieid,
          artworkType: editingArtwork.type,
          url: editingArtwork.url,
        },
        {
          onSuccess: () => {
            setArtworkDialogOpen(false);
            setEditingArtwork(null);
          },
        }
      );
    }
  };

  const getArtworkUrl = (type: ArtworkType): string | undefined => {
    if (!movie?.art) return undefined;
    const artKey = type as keyof KodiArt;
    const artPath = movie.art[artKey];
    return artPath ? getImageUrl(artPath) : undefined;
  };

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
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6 text-center">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading movie</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'Movie not found'}
          </p>
        </div>
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
              {movie.cast && movie.cast.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {movie.cast.map((member, idx) => {
                    const thumbnailUrl = member.thumbnail ? getImageUrl(member.thumbnail) : null;
                    return (
                      <div
                        key={`${member.name}-${String(idx)}`}
                        className="bg-muted/50 flex items-center gap-3 rounded-md p-2"
                      >
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={member.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{member.name}</p>
                          {member.role && (
                            <p className="text-muted-foreground truncate text-sm">{member.role}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  No cast information available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artwork">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Artwork Management</CardTitle>
              <Button
                variant="outline"
                onClick={() => {
                  setFetchArtworkDialogOpen(true);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Fetch Artwork
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ARTWORK_TYPES.map(({ key, label }) => {
                  const url = getArtworkUrl(key);
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{label}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleEditArtwork(key, url);
                          }}
                        >
                          <ImageIcon className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                      {url ? (
                        <img
                          src={url}
                          alt={label}
                          className="h-32 w-full rounded-md border object-cover"
                        />
                      ) : (
                        <div className="bg-muted flex h-32 w-full items-center justify-center rounded-md border">
                          <span className="text-muted-foreground text-sm">No {label}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Artwork Edit Dialog */}
      <Dialog open={artworkDialogOpen} onOpenChange={setArtworkDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit {ARTWORK_TYPES.find((t) => t.key === editingArtwork?.type)?.label}
            </DialogTitle>
            <DialogDescription>
              Enter the URL for the artwork image. This will update the Kodi database.
              {(() => {
                const artworkType = ARTWORK_TYPES.find((t) => t.key === editingArtwork?.type);
                return artworkType
                  ? ` Recommended size: ${String(artworkType.width)}×${String(artworkType.height)}px`
                  : '';
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={editingArtwork?.url ?? ''}
                onChange={(e) => {
                  setEditingArtwork((prev) => (prev ? { ...prev, url: e.target.value } : null));
                }}
                placeholder="https://..."
              />
            </div>
            {editingArtwork?.url && (
              <div className="space-y-2">
                <Label>Preview</Label>
                {(() => {
                  const artworkType = ARTWORK_TYPES.find((t) => t.key === editingArtwork.type);
                  const isPortrait = artworkType && artworkType.height > artworkType.width;
                  return (
                    <div
                      className="bg-muted/50 relative flex items-center justify-center overflow-hidden rounded-md border"
                      style={{
                        aspectRatio: artworkType?.aspectRatio ?? '16/9',
                        maxHeight: isPortrait ? '400px' : '300px',
                        width: isPortrait ? 'auto' : '100%',
                        margin: isPortrait ? '0 auto' : undefined,
                      }}
                    >
                      <img
                        src={editingArtwork.url}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setArtworkDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveArtwork}
              disabled={updateArtworkMutation.isPending || !editingArtwork?.url}
            >
              {updateArtworkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
