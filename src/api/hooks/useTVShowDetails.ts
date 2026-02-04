import { useQuery } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetTVShowDetailsResponse } from '@/api/types/video';
import { TVSHOW_PROPERTIES } from '@/api/types/video';

/**
 * Hook to fetch a single TV show's details by ID
 */
export function useTVShowDetails(tvshowId: number) {
  return useQuery({
    queryKey: ['tvshow', tvshowId],
    queryFn: async ({ signal }) => {
      const response = await kodi.call<GetTVShowDetailsResponse>(
        'VideoLibrary.GetTVShowDetails',
        {
          tvshowid: tvshowId,
          properties: TVSHOW_PROPERTIES,
        },
        signal
      );
      return response.tvshowdetails;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: !!tvshowId && tvshowId > 0,
  });
}
