import { Play, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { KodiTVShow } from '@/api/types/video';

interface TVShowActionsProps {
  tvshow: KodiTVShow;
}

export function TVShowActions({ tvshow }: TVShowActionsProps) {
  const handlePlayNext = () => {
    toast.info('Coming Soon', {
      description: 'Play next unwatched episode functionality coming soon',
    });
  };

  const handleEditArtwork = () => {
    toast.info('Coming Soon', {
      description:
        'Artwork editor will allow you to fetch and change artwork from TMDB and Fanart.TV',
    });
  };

  const totalEpisodes = tvshow.episode || 0;
  const watchedEpisodes = tvshow.watchedepisodes || 0;
  const hasUnwatched = watchedEpisodes < totalEpisodes;

  return (
    <div className="flex flex-wrap gap-3">
      <Button size="lg" onClick={handlePlayNext} className="gap-2" disabled={!hasUnwatched}>
        <Play className="h-5 w-5" fill="currentColor" />
        {hasUnwatched ? 'Play Next Episode' : 'All Watched'}
      </Button>

      <Button variant="outline" size="lg" onClick={handleEditArtwork} className="gap-2">
        <ImageIcon className="h-5 w-5" />
        Edit Artwork
      </Button>
    </div>
  );
}
