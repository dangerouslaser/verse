import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import { toast } from 'sonner';

/**
 * Hook to toggle movie watched status
 */
export function useSetMovieWatched() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ movieid, playcount }: { movieid: number; playcount: number }) => {
      await kodi.call('VideoLibrary.SetMovieDetails', {
        movieid,
        playcount,
      });
      return { movieid, playcount };
    },
    onSuccess: ({ movieid, playcount }) => {
      void queryClient.invalidateQueries({ queryKey: ['movies'] });
      void queryClient.invalidateQueries({ queryKey: ['movie', movieid] });

      toast.success(playcount > 0 ? 'Marked as watched' : 'Marked as unwatched');
    },
    onError: (error) => {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update watched status',
      });
    },
  });
}

/**
 * Hook to toggle episode watched status
 */
export function useSetEpisodeWatched() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ episodeid, playcount }: { episodeid: number; playcount: number }) => {
      await kodi.call('VideoLibrary.SetEpisodeDetails', {
        episodeid,
        playcount,
      });
      return { episodeid, playcount };
    },
    onSuccess: ({ episodeid, playcount }) => {
      void queryClient.invalidateQueries({ queryKey: ['episodes'] });
      void queryClient.invalidateQueries({ queryKey: ['episode', episodeid] });
      void queryClient.invalidateQueries({ queryKey: ['seasons'] });
      void queryClient.invalidateQueries({ queryKey: ['tvshows'] });
      void queryClient.invalidateQueries({ queryKey: ['tvshow'] });

      toast.success(playcount > 0 ? 'Marked as watched' : 'Marked as unwatched');
    },
    onError: (error) => {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update watched status',
      });
    },
  });
}
