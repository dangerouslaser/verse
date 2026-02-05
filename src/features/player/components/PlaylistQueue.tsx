import { Play, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/format';
import { getImageUrl } from '@/lib/image-utils';
import {
  useRemoveFromPlaylist,
  useClearPlaylist,
  useGoToPlaylistPosition,
} from '@/api/hooks/usePlayback';
import { toast } from 'sonner';

interface PlaylistItem {
  id: number;
  type: string;
  label: string;
  title?: string;
  artist?: string[];
  album?: string;
  duration?: number;
  file?: string;
  thumbnail?: string;
}

interface PlaylistQueueProps {
  items: PlaylistItem[];
  playlistId: number;
  playerId: number;
  currentPosition: number;
  className?: string;
}

export function PlaylistQueue({
  items,
  playlistId,
  playerId,
  currentPosition,
  className,
}: PlaylistQueueProps) {
  const removeMutation = useRemoveFromPlaylist();
  const clearMutation = useClearPlaylist();
  const goToMutation = useGoToPlaylistPosition();

  const handlePlay = (position: number) => {
    goToMutation.mutate(
      { playerId, position },
      {
        onError: (error) => {
          toast.error('Error', { description: error.message || 'Failed to play item' });
        },
      }
    );
  };

  const handleRemove = (position: number) => {
    removeMutation.mutate(
      { playlistId, position },
      {
        onError: (error) => {
          toast.error('Error', { description: error.message || 'Failed to remove item' });
        },
      }
    );
  };

  const handleClear = () => {
    clearMutation.mutate(playlistId, {
      onError: (error) => {
        toast.error('Error', { description: error.message || 'Failed to clear playlist' });
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <p className="text-muted-foreground text-sm">Queue is empty</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Queue ({items.length})</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={clearMutation.isPending}
          className="text-muted-foreground h-7 gap-1 text-xs"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </Button>
      </div>

      <div className="space-y-0.5">
        {items.map((item, index) => {
          const isCurrent = index === currentPosition;
          const thumbnailUrl = item.thumbnail ? getImageUrl(item.thumbnail) : undefined;

          return (
            <div
              key={`${String(item.id)}-${String(index)}`}
              className={cn(
                'hover:bg-accent group flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors',
                isCurrent && 'bg-accent'
              )}
            >
              {/* Index / play indicator */}
              <button
                className="text-muted-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center"
                onClick={() => {
                  handlePlay(index);
                }}
              >
                {isCurrent ? (
                  <span className="text-primary text-xs font-bold">
                    <Play className="h-3.5 w-3.5" fill="currentColor" />
                  </span>
                ) : (
                  <span className="group-hover:hidden">{index + 1}</span>
                )}
                {!isCurrent && <Play className="hidden h-3.5 w-3.5 group-hover:block" />}
              </button>

              {/* Thumbnail */}
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt={item.title ?? item.label}
                  className="h-8 w-8 flex-shrink-0 rounded object-cover"
                />
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'truncate text-sm',
                    isCurrent ? 'text-primary font-medium' : 'font-normal'
                  )}
                >
                  {item.title ?? item.label}
                </p>
                {item.artist && item.artist.length > 0 && (
                  <p className="text-muted-foreground truncate text-xs">{item.artist.join(', ')}</p>
                )}
              </div>

              {/* Duration */}
              {item.duration ? (
                <span className="text-muted-foreground flex-shrink-0 text-xs">
                  {formatTime(item.duration)}
                </span>
              ) : null}

              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100"
                onClick={() => {
                  handleRemove(index);
                }}
                disabled={removeMutation.isPending}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
