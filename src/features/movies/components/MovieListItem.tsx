import { Link } from '@tanstack/react-router';
import { MediaImage } from '@/components/media/MediaImage';
import { WatchedIndicator } from '@/components/video/WatchedIndicator';
import { Badge } from '@/components/ui/badge';
import type { KodiMovie } from '@/api/types/video';
import { formatYear, formatRating, formatRuntime, joinArray } from '@/lib/format';
import { getPosterUrl } from '@/lib/image-utils';
import { Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MovieListItemProps {
  movie: KodiMovie;
  className?: string;
}

export function MovieListItem({ movie, className }: MovieListItemProps) {
  const year = formatYear(movie.year || movie.premiered);
  const rating = movie.rating ? formatRating(movie.rating) : null;
  const runtime = formatRuntime(movie.runtime);
  const genres = joinArray(movie.genre?.slice(0, 3));
  const posterUrl = getPosterUrl(movie.art);

  return (
    <Link
      to="/movies/$movieId"
      params={{ movieId: movie.movieid.toString() }}
      className={cn('group', className)}
    >
      <div className="bg-card hover:bg-accent flex gap-4 rounded-lg border p-3 transition-colors">
        {/* Poster thumbnail */}
        <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded">
          {posterUrl ? (
            <MediaImage
              src={posterUrl}
              alt={movie.title}
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

          {/* Watched indicator */}
          <div className="absolute top-1 right-1">
            <WatchedIndicator
              playcount={movie.playcount}
              resume={movie.resume}
              variant="icon"
              className="scale-75"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <h3 className="group-hover:text-primary truncate leading-tight font-semibold">
            {movie.title}
          </h3>

          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            {year && <span>{year}</span>}
            {runtime && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{runtime}</span>
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
        </div>
      </div>
    </Link>
  );
}
