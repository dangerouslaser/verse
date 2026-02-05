import { Button } from '@/components/ui/button';
import { PlayButton } from '@/components/video/PlayButton';
import { usePlayAlbum } from '@/api/hooks/useMusicPlayback';
import type { KodiAlbum } from '@/api/types/audio';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { kodi } from '@/api/client';

interface AlbumActionsProps {
  album: KodiAlbum;
}

export function AlbumActions({ album }: AlbumActionsProps) {
  const playMutation = usePlayAlbum();

  const handlePlay = async () => {
    try {
      await playMutation.mutateAsync(album.albumid);

      toast.success('Playing', {
        description: `Now playing: ${album.title}`,
      });
    } catch (error) {
      toast.error('Playback Error', {
        description: error instanceof Error ? error.message : 'Failed to start playback',
      });
    }
  };

  const handleAddToQueue = async () => {
    try {
      await kodi.call<string>('Playlist.Add', {
        playlistid: 0, // Audio playlist
        item: { albumid: album.albumid },
      });

      toast.success('Added to Queue', {
        description: `Added ${album.title} to the queue`,
      });
    } catch (error) {
      toast.error('Queue Error', {
        description: error instanceof Error ? error.message : 'Failed to add to queue',
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <PlayButton onClick={() => void handlePlay()} disabled={playMutation.isPending} size="lg" />

      <Button variant="outline" size="lg" onClick={() => void handleAddToQueue()} className="gap-2">
        <Plus className="h-5 w-5" />
        Add to Queue
      </Button>
    </div>
  );
}
