import { Link } from '@tanstack/react-router';
import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaImage } from '@/components/media/MediaImage';
import { WatchedIndicator } from '@/components/video/WatchedIndicator';
import { usePlayEpisode } from '@/api/hooks/usePlayback';
import type { KodiEpisode } from '@/api/types/video';
import { getThumbnailUrl } from '@/lib/image-utils';
import { formatRuntime } from '@/lib/format';

interface EpisodeListProps {
  episodes: KodiEpisode[];
  tvshowId: number;
  season: number;
}

export function EpisodeList({ episodes, tvshowId, season }: EpisodeListProps) {
  const playMutation = usePlayEpisode();

  const handlePlay = (episode: KodiEpisode) => {
    playMutation.mutate({
      episodeid: episode.episodeid,
      title: episode.title,
      season: episode.season,
      episode: episode.episode,
    });
  };

  return (
    <div className="space-y-3">
      {episodes.map((episode) => {
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
                    placeholderType="fanart"
                    className="rounded"
                  />
                  {hasResume && episode.resume && (
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
                        handlePlay(episode);
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
