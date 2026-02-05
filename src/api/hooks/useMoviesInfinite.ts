import { useInfiniteQuery } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetMoviesResponse } from '@/api/types/video';
import { MOVIE_PROPERTIES } from '@/api/types/video';
import type { KodiSort, KodiFilter } from '@/api/types/common';

export interface UseMoviesInfiniteOptions {
  sort?: KodiSort;
  filter?: KodiFilter;
  pageSize?: number;
}

/**
 * Hook to fetch movies with infinite scroll support
 */
export function useMoviesInfinite(options: UseMoviesInfiniteOptions = {}) {
  const pageSize = options.pageSize || 100;

  return useInfiniteQuery({
    queryKey: ['movies-infinite', options.sort, options.filter],
    queryFn: async ({ pageParam, signal }) => {
      const response = await kodi.call<GetMoviesResponse>(
        'VideoLibrary.GetMovies',
        {
          properties: MOVIE_PROPERTIES,
          sort: options.sort,
          limits: { start: pageParam, end: pageParam + pageSize },
          filter: options.filter,
        },
        signal
      );
      return {
        movies: response.movies,
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
