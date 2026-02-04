import { Play, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { KodiTVShow, KodiEpisode } from '@/api/types/video';
import { kodi } from '@/api/client';
import { useMutation } from '@tanstack/react-query';

interface TVShowActionsProps {
  tvshow: KodiTVShow;
}

export function TVShowActions({ tvshow }: TVShowActionsProps) {
  const playNextMutation = useMutation({
    mutationFn: async () => {
      // Get all episodes for this TV show
      const response = await kodi.call<{ episodes: KodiEpisode[] }>('VideoLibrary.GetEpisodes', {
        tvshowid: tvshow.tvshowid,
        properties: ['playcount', 'season', 'episode', 'episodeid', 'title', 'showtitle'],
        sort: { method: 'episode', order: 'ascending' },
      });

      // Find first unwatched episode
      const nextEpisode = response.episodes.find((ep) => !ep.playcount || ep.playcount === 0);

      if (!nextEpisode) {
        throw new Error('No unwatched episodes found');
      }

      // Play the episode
      await kodi.call('Player.Open', {
        item: { episodeid: nextEpisode.episodeid },
      });

      return nextEpisode;
    },
    onSuccess: (episode) => {
      toast.success('Playing', {
        description: `Now playing: S${String(episode.season).padStart(2, '0')}E${String(episode.episode).padStart(2, '0')} - ${episode.title}`,
      });
    },
    onError: (error) => {
      toast.error('Playback Error', {
        description: error instanceof Error ? error.message : 'Failed to start playback',
      });
    },
  });

  const handlePlayNext = () => {
    playNextMutation.mutate();
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
      <Button
        size="lg"
        onClick={handlePlayNext}
        className="gap-2"
        disabled={!hasUnwatched || playNextMutation.isPending}
      >
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
