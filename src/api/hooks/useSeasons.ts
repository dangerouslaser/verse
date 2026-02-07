import { useQuery } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetSeasonsResponse } from '@/api/types/video';
import { SEASON_PROPERTIES } from '@/api/types/video';

/**
 * Hook to fetch seasons for a TV show
 */
export function useSeasons(tvshowId: number) {
  return useQuery({
    queryKey: ['seasons', tvshowId],
    queryFn: async ({ signal }) => {
      const response = await kodi.call<GetSeasonsResponse>(
        'VideoLibrary.GetSeasons',
        {
          tvshowid: tvshowId,
          properties: SEASON_PROPERTIES,
        },
        signal
      );
      return response.seasons ?? [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: !!tvshowId && tvshowId > 0,
  });
}
