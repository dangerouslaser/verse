import { Badge } from '@/components/ui/badge';
import type { KodiMovie } from '@/api/types/video';
import { formatRuntime, formatYear, formatDate, joinArray } from '@/lib/format';
import { Calendar, Clock, Star, Film } from 'lucide-react';

interface MovieMetadataProps {
  movie: KodiMovie;
}

export function MovieMetadata({ movie }: MovieMetadataProps) {
  const year = formatYear(movie.year || movie.premiered);
  const runtime = formatRuntime(movie.runtime);
  const premiered = formatDate(movie.premiered);
  const directors = joinArray(movie.director);
  const writers = joinArray(movie.writer);
  const studios = joinArray(movie.studio);

  return (
    <div className="space-y-6">
      {/* Quick info */}
      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
        {year && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{year}</span>
          </div>
        )}

        {runtime && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{runtime}</span>
          </div>
        )}

        {movie.rating && (
          <div className="flex items-center gap-1">
            <Star className="fill-primary text-primary h-4 w-4" />
            <span>
              {movie.rating.toFixed(1)}
              {movie.votes && <span className="text-muted-foreground/70"> ({movie.votes})</span>}
            </span>
          </div>
        )}

        {movie.mpaa && (
          <Badge variant="outline" className="gap-1">
            <Film className="h-3 w-3" />
            {movie.mpaa}
          </Badge>
        )}
      </div>

      {/* Genres */}
      {movie.genre && movie.genre.length > 0 && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {movie.genre.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Plot */}
      {movie.plot && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">Overview</h3>
          <p className="text-foreground leading-relaxed">{movie.plot}</p>
        </div>
      )}

      {/* Additional details */}
      <div className="grid gap-4 sm:grid-cols-2">
        {directors && (
          <div>
            <h3 className="text-muted-foreground mb-1 text-sm font-semibold uppercase">Director</h3>
            <p className="text-foreground">{directors}</p>
          </div>
        )}

        {writers && (
          <div>
            <h3 className="text-muted-foreground mb-1 text-sm font-semibold uppercase">Writer</h3>
            <p className="text-foreground">{writers}</p>
          </div>
        )}

        {studios && (
          <div>
            <h3 className="text-muted-foreground mb-1 text-sm font-semibold uppercase">Studio</h3>
            <p className="text-foreground">{studios}</p>
          </div>
        )}

        {premiered && (
          <div>
            <h3 className="text-muted-foreground mb-1 text-sm font-semibold uppercase">Released</h3>
            <p className="text-foreground">{premiered}</p>
          </div>
        )}

        {movie.tagline && (
          <div className="sm:col-span-2">
            <h3 className="text-muted-foreground mb-1 text-sm font-semibold uppercase">Tagline</h3>
            <p className="text-foreground italic">{movie.tagline}</p>
          </div>
        )}
      </div>
    </div>
  );
}
