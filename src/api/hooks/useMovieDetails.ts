import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetMovieDetailsResponse, KodiMovie } from '@/api/types/video';
import { MOVIE_PROPERTIES } from '@/api/types/video';

/**
 * Hook to fetch detailed information about a specific movie
 */
export function useMovieDetails(
  movieId: number | undefined,
  queryOptions?: Omit<UseQueryOptions<KodiMovie>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['movie', movieId],
    queryFn: async ({ signal }) => {
      if (!movieId) {
        throw new Error('Movie ID is required');
      }

      const response = await kodi.call<GetMovieDetailsResponse>(
        'VideoLibrary.GetMovieDetails',
        {
          movieid: movieId,
          properties: MOVIE_PROPERTIES,
        },
        signal
      );

      return response.moviedetails;
    },
    enabled: movieId !== undefined,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    retry: 1,
    ...queryOptions,
  });
}
