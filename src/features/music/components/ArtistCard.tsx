import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { MediaImage } from '@/components/media/MediaImage';
import type { KodiArtist } from '@/api/types/audio';
import { getThumbUrl } from '@/lib/image-utils';
import { joinArray } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ArtistCardProps {
  artist: KodiArtist;
  className?: string;
}

export function ArtistCard({ artist, className }: ArtistCardProps) {
  const thumbUrl = getThumbUrl(artist.art);
  const genres = joinArray(artist.genre);

  return (
    <Link
      to="/music/$artistId"
      params={{ artistId: artist.artistid.toString() }}
      className={cn('group', className)}
    >
      <Card className="overflow-hidden border-0 bg-transparent shadow-none transition-transform duration-300 hover:scale-105">
        <CardContent className="p-0">
          <MediaImage
            src={thumbUrl}
            alt={artist.artist}
            aspectRatio="square"
            placeholderType="thumb"
            className="rounded-lg"
          />

          <div className="mt-2 space-y-1 px-1">
            <h3 className="group-hover:text-primary line-clamp-1 leading-tight font-medium">
              {artist.artist}
            </h3>
            {genres && <p className="text-muted-foreground line-clamp-1 text-sm">{genres}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
