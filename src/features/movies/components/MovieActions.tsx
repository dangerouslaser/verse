import { PlayButton } from '@/components/video/PlayButton';
import { ResumeButton } from '@/components/video/ResumeButton';
import { Button } from '@/components/ui/button';
import { usePlay } from '@/api/hooks/usePlayback';
import type { KodiMovie } from '@/api/types/video';
import { toast } from 'sonner';
import { ImageIcon } from 'lucide-react';

interface MovieActionsProps {
  movie: KodiMovie;
}

export function MovieActions({ movie }: MovieActionsProps) {
  const playMutation = usePlay();

  const handlePlay = async (resume: boolean = false) => {
    try {
      await playMutation.mutateAsync({
        item: { movieid: movie.movieid },
        options: { resume },
      });

      toast.success('Playing', {
        description: `Now playing: ${movie.title}`,
      });
    } catch (error) {
      toast.error('Playback Error', {
        description: error instanceof Error ? error.message : 'Failed to start playback',
      });
    }
  };

  const hasResume = movie.resume && movie.resume.position > 0;

  const handleEditArtwork = () => {
    // TODO: Implement artwork editor dialog with TMDB and Fanart.TV integration
    toast.info('Coming Soon', {
      description: 'Artwork editor will allow you to fetch and change artwork from TMDB and Fanart.TV',
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <PlayButton
        onClick={() => handlePlay(false)}
        disabled={playMutation.isPending}
        size="lg"
      />

      {hasResume && movie.resume && (
        <ResumeButton
          resume={movie.resume}
          onClick={() => handlePlay(true)}
          disabled={playMutation.isPending}
          size="lg"
        />
      )}

      <Button
        variant="outline"
        size="lg"
        onClick={handleEditArtwork}
        className="gap-2"
      >
        <ImageIcon className="h-5 w-5" />
        Edit Artwork
      </Button>
    </div>
  );
}
