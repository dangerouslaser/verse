import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetArtistDetailsResponse, KodiArtist } from '@/api/types/audio';
import { ARTIST_PROPERTIES } from '@/api/types/audio';

/**
 * Hook to fetch detailed information about a specific artist
 */
export function useArtistDetails(
  artistId: number | undefined,
  queryOptions?: Omit<UseQueryOptions<KodiArtist>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      if (!artistId) {
        throw new Error('Artist ID is required');
      }

      const response = await kodi.call<GetArtistDetailsResponse>('AudioLibrary.GetArtistDetails', {
        artistid: artistId,
        properties: ARTIST_PROPERTIES,
      });

      return response.artistdetails;
    },
    enabled: artistId !== undefined,
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...queryOptions,
  });
}
