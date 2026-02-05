import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { KodiSong } from '@/api/types/audio';
import { formatDuration, formatDiscTrack } from '@/lib/format';
import { cn } from '@/lib/utils';

interface SongRowProps {
  song: KodiSong;
  index?: number;
  showAlbum?: boolean;
  showArtist?: boolean;
  onPlay?: () => void;
}

export function SongRow({ song, showAlbum = false, showArtist = false, onPlay }: SongRowProps) {
  const trackNumber = formatDiscTrack(song.disc, song.track);
  const artistName = song.artist?.join(', ') || '';
  const duration = formatDuration(song.duration);

  return (
    <div
      className={cn(
        'group hover:bg-accent flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors',
        'cursor-default'
      )}
    >
      {/* Track number */}
      <div className="text-muted-foreground w-8 text-right text-sm tabular-nums">
        {trackNumber || '—'}
      </div>

      {/* Title */}
      <div className="flex-1 truncate">
        <div className="font-medium">{song.title}</div>
      </div>

      {/* Artist */}
      {showArtist && (
        <div className="text-muted-foreground hidden flex-1 truncate sm:block">{artistName}</div>
      )}

      {/* Album */}
      {showAlbum && (
        <div className="text-muted-foreground hidden flex-1 truncate md:block">{song.album}</div>
      )}

      {/* Duration */}
      <div className="text-muted-foreground w-16 text-right text-sm tabular-nums">{duration}</div>

      {/* Play button */}
      {onPlay && (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={onPlay}
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
