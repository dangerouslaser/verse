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
    queryFn: async ({ signal }) => {
      const response = await kodi.call<GetActivePlayersResponse[]>(
        'Player.GetActivePlayers',
        undefined,
        signal
      );
      return response;
    },
    refetchInterval: 10000,
    staleTime: 3000,
  });
}

/**
 * Hook to get player properties (percentage, time, speed, etc.)
 * Polls at 2s to keep the seek bar progress reasonably smooth.
 * WebSocket notifications handle discrete state changes (play/pause/seek).
 */
export function usePlayerProperties(playerId: number | undefined) {
  return useQuery({
    queryKey: ['player', 'properties', playerId],
    queryFn: async ({ signal }) => {
      if (playerId === undefined) {
        throw new Error('Player ID is required');
      }

      const response = await kodi.call<GetPlayerPropertiesResponse>(
        'Player.GetProperties',
        {
          playerid: playerId,
          properties: PLAYER_PROPERTIES,
        },
        signal
      );
      return response;
    },
    enabled: playerId !== undefined,
    refetchInterval: 2000,
    staleTime: 1000,
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
    queryFn: async ({ signal }) => {
      if (playerId === undefined) {
        throw new Error('Player ID is required');
      }

      const response = await kodi.call<GetPlayerItemResponse>(
        'Player.GetItem',
        {
          playerid: playerId,
          properties: [
            'title',
            'album',
            'artist',
            'season',
            'episode',
            'showtitle',
            'tvshowid',
            'year',
            'duration',
            'file',
            'thumbnail',
            'art',
          ],
        },
        signal
      );
      return response;
    },
    enabled: playerId !== undefined,
    refetchInterval: 5000,
    staleTime: 2000,
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
  return useMutation({
    mutationFn: async (playerId: number) => {
      const response = await kodi.call<string>('Player.SetRepeat', {
        playerid: playerId,
        repeat: 'cycle',
      });
      return response;
    },
  });
}

/**
 * Hook to toggle shuffle
 */
export function useSetShuffle() {
  return useMutation({
    mutationFn: async (playerId: number) => {
      const response = await kodi.call<string>('Player.SetShuffle', {
        playerid: playerId,
        shuffle: 'toggle',
      });
      return response;
    },
  });
}

interface PlayMovieOptions {
  movieid: number;
  title?: string;
  resume?: boolean;
}

interface PlayEpisodeOptions {
  episodeid: number;
  title?: string;
  season?: number;
  episode?: number;
  resume?: boolean;
}

/**
 * Hook for playing a movie with standardized error handling, notifications, and query invalidation
 */
export function usePlayMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: PlayMovieOptions) => {
      await kodi.call('Player.Open', {
        item: { movieid: options.movieid },
        options: options.resume ? { resume: true } : undefined,
      });
      return options;
    },
    onSuccess: (options) => {
      void queryClient.invalidateQueries({ queryKey: ['movies'] });
      void queryClient.invalidateQueries({ queryKey: ['movie', options.movieid] });

      toast.success('Playing', {
        description: options.title ? `Now playing: ${options.title}` : 'Now playing',
      });
    },
    onError: (error) => {
      toast.error('Playback Error', {
        description: error instanceof Error ? error.message : 'Failed to start playback',
      });
    },
  });
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
        options: options.resume ? { resume: true } : undefined,
      });
      return options;
    },
    onSuccess: (options) => {
      void queryClient.invalidateQueries({ queryKey: ['episodes'] });
      void queryClient.invalidateQueries({ queryKey: ['episode', options.episodeid] });

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
