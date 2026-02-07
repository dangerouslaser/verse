import { useInfiniteQuery } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetTVShowsResponse } from '@/api/types/video';
import { TVSHOW_PROPERTIES } from '@/api/types/video';
import type { KodiSort, KodiFilter } from '@/api/types/common';

export interface UseTVShowsInfiniteOptions {
  sort?: KodiSort;
  filter?: KodiFilter;
  pageSize?: number;
}

/**
 * Hook to fetch TV shows with infinite scroll support
 */
export function useTVShowsInfinite(options: UseTVShowsInfiniteOptions = {}) {
  const pageSize = options.pageSize || 100;

  return useInfiniteQuery({
    queryKey: ['tvshows-infinite', options.sort, options.filter],
    queryFn: async ({ pageParam, signal }) => {
      const response = await kodi.call<GetTVShowsResponse>(
        'VideoLibrary.GetTVShows',
        {
          properties: TVSHOW_PROPERTIES,
          sort: options.sort,
          limits: { start: pageParam, end: pageParam + pageSize },
          filter: options.filter,
        },
        signal
      );
      return {
        tvshows: response.tvshows ?? [],
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
