import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MediaImage } from '@/components/media/MediaImage';
import type { KodiAlbum } from '@/api/types/audio';
import { getThumbUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
  album: KodiAlbum;
  showArtist?: boolean;
  className?: string;
}

export function AlbumCard({ album, showArtist = false, className }: AlbumCardProps) {
  const thumbUrl = getThumbUrl(album.art);
  const artistId = album.artistid?.[0]?.toString() ?? '0';

  return (
    <Link
      to="/music/$artistId/$albumId"
      params={{ artistId, albumId: album.albumid.toString() }}
      className={cn('group', className)}
    >
      <Card className="overflow-hidden border-0 bg-transparent shadow-none transition-transform duration-300 hover:scale-105">
        <CardContent className="p-0">
          <div className="relative">
            <MediaImage
              src={thumbUrl}
              alt={album.title}
              aspectRatio="square"
              placeholderType="thumb"
              className="rounded-lg"
            />

            {/* Year badge */}
            {album.year && (
              <div className="absolute right-2 bottom-2">
                <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                  {String(album.year)}
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-2 space-y-1 px-1">
            <h3 className="group-hover:text-primary line-clamp-1 leading-tight font-medium">
              {album.title}
            </h3>
            {showArtist && album.displayartist && (
              <p className="text-muted-foreground line-clamp-1 text-sm">{album.displayartist}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
