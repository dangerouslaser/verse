import { useParams, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Calendar, Clock, Star, Play, Eye, EyeOff, Tv } from 'lucide-react';
import { useEpisodeDetails } from '@/api/hooks/useEpisodes';
import { usePlayEpisode, useSetEpisodeWatched } from '@/api/hooks/usePlayback';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaImage } from '@/components/media/MediaImage';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getThumbnailUrl, getFanartUrl, getImageUrl } from '@/lib/image-utils';
import { formatRuntime } from '@/lib/format';

export function EpisodeDetails() {
  const { tvshowId, season, episodeId } = useParams({ strict: false });
  const episodeIdNum = parseInt(episodeId ?? '0', 10);

  const { data: episode, isLoading, isError, error } = useEpisodeDetails(episodeIdNum);
  const playMutation = usePlayEpisode();
  const setWatchedMutation = useSetEpisodeWatched();
  const { setItems } = useBreadcrumbs();

  // Set breadcrumbs when episode data is loaded
  useEffect(() => {
    if (episode) {
      const seasonLabel = episode.season === 0 ? 'Specials' : `Season ${String(episode.season)}`;
      setItems([
        { label: 'TV Shows', href: '/tv' },
        { label: episode.showtitle || 'TV Show', href: `/tv/${tvshowId ?? ''}` },
        { label: seasonLabel, href: `/tv/${tvshowId ?? ''}/${season ?? ''}` },
        { label: episode.title },
      ]);
    } else if (tvshowId && season) {
      const seasonNum = parseInt(season, 10);
      const seasonLabel = seasonNum === 0 ? 'Specials' : `Season ${String(seasonNum)}`;
      setItems([
        { label: 'TV Shows', href: '/tv' },
        { label: 'Loading...', href: `/tv/${tvshowId}` },
        { label: seasonLabel, href: `/tv/${tvshowId}/${season}` },
        { label: 'Loading...' },
      ]);
    }
  }, [episode, tvshowId, season, setItems]);

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

  if (isError || !episode) {
    return (
      <div className="container py-6">
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6 text-center">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading episode</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'Episode not found'}
          </p>
        </div>
      </div>
    );
  }

  const thumbnailUrl = getThumbnailUrl(episode.art);
  // Episode art includes tvshow.fanart - use that for the hero background
  const tvshowFanart = episode.art?.['tvshow.fanart'];
  const fanartUrl = getImageUrl(tvshowFanart) ?? getFanartUrl(episode.art);
  const isWatched = episode.playcount !== undefined && episode.playcount > 0;
  const hasResume = Boolean(episode.resume?.position && episode.resume.position > 0);

  const episodeCode = `S${String(episode.season).padStart(2, '0')}E${String(episode.episode).padStart(2, '0')}`;
  const directors = episode.director?.join(', ');
  const writers = episode.writer?.join(', ');

  const handlePlay = (resume: boolean = false) => {
    playMutation.mutate({
      episodeid: episodeIdNum,
      title: episode.title,
      season: episode.season,
      episode: episode.episode,
      resume,
    });
  };

  const handleToggleWatched = () => {
    setWatchedMutation.mutate({
      episodeid: episodeIdNum,
      playcount: isWatched ? 0 : 1,
    });
  };

  return (
    <div className="container space-y-6 py-6">
      {/* Hero Section with Fanart/Thumbnail */}
      <div className="bg-muted relative overflow-hidden rounded-lg">
        {fanartUrl || thumbnailUrl ? (
          <>
            <MediaImage
              src={fanartUrl ?? thumbnailUrl}
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

        <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-6">
            {/* Episode Thumbnail - hidden on mobile */}
            {thumbnailUrl ? (
              <MediaImage
                src={thumbnailUrl}
                alt={episode.title}
                aspectRatio="video"
                placeholderType="fanart"
                className="hidden h-32 w-56 rounded-lg object-cover shadow-lg md:block"
              />
            ) : (
              <div className="bg-muted hidden h-32 w-56 items-center justify-center rounded-lg md:flex">
                <Tv className="text-muted-foreground h-12 w-12" />
              </div>
            )}

            {/* Title and metadata */}
            <div className="min-w-0 flex-1">
              <Link
                to="/tv/$tvshowId"
                params={{ tvshowId: tvshowId ?? '' }}
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                {episode.showtitle}
              </Link>
              <h1 className="text-xl font-bold md:truncate md:text-3xl">
                <span className="text-muted-foreground mr-2 font-mono">{episodeCode}</span>
                {episode.title}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2 md:mt-3">
                {episode.firstaired && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {episode.firstaired}
                  </Badge>
                )}
                {episode.runtime && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRuntime(episode.runtime)}
                  </Badge>
                )}
                {episode.rating !== undefined && episode.rating > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    {episode.rating.toFixed(1)}
                  </Badge>
                )}
                {isWatched && <Badge variant="outline">Watched</Badge>}
              </div>
            </div>

            {/* Play button */}
            <div className="hidden gap-2 md:flex">
              <Button
                variant="play"
                onClick={() => {
                  handlePlay(hasResume);
                }}
                disabled={playMutation.isPending}
                className="gap-2"
              >
                <Play className="h-4 w-4" fill="currentColor" />
                {hasResume ? 'Resume' : 'Play'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile actions */}
      <div className="flex flex-wrap gap-3 md:hidden">
        <Button
          variant="play"
          onClick={() => {
            handlePlay(hasResume);
          }}
          disabled={playMutation.isPending}
          className="gap-2"
        >
          <Play className="h-4 w-4" fill="currentColor" />
          {hasResume ? 'Resume' : 'Play'}
        </Button>
        <Button
          variant="outline"
          onClick={handleToggleWatched}
          disabled={setWatchedMutation.isPending}
          className="gap-2"
        >
          {isWatched ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {isWatched ? 'Mark Unwatched' : 'Mark Watched'}
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="cast">Cast</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Plot */}
          {episode.plot && (
            <Card>
              <CardHeader>
                <CardTitle>Synopsis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{episode.plot}</p>
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
                {episode.firstaired && (
                  <div>
                    <span className="text-muted-foreground text-sm">First Aired</span>
                    <p>{episode.firstaired}</p>
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
                    {isWatched ? (
                      <>
                        <Eye className="h-4 w-4" />
                        Watched
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Unwatched
                      </>
                    )}
                  </p>
                </div>
                {episode.runtime && (
                  <div>
                    <span className="text-muted-foreground text-sm">Runtime</span>
                    <p>{formatRuntime(episode.runtime)}</p>
                  </div>
                )}
                {episode.rating !== undefined && episode.rating > 0 && (
                  <div>
                    <span className="text-muted-foreground text-sm">Rating</span>
                    <p>
                      {episode.rating.toFixed(1)}
                      {episode.votes && ` (${episode.votes} votes)`}
                    </p>
                  </div>
                )}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleWatched}
                    disabled={setWatchedMutation.isPending}
                    className="gap-2"
                  >
                    {isWatched ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {isWatched ? 'Mark Unwatched' : 'Mark Watched'}
                  </Button>
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
              {episode.cast && episode.cast.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {episode.cast.map((member, idx) => {
                    const castThumbnailUrl = member.thumbnail
                      ? getImageUrl(member.thumbnail)
                      : null;
                    return (
                      <div
                        key={`${member.name}-${String(idx)}`}
                        className="bg-muted/50 flex items-center gap-3 rounded-md p-2"
                      >
                        {castThumbnailUrl ? (
                          <img
                            src={castThumbnailUrl}
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
      </Tabs>
    </div>
  );
}
