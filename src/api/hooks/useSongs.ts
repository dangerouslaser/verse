import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { GetSongsResponse } from '@/api/types/audio';
import { SONG_LIST_PROPERTIES } from '@/api/types/audio';
import type { KodiSort, KodiFilter } from '@/api/types/common';

export interface UseSongsInfiniteOptions {
  sort?: KodiSort;
  filter?: KodiFilter;
  pageSize?: number;
}

/**
 * Hook to fetch songs with infinite scroll support
 */
export function useSongsInfinite(options: UseSongsInfiniteOptions = {}) {
  const pageSize = options.pageSize || 100;

  return useInfiniteQuery({
    queryKey: ['songs-infinite', options.sort, options.filter],
    queryFn: async ({ pageParam, signal }) => {
      const response = await kodi.call<GetSongsResponse>(
        'AudioLibrary.GetSongs',
        {
          properties: SONG_LIST_PROPERTIES,
          sort: options.sort,
          limits: { start: pageParam, end: pageParam + pageSize },
          filter: options.filter,
        },
        signal
      );
      return {
        songs: response.songs ?? [],
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
 * Hook to fetch songs for a specific album
 */
export function useSongsByAlbum(albumId: number | undefined) {
  return useQuery({
    queryKey: ['songs', { albumId }],
    queryFn: async ({ signal }) => {
      if (!albumId) throw new Error('Album ID is required');

      const response = await kodi.call<GetSongsResponse>(
        'AudioLibrary.GetSongs',
        {
          filter: { albumid: albumId },
          properties: SONG_LIST_PROPERTIES,
          sort: { method: 'track', order: 'ascending' },
        },
        signal
      );

      return response.songs ?? [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: !!albumId,
  });
}

/**
 * Hook to fetch songs for a specific artist
 */
export function useSongsByArtist(artistId: number | undefined) {
  return useQuery({
    queryKey: ['songs', { artistId }],
    queryFn: async ({ signal }) => {
      if (!artistId) throw new Error('Artist ID is required');

      const response = await kodi.call<GetSongsResponse>(
        'AudioLibrary.GetSongs',
        {
          filter: { artistid: artistId },
          properties: SONG_LIST_PROPERTIES,
        },
        signal
      );

      return response.songs ?? [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: !!artistId,
  });
}
