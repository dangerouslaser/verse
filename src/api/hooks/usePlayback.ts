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
