import { Link } from '@tanstack/react-router';
import { MediaImage } from '@/components/media/MediaImage';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { KodiTVShow } from '@/api/types/video';
import { formatYear, formatRating, joinArray } from '@/lib/format';
import { getPosterUrl } from '@/lib/image-utils';
import { Star, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TVShowListItemProps {
  tvshow: KodiTVShow;
  className?: string;
}

export function TVShowListItem({ tvshow, className }: TVShowListItemProps) {
  const year = formatYear(tvshow.year || tvshow.premiered);
  const rating = tvshow.rating ? formatRating(tvshow.rating) : null;
  const genres = joinArray(tvshow.genre?.slice(0, 3));
  const posterUrl = getPosterUrl(tvshow.art);

  const totalEpisodes = tvshow.episode || 0;
  const watchedEpisodes = tvshow.watchedepisodes || 0;
  const progress = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0;

  return (
    <Link
      to="/tv/$tvshowId"
      params={{ tvshowId: tvshow.tvshowid.toString() }}
      className={cn('group', className)}
    >
      <div className="bg-card hover:bg-accent flex gap-4 rounded-lg border p-3 transition-colors">
        {/* Poster thumbnail */}
        <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded">
          {posterUrl ? (
            <MediaImage
              src={posterUrl}
              alt={tvshow.title}
              aspectRatio="poster"
              loading="lazy"
              placeholderType="poster"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <h3 className="group-hover:text-primary truncate leading-tight font-semibold">
            {tvshow.title}
          </h3>

          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            {year && <span>{year}</span>}
            {totalEpisodes > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Tv className="h-3 w-3" />
                  <span>
                    {watchedEpisodes}/{totalEpisodes} episodes
                  </span>
                </div>
              </>
            )}
            {rating && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {rating}
                </Badge>
              </>
            )}
          </div>

          {genres && <p className="text-muted-foreground truncate text-xs">{genres}</p>}

          {/* Progress bar */}
          {watchedEpisodes > 0 && totalEpisodes > 0 && (
            <div className="mt-1">
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
