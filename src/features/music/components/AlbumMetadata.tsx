import { Badge } from '@/components/ui/badge';
import type { KodiAlbum } from '@/api/types/audio';
import { formatRating } from '@/lib/format';
import { Calendar, Star } from 'lucide-react';

interface AlbumMetadataProps {
  album: KodiAlbum;
}

export function AlbumMetadata({ album }: AlbumMetadataProps) {
  return (
    <div className="space-y-6">
      {/* Quick info */}
      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
        {album.year && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{String(album.year)}</span>
          </div>
        )}

        {album.rating && (
          <div className="flex items-center gap-1">
            <Star className="fill-primary text-primary h-4 w-4" />
            <span>
              {formatRating(album.rating)}
              {album.votes && <span className="text-muted-foreground/70"> ({album.votes})</span>}
            </span>
          </div>
        )}

        {album.albumlabel && (
          <Badge variant="outline" className="gap-1">
            {album.albumlabel}
          </Badge>
        )}
      </div>

      {/* Genres */}
      {album.genre && album.genre.length > 0 && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {album.genre.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {album.description && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">About</h3>
          <p className="text-foreground leading-relaxed">{album.description}</p>
        </div>
      )}

      {/* Styles */}
      {album.style && album.style.length > 0 && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">Styles</h3>
          <div className="flex flex-wrap gap-2">
            {album.style.map((style) => (
              <Badge key={style} variant="outline">
                {style}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Moods */}
      {album.mood && album.mood.length > 0 && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">Moods</h3>
          <div className="flex flex-wrap gap-2">
            {album.mood.map((mood) => (
              <Badge key={mood} variant="outline">
                {mood}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
