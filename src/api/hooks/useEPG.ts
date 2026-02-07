import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetBroadcastsResponse, KodiBroadcast } from '@/api/types/pvr';
import { BROADCAST_PROPERTIES } from '@/api/types/pvr';

export interface UseBroadcastsOptions {
  channelid: number;
}

/**
 * Hook to fetch EPG broadcasts for a specific channel
 */
export function useBroadcasts(
  options: UseBroadcastsOptions,
  queryOptions?: Omit<UseQueryOptions<KodiBroadcast[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['broadcasts', options.channelid],
    queryFn: async ({ signal }) => {
      const response = await kodi.call<GetBroadcastsResponse>(
        'PVR.GetBroadcasts',
        {
          channelid: options.channelid,
          properties: BROADCAST_PROPERTIES,
        },
        signal
      );
      return response.broadcasts ?? [];
    },
    enabled: options.channelid > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes - EPG data changes frequently
    gcTime: 10 * 60 * 1000,
    retry: 1,
    ...queryOptions,
  });
}
