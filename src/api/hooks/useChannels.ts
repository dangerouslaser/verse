import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type {
  GetChannelsResponse,
  GetChannelGroupsResponse,
  GetChannelDetailsResponse,
  KodiChannel,
  KodiChannelGroup,
} from '@/api/types/pvr';
import { CHANNEL_PROPERTIES } from '@/api/types/pvr';

/**
 * Hook to fetch channel groups (TV or Radio)
 */
export function useChannelGroups(
  channeltype: 'tv' | 'radio' = 'tv',
  queryOptions?: Omit<UseQueryOptions<KodiChannelGroup[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['channel-groups', channeltype],
    queryFn: async ({ signal }) => {
      const response = await kodi.call<GetChannelGroupsResponse>(
        'PVR.GetChannelGroups',
        { channeltype },
        signal
      );
      return response.channelgroups ?? [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    ...queryOptions,
  });
}

export interface UseChannelsOptions {
  channelgroupid: number | 'alltv' | 'allradio';
}

/**
 * Hook to fetch channels for a given channel group
 */
export function useChannels(
  options: UseChannelsOptions = { channelgroupid: 'alltv' },
  queryOptions?: Omit<UseQueryOptions<KodiChannel[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['channels', options.channelgroupid],
    queryFn: async ({ signal }) => {
      const response = await kodi.call<GetChannelsResponse>(
        'PVR.GetChannels',
        {
          channelgroupid: options.channelgroupid,
          properties: CHANNEL_PROPERTIES,
        },
        signal
      );
      return response.channels ?? [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - channels change more frequently (EPG)
    gcTime: 10 * 60 * 1000,
    retry: 1,
    ...queryOptions,
  });
}

/**
 * Hook to fetch details for a specific channel
 */
export function useChannelDetails(
  channelId: number | undefined,
  queryOptions?: Omit<UseQueryOptions<KodiChannel>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['channel', channelId],
    queryFn: async ({ signal }) => {
      if (!channelId) {
        throw new Error('Channel ID is required');
      }

      const response = await kodi.call<GetChannelDetailsResponse>(
        'PVR.GetChannelDetails',
        {
          channelid: channelId,
          properties: CHANNEL_PROPERTIES,
        },
        signal
      );
      return response.channeldetails;
    },
    enabled: channelId !== undefined,
    staleTime: 1 * 60 * 1000, // 1 minute - live data changes frequently
    gcTime: 10 * 60 * 1000,
    retry: 1,
    ...queryOptions,
  });
}
