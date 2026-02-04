import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Play } from 'lucide-react';
import { useEpisodeDetails } from '@/api/hooks/useEpisodes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MediaImage } from '@/components/media/MediaImage';
import { WatchedIndicator } from '@/components/video/WatchedIndicator';
import { MovieCast } from '@/features/movies/components/MovieCast';
import { getThumbnailUrl, getFanartUrl } from '@/lib/image-utils';
import { formatRuntime } from '@/lib/format';
import { useMutation } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import { toast } from 'sonner';

export function EpisodeDetails() {
  const { tvshowId, season, episodeId } = useParams({ strict: false });
  const episodeIdNum = parseInt(episodeId, 10);

  const { data: episode, isLoading, isError, error } = useEpisodeDetails(episodeIdNum);

  const playMutation = useMutation({
    mutationFn: async () => {
      await kodi.call('Player.Open', {
        item: { episodeid: episodeIdNum },
      });
    },
    onSuccess: () => {
      if (episode) {
        toast.success('Playing', {
          description: `Now playing: ${episode.title}`,
        });
      }
    },
    onError: (error) => {
      toast.error('Playback Error', {
        description: error instanceof Error ? error.message : 'Failed to start playback',
      });
    },
  });

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
        <Link to="/tv/$tvshowId/$season" params={{ tvshowId, season }}>
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Season
          </Button>
        </Link>
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading episode</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'Episode not found'}
          </p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
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
        <Link to="/tv/$tvshowId/$season" params={{ tvshowId, season }}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Season {season}
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Poster */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <MediaImage
              src={thumbnailUrl}
              alt={episode.title}
              aspectRatio="video"
              placeholderType="video"
              className="w-full rounded-lg"
            />
            {hasResume && (
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
                    params={{ tvshowId }}
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
                  playMutation.mutate();
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
