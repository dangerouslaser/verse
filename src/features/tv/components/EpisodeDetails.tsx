import { useParams, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Play } from 'lucide-react';
import { useEpisodeDetails } from '@/api/hooks/useEpisodes';
import { usePlayEpisode } from '@/api/hooks/usePlayback';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MediaImage } from '@/components/media/MediaImage';
import { WatchedIndicator } from '@/components/video/WatchedIndicator';
import { MovieCast } from '@/features/movies/components/MovieCast';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getThumbnailUrl, getFanartUrl } from '@/lib/image-utils';
import { formatRuntime } from '@/lib/format';

export function EpisodeDetails() {
  const { tvshowId, season, episodeId } = useParams({ strict: false });
  const episodeIdNum = parseInt(episodeId ?? '0', 10);

  const { data: episode, isLoading, isError, error } = useEpisodeDetails(episodeIdNum);
  const playMutation = usePlayEpisode();
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
      <div className="min-h-screen">
        <div className="relative h-[50vh] w-full">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !episode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading episode</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'Episode not found'}
          </p>
        </div>
      </div>
    );
  }

  const thumbnailUrl: string | undefined = getThumbnailUrl(episode.art);

  const fanartUrl: string | undefined = getFanartUrl(episode.art);
  const isWatched = episode.playcount !== undefined && episode.playcount > 0;
  const hasResume: boolean = Boolean(episode.resume?.position && episode.resume.position > 0);

  return (
    <div className="min-h-screen">
      {/* Backdrop with gradient overlay */}
      {(fanartUrl || thumbnailUrl) && (
        <div className="relative h-[50vh] w-full">
          <MediaImage
            src={fanartUrl || thumbnailUrl}
            alt={episode.title}
            aspectRatio="fanart"
            loading="eager"
            placeholderType="fanart"
            className="h-full w-full"
          />
          <div className="from-background via-background/60 absolute inset-0 bg-gradient-to-t to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Poster */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <MediaImage
              src={thumbnailUrl}
              alt={episode.title}
              aspectRatio="video"
              placeholderType="fanart"
              className="w-full rounded-lg"
            />
            {hasResume && episode.resume && (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/60">
                <div
                  className="bg-primary h-full"
                  style={{
                    width: `${String((episode.resume.position / episode.resume.total) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title and Watched Indicator */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-muted-foreground font-mono text-lg">
                    S{String(episode.season).padStart(2, '0')}E
                    {String(episode.episode).padStart(2, '0')}
                  </span>
                  <h1 className="text-4xl font-bold">{episode.title}</h1>
                </div>
                {episode.showtitle && (
                  <Link
                    to="/tv/$tvshowId"
                    params={{ tvshowId: tvshowId ?? '' }}
                    className="text-muted-foreground hover:text-primary text-lg transition-colors"
                  >
                    {episode.showtitle}
                  </Link>
                )}
              </div>
              {isWatched && <WatchedIndicator playcount={episode.playcount} variant="icon" />}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => {
                  playMutation.mutate({
                    episodeid: episodeIdNum,
                    title: episode.title,
                    season: episode.season,
                    episode: episode.episode,
                  });
                }}
                disabled={playMutation.isPending}
              >
                <Play className="h-5 w-5" fill="currentColor" />
                {hasResume ? 'Resume' : 'Play'}
              </Button>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2">
              {episode.firstaired && <Badge variant="outline">{episode.firstaired}</Badge>}
              {episode.runtime && <Badge variant="outline">{formatRuntime(episode.runtime)}</Badge>}
              {episode.rating && (
                <Badge variant="outline">
                  ★ {episode.rating.toFixed(1)}
                  {episode.votes && ` (${episode.votes} votes)`}
                </Badge>
              )}
            </div>

            {/* Plot */}
            {episode.plot && (
              <div>
                <h2 className="mb-2 text-xl font-bold">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">{episode.plot}</p>
              </div>
            )}

            {/* Directors */}
            {episode.director && episode.director.length > 0 && (
              <div>
                <h2 className="mb-2 text-xl font-bold">
                  Director{episode.director.length > 1 ? 's' : ''}
                </h2>
                <p className="text-muted-foreground">{episode.director.join(', ')}</p>
              </div>
            )}

            {/* Writers */}
            {episode.writer && episode.writer.length > 0 && (
              <div>
                <h2 className="mb-2 text-xl font-bold">
                  Writer{episode.writer.length > 1 ? 's' : ''}
                </h2>
                <p className="text-muted-foreground">{episode.writer.join(', ')}</p>
              </div>
            )}

            {/* Cast */}
            {episode.cast && episode.cast.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold">Cast</h2>
                <MovieCast cast={episode.cast} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
