import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MediaImage } from '@/components/media/MediaImage';
import type { KodiArtist } from '@/api/types/audio';
import { getThumbUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface ArtistListItemProps {
  artist: KodiArtist;
  className?: string;
}

export function ArtistListItem({ artist, className }: ArtistListItemProps) {
  const thumbUrl = getThumbUrl(artist.art);

  return (
    <Link
      to="/music/$artistId"
      params={{ artistId: artist.artistid.toString() }}
      className={cn('group', className)}
    >
      <Card className="hover:bg-accent overflow-hidden transition-colors">
        <CardContent className="flex items-center gap-4 p-4">
          <MediaImage
            src={thumbUrl}
            alt={artist.artist}
            aspectRatio="square"
            placeholderType="thumb"
            className="h-12 w-12 flex-shrink-0 rounded-md"
          />

          <div className="flex-1 truncate">
            <h3 className="group-hover:text-primary truncate font-medium">{artist.artist}</h3>
          </div>

          {artist.genre && artist.genre.length > 0 && (
            <div className="hidden gap-2 sm:flex">
              {artist.genre.slice(0, 3).map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
