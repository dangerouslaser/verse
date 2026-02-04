import { Link } from '@tanstack/react-router';
import { MediaPoster } from '@/components/media/MediaPoster';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { KodiTVShow } from '@/api/types/video';
import { formatYear, formatRating } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface TVShowCardProps {
  tvshow: KodiTVShow;
  className?: string;
}

export function TVShowCard({ tvshow, className }: TVShowCardProps) {
  const year = formatYear(tvshow.year || tvshow.premiered);
  const rating = tvshow.rating ? formatRating(tvshow.rating) : null;

  const totalEpisodes = tvshow.episode || 0;
  const watchedEpisodes = tvshow.watchedepisodes || 0;
  const progress = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0;

  return (
    <Link
      to="/tv/$tvshowId"
      params={{ tvshowId: tvshow.tvshowid.toString() }}
      className={cn('group', className)}
    >
      <Card className="overflow-hidden border-0 bg-transparent shadow-none transition-transform duration-300 hover:scale-105">
        <CardContent className="p-0">
          <div className="relative">
            <MediaPoster art={tvshow.art} title={tvshow.title} />

            {/* Progress indicator */}
            {watchedEpisodes > 0 && (
              <div className="absolute right-0 bottom-0 left-0 h-1 bg-black/60">
                <div
                  className="bg-primary h-full transition-all"
                  style={{ width: `${String(progress)}%` }}
                />
              </div>
            )}

            {/* Rating badge */}
            {rating && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                  <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {rating}
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-2 space-y-1 px-1">
            <h3 className="group-hover:text-primary line-clamp-2 leading-tight font-semibold">
              {tvshow.title}
            </h3>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              {year && <span>{year}</span>}
              {totalEpisodes > 0 && (
                <>
                  <span>•</span>
                  <span>
                    {watchedEpisodes}/{totalEpisodes} episodes
                  </span>
                </>
              )}
            </div>
            {tvshow.genre && tvshow.genre.length > 0 && (
              <div className="text-muted-foreground truncate text-sm">{tvshow.genre[0]}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
