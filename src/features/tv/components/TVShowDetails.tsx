import { useState, useEffect } from 'react';
import { useParams, Outlet, useMatches } from '@tanstack/react-router';
import { Calendar, Star, Tv, Eye, Loader2, Download, ImageIcon, Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTVShowDetails } from '@/api/hooks/useTVShowDetails';
import { useSeasons } from '@/api/hooks/useSeasons';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MediaImage } from '@/components/media/MediaImage';
import { SeasonList } from './SeasonList';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getFanartUrl, getPosterUrl, getImageUrl } from '@/lib/image-utils';
import { joinArray } from '@/lib/format';
import { useUpdateTVShowArtwork } from '@/api/hooks/useMovieArtwork';
import { FetchArtworkDialog } from '@/components/artwork/FetchArtworkDialog';
import type { KodiArt } from '@/api/types/common';

// Kodi standard artwork dimensions and aspect ratios
const ARTWORK_TYPES = [
  { key: 'poster', label: 'Poster', width: 1000, height: 1500, aspectRatio: '2/3' },
  { key: 'fanart', label: 'Fanart', width: 1920, height: 1080, aspectRatio: '16/9' },
  { key: 'clearlogo', label: 'Clear Logo', width: 800, height: 310, aspectRatio: '800/310' },
  { key: 'banner', label: 'Banner', width: 1000, height: 185, aspectRatio: '1000/185' },
] as const;

type ArtworkType = (typeof ARTWORK_TYPES)[number]['key'];

export function TVShowDetails() {
  const { tvshowId } = useParams({ strict: false });
  const tvshowIdNum = parseInt(tvshowId ?? '0', 10);
  const matches = useMatches();
  const queryClient = useQueryClient();

  // Check if we're on a child route (season or episode)
  const isOnChildRoute = matches.some((match) => match.routeId.includes('/$season'));

  const { data: tvshow, isLoading, isError, error } = useTVShowDetails(tvshowIdNum);
  const { data: seasons, isLoading: isLoadingSeasons } = useSeasons(tvshowIdNum);
  const { setItems } = useBreadcrumbs();

  // Dialog states
  const [artworkDialogOpen, setArtworkDialogOpen] = useState(false);
  const [fetchArtworkDialogOpen, setFetchArtworkDialogOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<{ type: ArtworkType; url: string } | null>(
    null
  );

  // Artwork mutation
  const updateArtworkMutation = useUpdateTVShowArtwork();

  // Set breadcrumbs when tvshow data is loaded
  useEffect(() => {
    if (isOnChildRoute) return; // Don't set breadcrumbs when on child route
    if (tvshow) {
      const showLabel = tvshow.year ? `${tvshow.title} (${String(tvshow.year)})` : tvshow.title;
      setItems([{ label: 'TV Shows', href: '/tv' }, { label: showLabel }]);
    } else {
      setItems([{ label: 'TV Shows', href: '/tv' }, { label: 'Loading...' }]);
    }
  }, [tvshow, setItems, isOnChildRoute]);

  // If we're on a child route, just render the outlet
  if (isOnChildRoute) {
    return <Outlet />;
  }

  const handleEditArtwork = (type: ArtworkType, currentUrl: string | undefined) => {
    setEditingArtwork({ type, url: currentUrl ?? '' });
    setArtworkDialogOpen(true);
  };

  const handleSaveArtwork = () => {
    if (editingArtwork && tvshow) {
      updateArtworkMutation.mutate(
        {
          tvshowId: tvshow.tvshowid,
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
    if (!tvshow?.art) return undefined;
    const artKey = type as keyof KodiArt;
    const artPath = tvshow.art[artKey];
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

  if (isError || !tvshow) {
    return (
      <div className="container py-6">
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6 text-center">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading TV show</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'TV show not found'}
          </p>
        </div>
      </div>
    );
  }

  const fanartUrl = getFanartUrl(tvshow.art);
  const posterUrl = getPosterUrl(tvshow.art);
  const studios = joinArray(tvshow.studio);
  const genres = joinArray(tvshow.genre);

  const totalEpisodes = tvshow.episode ?? 0;
  const watchedEpisodes = tvshow.watchedepisodes ?? 0;
  const progressPercent =
    totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0;

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
                alt={tvshow.title}
                aspectRatio="poster"
                placeholderType="poster"
                className="h-48 w-32 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="bg-muted flex h-48 w-32 items-center justify-center rounded-lg">
                <Tv className="text-muted-foreground h-12 w-12" />
              </div>
            )}

            {/* Title and metadata */}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-3xl font-bold">{tvshow.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {tvshow.premiered && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {tvshow.premiered.substring(0, 4)}
                  </Badge>
                )}
                {tvshow.rating && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    {tvshow.rating.toFixed(1)}
                  </Badge>
                )}
                {tvshow.mpaa && <Badge variant="outline">{tvshow.mpaa}</Badge>}
              </div>
              {/* Progress bar */}
              {totalEpisodes > 0 && (
                <div className="mt-3 flex max-w-xs items-center gap-2">
                  <Progress value={progressPercent} className="h-2 flex-1" />
                  <span className="text-muted-foreground text-sm">
                    {watchedEpisodes}/{totalEpisodes} watched
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="seasons">
        <TabsList>
          <TabsTrigger value="seasons">Seasons</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="cast">Cast</TabsTrigger>
          <TabsTrigger value="artwork">Artwork</TabsTrigger>
        </TabsList>

        <TabsContent value="seasons" className="space-y-6">
          {isLoadingSeasons ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            seasons && seasons.length > 0 && <SeasonList seasons={seasons} tvshowId={tvshowIdNum} />
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {/* Plot */}
          {tvshow.plot && (
            <Card>
              <CardHeader>
                <CardTitle>Plot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{tvshow.plot}</p>
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
                {tvshow.premiered && (
                  <div>
                    <span className="text-muted-foreground text-sm">Premiered</span>
                    <p>{tvshow.premiered}</p>
                  </div>
                )}
                {tvshow.imdbnumber && (
                  <div>
                    <span className="text-muted-foreground text-sm">IMDB</span>
                    <p>
                      <a
                        href={`https://www.imdb.com/title/${tvshow.imdbnumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {tvshow.imdbnumber}
                      </a>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-muted-foreground text-sm">Total Seasons</span>
                  <p>{tvshow.season ?? 0}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Total Episodes</span>
                  <p>{totalEpisodes}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Watched</span>
                  <p className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {watchedEpisodes} / {totalEpisodes} episodes
                  </p>
                </div>
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
              {tvshow.cast && tvshow.cast.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {tvshow.cast.map((member, idx) => {
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
        mediaType="tv"
        title={tvshow.title}
        year={tvshow.premiered ? parseInt(tvshow.premiered.substring(0, 4), 10) : undefined}
        tvshowId={tvshow.tvshowid}
        onArtworkUpdated={() => {
          void queryClient.invalidateQueries({ queryKey: ['tvshow', tvshowIdNum] });
        }}
      />
    </div>
  );
}
