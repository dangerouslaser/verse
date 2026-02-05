import { useMemo, useState } from 'react';
import type { KodiSong } from '@/api/types/audio';
import { joinArray } from '@/lib/format';

export interface SongFilters {
  search: string;
  genre?: string;
  sortBy: 'title' | 'artist' | 'album' | 'year' | 'dateadded';
  sortOrder: 'asc' | 'desc';
}

export function useSongFilters(songs: KodiSong[], kodiTotal?: number) {
  const [filters, setFilters] = useState<SongFilters>({
    search: '',
    sortBy: 'title',
    sortOrder: 'asc',
  });

  // Get unique genres
  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    songs.forEach((song) => {
      song.genre?.forEach((g) => genreSet.add(g));
    });
    return Array.from(genreSet).sort();
  }, [songs]);

  // Filter and sort songs
  const filteredSongs = useMemo(() => {
    let result = [...songs];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (song) =>
          song.title.toLowerCase().includes(searchLower) ||
          joinArray(song.artist).toLowerCase().includes(searchLower) ||
          song.album?.toLowerCase().includes(searchLower)
      );
    }

    // Apply genre filter
    if (filters.genre) {
      const genre = filters.genre;
      result = result.filter((song) => song.genre?.includes(genre));
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'artist':
          comparison = joinArray(a.artist).localeCompare(joinArray(b.artist));
          break;
        case 'album':
          comparison = (a.album || '').localeCompare(b.album || '');
          break;
        case 'year':
          comparison = (a.year || 0) - (b.year || 0);
          break;
        case 'dateadded':
          comparison = (a.dateadded || '').localeCompare(b.dateadded || '');
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [songs, filters]);

  return {
    filters,
    setFilters,
    filteredSongs,
    genres,
    totalCount: kodiTotal ?? songs.length,
    filteredCount: filteredSongs.length,
  };
}
