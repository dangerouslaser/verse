import { Button } from '@/components/ui/button';
import { PlayButton } from '@/components/video/PlayButton';
import { usePlayArtist } from '@/api/hooks/useMusicPlayback';
import type { KodiArtist } from '@/api/types/audio';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { kodi } from '@/api/client';

interface ArtistActionsProps {
  artist: KodiArtist;
}

export function ArtistActions({ artist }: ArtistActionsProps) {
  const playMutation = usePlayArtist();

  const handlePlay = async () => {
    try {
      await playMutation.mutateAsync(artist.artistid);

      toast.success('Playing', {
        description: `Now playing: ${artist.artist}`,
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
        item: { artistid: artist.artistid },
      });

      toast.success('Added to Queue', {
        description: `Added ${artist.artist} to the queue`,
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
