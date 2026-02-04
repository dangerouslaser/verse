import { Link } from '@tanstack/react-router';
import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaImage } from '@/components/media/MediaImage';
import { WatchedIndicator } from '@/components/video/WatchedIndicator';
import type { KodiEpisode } from '@/api/types/video';
import { getThumbnailUrl } from '@/lib/image-utils';
import { formatRuntime } from '@/lib/format';
import { useMutation } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import { toast } from 'sonner';

interface EpisodeListProps {
  episodes: KodiEpisode[];
  tvshowId: number;
  season: number;
}

export function EpisodeList({ episodes, tvshowId, season }: EpisodeListProps) {
  const playMutation = useMutation({
    mutationFn: async (episodeid: number) => {
      await kodi.call('Player.Open', {
        item: { episodeid },
      });
    },
    onSuccess: (_, episodeid) => {
      const episode = episodes.find((ep) => ep.episodeid === episodeid);
      if (episode) {
        toast.success('Playing', {
          description: `Now playing: S${String(episode.season).padStart(2, '0')}E${String(episode.episode).padStart(2, '0')} - ${episode.title}`,
        });
      }
    },
    onError: (error) => {
      toast.error('Playback Error', {
        description: error instanceof Error ? error.message : 'Failed to start playback',
      });
    },
  });

  const handlePlay = (episodeid: number) => {
    playMutation.mutate(episodeid);
  };

  return (
    <div className="space-y-3">
      {episodes.map((episode) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const thumbnailUrl: string | undefined = getThumbnailUrl(episode.art);
        const isWatched = episode.playcount !== undefined && episode.playcount > 0;
        const hasResume: boolean = Boolean(episode.resume?.position && episode.resume.position > 0);

        return (
          <Card key={episode.episodeid} className="group overflow-hidden">
            <CardContent className="p-0">
              <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <Link
                  to="/tv/$tvshowId/$season/$episodeId"
                  params={{
                    tvshowId: String(tvshowId),
                    season: String(season),
                    episodeId: String(episode.episodeid),
                  }}
                  className="relative w-48 flex-shrink-0"
                >
                  <MediaImage
                    src={thumbnailUrl}
                    alt={episode.title}
                    aspectRatio="video"
                    placeholderType="video"
                    className="rounded"
                  />
                  {hasResume && (
                    <div className="absolute right-0 bottom-0 left-0 h-1 bg-black/60">
                      <div
                        className="bg-primary h-full"
                        style={{
                          width: `${String((episode.resume.position / episode.resume.total) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </Link>

                {/* Episode Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <Link
                        to="/tv/$tvshowId/$season/$episodeId"
                        params={{
                          tvshowId: String(tvshowId),
                          season: String(season),
                          episodeId: String(episode.episodeid),
                        }}
                        className="flex-1"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground min-w-[3rem] font-mono text-sm">
                            {String(episode.episode).padStart(2, '0')}.
                          </span>
                          <h3 className="group-hover:text-primary font-semibold transition-colors">
                            {episode.title}
                          </h3>
                        </div>
                      </Link>
                      {isWatched && (
                        <WatchedIndicator playcount={episode.playcount} variant="icon" />
                      )}
                    </div>

                    {episode.plot && (
                      <p className="text-muted-foreground line-clamp-2 text-sm">{episode.plot}</p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {episode.firstaired && (
                        <Badge variant="outline" className="text-xs">
                          {episode.firstaired}
                        </Badge>
                      )}
                      {episode.runtime && (
                        <Badge variant="outline" className="text-xs">
                          {formatRuntime(episode.runtime)}
                        </Badge>
                      )}
                      {episode.rating && (
                        <Badge variant="outline" className="text-xs">
                          ★ {episode.rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={() => {
                        handlePlay(episode.episodeid);
                      }}
                      disabled={playMutation.isPending}
                    >
                      <Play className="h-4 w-4" fill="currentColor" />
                      Play
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
