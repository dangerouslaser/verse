import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { kodi } from '@/api/client';

/**
 * Hook to play a song
 */
export function usePlaySong(options?: UseMutationOptions<string, Error, number>) {
  return useMutation({
    mutationFn: async (songId: number) => {
      const response = await kodi.call<string>('Player.Open', {
        item: { songid: songId },
      });
      return response;
    },
    ...options,
  });
}

/**
 * Hook to play an album
 */
export function usePlayAlbum(options?: UseMutationOptions<string, Error, number>) {
  return useMutation({
    mutationFn: async (albumId: number) => {
      const response = await kodi.call<string>('Player.Open', {
        item: { albumid: albumId },
      });
      return response;
    },
    ...options,
  });
}

/**
 * Hook to play all songs by an artist
 */
export function usePlayArtist(options?: UseMutationOptions<string, Error, number>) {
  return useMutation({
    mutationFn: async (artistId: number) => {
      const response = await kodi.call<string>('Player.Open', {
        item: { artistid: artistId },
      });
      return response;
    },
    ...options,
  });
}

/**
 * Hook to add a song to the playlist
 */
export function useAddToPlaylist(options?: UseMutationOptions<string, Error, number>) {
  return useMutation({
    mutationFn: async (songId: number) => {
      const response = await kodi.call<string>('Playlist.Add', {
        playlistid: 0, // Audio playlist
        item: { songid: songId },
      });
      return response;
    },
    ...options,
  });
}
