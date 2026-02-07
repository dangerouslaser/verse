import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetAlbumsResponse } from '@/api/types/audio';
import { ALBUM_LIST_PROPERTIES } from '@/api/types/audio';
import type { KodiSort, KodiFilter } from '@/api/types/common';

export interface UseAlbumsInfiniteOptions {
  sort?: KodiSort;
  filter?: KodiFilter;
  pageSize?: number;
}

/**
 * Hook to fetch albums with infinite scroll support
 */
export function useAlbumsInfinite(options: UseAlbumsInfiniteOptions = {}) {
  const pageSize = options.pageSize || 100;

  return useInfiniteQuery({
    queryKey: ['albums-infinite', options.sort, options.filter],
    queryFn: async ({ pageParam, signal }) => {
      const response = await kodi.call<GetAlbumsResponse>(
        'AudioLibrary.GetAlbums',
        {
          properties: ALBUM_LIST_PROPERTIES,
          sort: options.sort,
          limits: { start: pageParam, end: pageParam + pageSize },
          filter: options.filter,
        },
        signal
      );
      return {
        albums: response.albums ?? [],
        nextCursor: response.limits.total > pageParam + pageSize ? pageParam + pageSize : undefined,
        total: response.limits.total,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook to fetch albums for a specific artist
 */
export function useAlbumsByArtist(artistId: number | undefined) {
  return useQuery({
    queryKey: ['albums', { artistId }],
    queryFn: async ({ signal }) => {
      if (!artistId) throw new Error('Artist ID is required');

      const response = await kodi.call<GetAlbumsResponse>(
        'AudioLibrary.GetAlbums',
        {
          artistid: artistId,
          properties: ALBUM_LIST_PROPERTIES,
          sort: { method: 'year', order: 'ascending' },
        },
        signal
      );

      return response.albums ?? [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: !!artistId,
  });
}
