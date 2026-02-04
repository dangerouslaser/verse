import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Tv } from 'lucide-react';
import type { KodiTVShow } from '@/api/types/video';
import { formatYear, formatRating, formatRuntime } from '@/lib/format';

interface TVShowMetadataProps {
  tvshow: KodiTVShow;
}

export function TVShowMetadata({ tvshow }: TVShowMetadataProps) {
  const year = formatYear(tvshow.year || tvshow.premiered);
  const rating = tvshow.rating ? formatRating(tvshow.rating) : null;
  const runtime = tvshow.runtime ? formatRuntime(tvshow.runtime) : null;

  return (
    <div className="space-y-6">
      {/* Basic info badges */}
      <div className="flex flex-wrap gap-3">
        {year && (
          <Badge variant="secondary" className="gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {year}
          </Badge>
        )}
        {rating && (
          <Badge variant="secondary" className="gap-2">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {rating}
          </Badge>
        )}
        {runtime && (
          <Badge variant="secondary" className="gap-2">
            <Tv className="h-3.5 w-3.5" />
            {runtime}/episode
          </Badge>
        )}
        {tvshow.mpaa && <Badge variant="outline">{tvshow.mpaa}</Badge>}
      </div>

      {/* Plot */}
      {tvshow.plot && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">{tvshow.plot}</p>
        </div>
      )}

      {/* Genres */}
      {tvshow.genre && tvshow.genre.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {tvshow.genre.map((genre) => (
              <Badge key={genre} variant="outline">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Studios */}
      {tvshow.studio && tvshow.studio.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Studios</h3>
          <p className="text-muted-foreground text-sm">{tvshow.studio.join(', ')}</p>
        </div>
      )}
    </div>
  );
}
