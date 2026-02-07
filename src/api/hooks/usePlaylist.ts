import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { PlaylistItem } from '@/api/types/player';

/**
 * Hook to get playlist items
 */
export function usePlaylist(playlistId: number | undefined) {
  return useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async ({ signal }) => {
      if (playlistId === undefined) {
        throw new Error('Playlist ID is required');
      }

      const response = await kodi.call<{
        items?: PlaylistItem[];
        limits: { start: number; end: number; total: number };
      }>(
        'Playlist.GetItems',
        {
          playlistid: playlistId,
          properties: ['title', 'artist', 'album', 'duration', 'file', 'thumbnail'],
        },
        signal
      );
      return response.items ?? [];
    },
    enabled: playlistId !== undefined,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

/**
 * Hook to remove item from playlist
 */
export function useRemoveFromPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, position }: { playlistId: number; position: number }) => {
      const response = await kodi.call<string>('Playlist.Remove', {
        playlistid: playlistId,
        position,
      });
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['playlist'] });
    },
  });
}

/**
 * Hook to clear a playlist
 */
export function useClearPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playlistId: number) => {
      const response = await kodi.call<string>('Playlist.Clear', {
        playlistid: playlistId,
      });
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['playlist'] });
    },
  });
}

/**
 * Hook to go to a specific position in the playlist
 */
export function useGoToPlaylistPosition() {
  return useMutation({
    mutationFn: async ({ playerId, position }: { playerId: number; position: number }) => {
      const response = await kodi.call<string>('Player.GoTo', {
        playerid: playerId,
        to: position,
      });
      return response;
    },
  });
}
