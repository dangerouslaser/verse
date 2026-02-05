import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type {
  PlayOptions,
  GetActivePlayersResponse,
  GetPlayerPropertiesResponse,
  GetPlayerItemResponse,
} from '@/api/types/player';
import { PLAYER_PROPERTIES } from '@/api/types/player';
import { toast } from 'sonner';
import { formatEpisodeNumber } from '@/lib/format';

/**
 * Hook to play a movie or episode
 */
export function usePlay(options?: UseMutationOptions<string, Error, PlayOptions>) {
  return useMutation({
    mutationFn: async (playOptions: PlayOptions) => {
      const response = await kodi.call<string>('Player.Open', {
        item: playOptions.item,
        options: playOptions.options,
      });
      return response;
    },
    ...options,
  });
}

/**
 * Hook to get active players
 */
export function useActivePlayers() {
  return useQuery({
    queryKey: ['player', 'active'],
    queryFn: async () => {
      const response = await kodi.call<GetActivePlayersResponse[]>('Player.GetActivePlayers');
      return response;
    },
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 1000,
  });
}

/**
 * Hook to get player properties
 */
export function usePlayerProperties(playerId: number | undefined) {
  return useQuery({
    queryKey: ['player', 'properties', playerId],
    queryFn: async () => {
      if (playerId === undefined) {
        throw new Error('Player ID is required');
      }

      const response = await kodi.call<GetPlayerPropertiesResponse>('Player.GetProperties', {
        playerid: playerId,
        properties: PLAYER_PROPERTIES,
      });
      return response;
    },
    enabled: playerId !== undefined,
    refetchInterval: 1000, // Update every second
    staleTime: 500,
  });
}

/**
 * Hook to stop playback
 */
export function useStop(options?: UseMutationOptions<string, Error, number>) {
  return useMutation({
    mutationFn: async (playerId: number) => {
      const response = await kodi.call<string>('Player.Stop', {
        playerid: playerId,
      });
      return response;
    },
    ...options,
  });
}

/**
 * Hook to pause/resume playback
 */
export function usePlayPause(options?: UseMutationOptions<string, Error, number>) {
  return useMutation({
    mutationFn: async (playerId: number) => {
      const response = await kodi.call<string>('Player.PlayPause', {
        playerid: playerId,
      });
      return response;
    },
    ...options,
  });
}

/**
 * Hook to seek in playback
 */
export function useSeek(
  options?: UseMutationOptions<string, Error, { playerId: number; value: number }>
) {
  return useMutation({
    mutationFn: async ({ playerId, value }) => {
      const response = await kodi.call<string>('Player.Seek', {
        playerid: playerId,
        value: { percentage: value },
      });
      return response;
    },
    ...options,
  });
}

/**
 * Hook to get the currently playing item
 */
export function usePlayerItem(playerId: number | undefined) {
  return useQuery({
    queryKey: ['player', 'item', playerId],
    queryFn: async () => {
      if (playerId === undefined) {
        throw new Error('Player ID is required');
      }

      const response = await kodi.call<GetPlayerItemResponse>('Player.GetItem', {
        playerid: playerId,
        properties: [
          'title',
          'album',
          'artist',
          'season',
          'episode',
          'showtitle',
          'year',
          'duration',
          'file',
          'thumbnail',
          'art',
        ],
      });
      return response;
    },
    enabled: playerId !== undefined,
    refetchInterval: 5000,
    staleTime: 2000,
  });
}

/**
 * Hook to get application volume
 */
export function useVolume() {
  return useQuery({
    queryKey: ['application', 'volume'],
    queryFn: async () => {
      const response = await kodi.call<{ volume: number; muted: boolean }>(
        'Application.GetProperties',
        { properties: ['volume', 'muted'] }
      );
      return response;
    },
    refetchInterval: 5000,
    staleTime: 2000,
  });
}

/**
 * Hook to set application volume
 */
export function useSetVolume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (volume: number) => {
      const response = await kodi.call<number>('Application.SetVolume', {
        volume: Math.round(Math.max(0, Math.min(100, volume))),
      });
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['application', 'volume'] });
    },
  });
}

/**
 * Hook to toggle mute
 */
export function useToggleMute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await kodi.call<boolean>('Application.SetMute', {
        mute: 'toggle',
      });
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['application', 'volume'] });
    },
  });
}

/**
 * Hook to skip to next item
 */
export function useSkipNext(options?: UseMutationOptions<string, Error, number>) {
  return useMutation({
    mutationFn: async (playerId: number) => {
      const response = await kodi.call<string>('Player.GoTo', {
        playerid: playerId,
        to: 'next',
      });
      return response;
    },
    ...options,
  });
}

/**
 * Hook to skip to previous item
 */
export function useSkipPrevious(options?: UseMutationOptions<string, Error, number>) {
  return useMutation({
    mutationFn: async (playerId: number) => {
      const response = await kodi.call<string>('Player.GoTo', {
        playerid: playerId,
        to: 'previous',
      });
      return response;
    },
    ...options,
  });
}

/**
 * Hook to cycle repeat mode
 */
export function useSetRepeat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playerId: number) => {
      const response = await kodi.call<string>('Player.SetRepeat', {
        playerid: playerId,
        repeat: 'cycle',
      });
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['player', 'properties'] });
    },
  });
}

/**
 * Hook to toggle shuffle
 */
export function useSetShuffle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playerId: number) => {
      const response = await kodi.call<string>('Player.SetShuffle', {
        playerid: playerId,
        shuffle: 'toggle',
      });
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['player', 'properties'] });
    },
  });
}

/**
 * Hook to get playlist items
 */
export function usePlaylist(playlistId: number | undefined) {
  return useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async () => {
      if (playlistId === undefined) {
        throw new Error('Playlist ID is required');
      }

      const response = await kodi.call<{
        items?: Array<{
          id: number;
          type: string;
          label: string;
          title?: string;
          artist?: string[];
          album?: string;
          duration?: number;
          file?: string;
          thumbnail?: string;
        }>;
        limits: { start: number; end: number; total: number };
      }>('Playlist.GetItems', {
        playlistid: playlistId,
        properties: ['title', 'artist', 'album', 'duration', 'file', 'thumbnail'],
      });
      return response.items ?? [];
    },
    enabled: playlistId !== undefined,
    refetchInterval: 5000,
    staleTime: 2000,
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

interface PlayEpisodeOptions {
  episodeid: number;
  title?: string;
  season?: number;
  episode?: number;
}

/**
 * Hook for playing an episode with standardized error handling, notifications, and query invalidation
 */
export function usePlayEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: PlayEpisodeOptions) => {
      await kodi.call('Player.Open', {
        item: { episodeid: options.episodeid },
      });
      return options;
    },
    onSuccess: (options) => {
      // Invalidate queries to refresh watched status
      void queryClient.invalidateQueries({ queryKey: ['episodes'] });
      void queryClient.invalidateQueries({ queryKey: ['episode', options.episodeid] });

      // Show success toast
      let description = 'Now playing';
      if (options.title) {
        if (options.season !== undefined && options.episode !== undefined) {
          description = `Now playing: ${formatEpisodeNumber(options.season, options.episode)} - ${options.title}`;
        } else {
          description = `Now playing: ${options.title}`;
        }
      }

      toast.success('Playing', { description });
    },
    onError: (error) => {
      toast.error('Playback Error', {
        description: error instanceof Error ? error.message : 'Failed to start playback',
      });
    },
  });
}
