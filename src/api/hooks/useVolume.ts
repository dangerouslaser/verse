import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kodi } from '@/api/client';

/**
 * Hook to get application volume
 */
export function useVolume() {
  return useQuery({
    queryKey: ['application', 'volume'],
    queryFn: async ({ signal }) => {
      const response = await kodi.call<{ volume: number; muted: boolean }>(
        'Application.GetProperties',
        { properties: ['volume', 'muted'] },
        signal
      );
      return response;
    },
    refetchInterval: 10000,
    staleTime: 5000,
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
