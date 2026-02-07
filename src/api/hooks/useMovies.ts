import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetMoviesResponse, KodiMovie } from '@/api/types/video';
import { MOVIE_PROPERTIES } from '@/api/types/video';
import type { KodiSort, KodiLimits, KodiFilter } from '@/api/types/common';

export interface UseMoviesOptions {
  sort?: KodiSort;
  limits?: KodiLimits;
  filter?: KodiFilter;
}

/**
 * Hook to fetch movies from Kodi
 */
export function useMovies(
  options: UseMoviesOptions = {},
  queryOptions?: Omit<UseQueryOptions<KodiMovie[]>, 'queryKey' | 'queryFn'>
) {
  // Default to loading first 100 movies for performance
  // Loading all 3,866 movies at once = 3.3 MB response which takes ~20 seconds
  const limits = options.limits || { start: 0, end: 100 };

  return useQuery({
    queryKey: ['movies', { ...options, limits }],
    queryFn: async ({ signal }) => {
      const response = await kodi.call<GetMoviesResponse>(
        'VideoLibrary.GetMovies',
        {
          properties: MOVIE_PROPERTIES,
          sort: options.sort,
          limits,
          filter: options.filter,
        },
        signal
      );
      return response.movies ?? [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - keep data cached longer
    retry: 1, // Only retry once on failure
    ...queryOptions,
  });
}

/**
 * Hook to get movie count
 */
export function useMovieCount() {
  return useQuery({
    queryKey: ['movies', 'count'],
    queryFn: async ({ signal }) => {
      const response = await kodi.call<GetMoviesResponse>(
        'VideoLibrary.GetMovies',
        {
          limits: { start: 0, end: 1 },
        },
        signal
      );
      return response.limits.total;
    },
    staleTime: 10 * 60 * 1000,
  });
}
