import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetTimersResponse, KodiTimer } from '@/api/types/pvr';
import { TIMER_PROPERTIES } from '@/api/types/pvr';
import { toast } from 'sonner';

/**
 * Hook to fetch PVR timers (scheduled recordings)
 */
export function useTimers(
  queryOptions?: Omit<UseQueryOptions<KodiTimer[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['timers'],
    queryFn: async ({ signal }) => {
      const response = await kodi.call<GetTimersResponse>(
        'PVR.GetTimers',
        {
          properties: TIMER_PROPERTIES,
        },
        signal
      );
      return response.timers ?? [];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    ...queryOptions,
  });
}

/**
 * Hook to delete a PVR timer
 */
export function useDeleteTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timerId: number) => {
      await kodi.call('PVR.DeleteTimer', { timerid: timerId });
      return timerId;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['timers'] });
      toast.success('Timer deleted');
    },
    onError: (error) => {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to delete timer',
      });
    },
  });
}

/**
 * Hook to toggle a PVR timer on/off
 */
export function useToggleTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timerId: number) => {
      await kodi.call('PVR.ToggleTimer', { timerid: timerId });
      return timerId;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['timers'] });
      toast.success('Timer toggled');
    },
    onError: (error) => {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to toggle timer',
      });
    },
  });
}
