import { useMemo, useState } from 'react';
import type { KodiArtist } from '@/api/types/audio';

export interface ArtistFilters {
  search: string;
  genre?: string;
  sortBy: 'artist' | 'dateadded';
  sortOrder: 'asc' | 'desc';
}

export function useArtistFilters(artists: KodiArtist[], kodiTotal?: number) {
  const [filters, setFilters] = useState<ArtistFilters>({
    search: '',
    sortBy: 'artist',
    sortOrder: 'asc',
  });

  // Get unique genres
  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    artists.forEach((artist) => {
      artist.genre?.forEach((g) => genreSet.add(g));
    });
    return Array.from(genreSet).sort();
  }, [artists]);

  // Filter and sort artists
  const filteredArtists = useMemo(() => {
    let result = [...artists];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (artist) =>
          artist.artist.toLowerCase().includes(searchLower) ||
          artist.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply genre filter
    if (filters.genre) {
      const genre = filters.genre;
      result = result.filter((artist) => artist.genre?.includes(genre));
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'artist':
          comparison = a.artist.localeCompare(b.artist);
          break;
        case 'dateadded':
          comparison = (a.dateadded || '').localeCompare(b.dateadded || '');
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [artists, filters]);

  return {
    filters,
    setFilters,
    filteredArtists,
    genres,
    totalCount: kodiTotal ?? artists.length,
    filteredCount: filteredArtists.length,
  };
}
