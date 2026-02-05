import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetAlbumDetailsResponse, KodiAlbum } from '@/api/types/audio';
import { ALBUM_PROPERTIES } from '@/api/types/audio';

/**
 * Hook to fetch detailed information about a specific album
 */
export function useAlbumDetails(
  albumId: number | undefined,
  queryOptions?: Omit<UseQueryOptions<KodiAlbum>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['album', albumId],
    queryFn: async () => {
      if (!albumId) {
        throw new Error('Album ID is required');
      }

      const response = await kodi.call<GetAlbumDetailsResponse>('AudioLibrary.GetAlbumDetails', {
        albumid: albumId,
        properties: ALBUM_PROPERTIES,
      });

      return response.albumdetails;
    },
    enabled: albumId !== undefined,
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...queryOptions,
  });
}
