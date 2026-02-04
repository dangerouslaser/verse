import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MediaPoster } from '@/components/media/MediaPoster';
import type { KodiSeason } from '@/api/types/video';

interface SeasonListProps {
  seasons: KodiSeason[];
  tvshowId: number;
}

export function SeasonList({ seasons, tvshowId }: SeasonListProps) {
  // Sort seasons by season number, handling specials (season 0) at the end
  const sortedSeasons = [...seasons].sort((a, b) => {
    if (a.season === 0) return 1;
    if (b.season === 0) return -1;
    return a.season - b.season;
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sortedSeasons.map((season) => {
        const totalEpisodes = season.episode || 0;
        const watchedEpisodes = season.watchedepisodes || 0;
        const progress = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0;

        const linkParams = { tvshowId: String(tvshowId), season: String(season.season) };

        return (
          <Link
            key={season.seasonid}
            to="/tv/$tvshowId/$season"
            params={linkParams}
            className="block"
          >
            <Card className="group cursor-pointer overflow-hidden transition-transform duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                  <div className="relative w-24 flex-shrink-0">
                    <MediaPoster
                      art={season.art}
                      title={season.season === 0 ? 'Specials' : `Season ${String(season.season)}`}
                    />
                    {/* Progress indicator */}
                    {watchedEpisodes > 0 && (
                      <div className="absolute right-0 bottom-0 left-0 h-1 bg-black/60">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${String(progress)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-center space-y-2">
                    <h3 className="group-hover:text-primary font-semibold">
                      {season.season === 0 ? 'Specials' : `Season ${String(season.season)}`}
                    </h3>
                    {totalEpisodes > 0 && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm">
                          {watchedEpisodes}/{totalEpisodes} episodes
                        </p>
                        {watchedEpisodes === totalEpisodes && totalEpisodes > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
