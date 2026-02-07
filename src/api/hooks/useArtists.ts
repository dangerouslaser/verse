import { useInfiniteQuery } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetArtistsResponse } from '@/api/types/audio';
import { ARTIST_LIST_PROPERTIES } from '@/api/types/audio';
import type { KodiSort, KodiFilter } from '@/api/types/common';

export interface UseArtistsInfiniteOptions {
  sort?: KodiSort;
  filter?: KodiFilter;
  pageSize?: number;
}

/**
 * Hook to fetch artists with infinite scroll support
 */
export function useArtistsInfinite(options: UseArtistsInfiniteOptions = {}) {
  const pageSize = options.pageSize || 100;

  return useInfiniteQuery({
    queryKey: ['artists-infinite', options.sort, options.filter],
    queryFn: async ({ pageParam, signal }) => {
      const response = await kodi.call<GetArtistsResponse>(
        'AudioLibrary.GetArtists',
        {
          properties: ARTIST_LIST_PROPERTIES,
          sort: options.sort,
          limits: { start: pageParam, end: pageParam + pageSize },
          filter: options.filter,
        },
        signal
      );
      return {
        artists: response.artists ?? [],
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
