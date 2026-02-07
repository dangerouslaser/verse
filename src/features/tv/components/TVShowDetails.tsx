import { useState, useEffect } from 'react';
import { useParams, Outlet, useMatches } from '@tanstack/react-router';
import { Calendar, Star, Tv, Eye } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTVShowDetails } from '@/api/hooks/useTVShowDetails';
import { useSeasons } from '@/api/hooks/useSeasons';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { MediaImage } from '@/components/media/MediaImage';
import { SeasonList } from './SeasonList';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getFanartUrl, getPosterUrl, getImageUrl } from '@/lib/image-utils';
import { joinArray } from '@/lib/format';
import { useUpdateTVShowArtwork } from '@/api/hooks/useMovieArtwork';
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
  { key: 'banner', label: 'Banner', width: 1000, height: 185, aspectRatio: '1000/185' },
] as const;

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
  const [fetchArtworkDialogOpen, setFetchArtworkDialogOpen] = useState(false);

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
        <ErrorState
          title="Error loading TV show"
          error={error ?? undefined}
          message="TV show not found"
          centered
        />
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
              <CastGrid cast={tvshow.cast ?? []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artwork">
          <ArtworkManagementTab
            artworkTypes={ARTWORK_TYPES}
            getArtworkUrl={(key) => {
              if (!tvshow.art) return undefined;
              const artPath = tvshow.art[key as keyof KodiArt];
              return artPath ? getImageUrl(artPath) : undefined;
            }}
            onSaveArtwork={(key, url) => {
              updateArtworkMutation.mutate(
                { tvshowId: tvshow.tvshowid, artworkType: key, url },
                { onSuccess: () => {} }
              );
            }}
            isSaving={updateArtworkMutation.isPending}
            gridCols="4"
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
