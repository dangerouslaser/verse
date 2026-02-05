import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MediaImage } from '@/components/media/MediaImage';
import type { KodiAlbum } from '@/api/types/audio';
import { getThumbUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface AlbumListItemProps {
  album: KodiAlbum;
  className?: string;
}

export function AlbumListItem({ album, className }: AlbumListItemProps) {
  const thumbUrl = getThumbUrl(album.art);
  const artistId = album.artistid?.[0]?.toString() ?? '0';

  return (
    <Link
      to="/music/$artistId/$albumId"
      params={{ artistId, albumId: album.albumid.toString() }}
      className={cn('group', className)}
    >
      <Card className="hover:bg-accent overflow-hidden transition-colors">
        <CardContent className="flex items-center gap-4 p-4">
          <MediaImage
            src={thumbUrl}
            alt={album.title}
            aspectRatio="square"
            placeholderType="thumb"
            className="h-12 w-12 flex-shrink-0 rounded-md"
          />

          <div className="flex-1 truncate">
            <h3 className="group-hover:text-primary truncate font-medium">{album.title}</h3>
            {album.displayartist && (
              <p className="text-muted-foreground truncate text-sm">{album.displayartist}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {album.year && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {String(album.year)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
