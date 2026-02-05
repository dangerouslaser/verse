import { Badge } from '@/components/ui/badge';
import type { KodiArtist } from '@/api/types/audio';
import { joinArray } from '@/lib/format';
import { Calendar, User } from 'lucide-react';

interface ArtistMetadataProps {
  artist: KodiArtist;
}

export function ArtistMetadata({ artist }: ArtistMetadataProps) {
  const yearsActive = joinArray(artist.yearsactive);
  const instruments = joinArray(artist.instrument);

  return (
    <div className="space-y-6">
      {/* Quick info */}
      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
        {artist.formed && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Formed: {artist.formed}</span>
          </div>
        )}

        {artist.disbanded && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Disbanded: {artist.disbanded}</span>
          </div>
        )}

        {artist.born && (
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Born: {artist.born}</span>
          </div>
        )}

        {artist.died && (
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Died: {artist.died}</span>
          </div>
        )}
      </div>

      {/* Genres */}
      {artist.genre && artist.genre.length > 0 && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {artist.genre.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Description/Bio */}
      {artist.description && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">Biography</h3>
          <p className="text-foreground leading-relaxed">{artist.description}</p>
        </div>
      )}

      {/* Additional details */}
      <div className="grid gap-4 sm:grid-cols-2">
        {yearsActive && (
          <div>
            <h3 className="text-muted-foreground mb-1 text-sm font-semibold uppercase">
              Years Active
            </h3>
            <p className="text-foreground">{yearsActive}</p>
          </div>
        )}

        {instruments && (
          <div>
            <h3 className="text-muted-foreground mb-1 text-sm font-semibold uppercase">
              Instruments
            </h3>
            <p className="text-foreground">{instruments}</p>
          </div>
        )}
      </div>

      {/* Styles */}
      {artist.style && artist.style.length > 0 && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">Styles</h3>
          <div className="flex flex-wrap gap-2">
            {artist.style.map((style) => (
              <Badge key={style} variant="outline">
                {style}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Moods */}
      {artist.mood && artist.mood.length > 0 && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">Moods</h3>
          <div className="flex flex-wrap gap-2">
            {artist.mood.map((mood) => (
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
