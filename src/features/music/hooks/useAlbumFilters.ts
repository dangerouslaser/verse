import { useMemo, useState } from 'react';
import type { KodiAlbum } from '@/api/types/audio';

export interface AlbumFilters {
  search: string;
  genre?: string;
  year?: string;
  sortBy: 'title' | 'year' | 'rating' | 'artist' | 'dateadded';
  sortOrder: 'asc' | 'desc';
}

export function useAlbumFilters(albums: KodiAlbum[], kodiTotal?: number) {
  const [filters, setFilters] = useState<AlbumFilters>({
    search: '',
    sortBy: 'title',
    sortOrder: 'asc',
  });

  // Get unique genres
  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    albums.forEach((album) => {
      album.genre?.forEach((g) => genreSet.add(g));
    });
    return Array.from(genreSet).sort();
  }, [albums]);

  // Get unique years
  const years = useMemo(() => {
    const yearSet = new Set<string>();
    albums.forEach((album) => {
      const year = album.year?.toString();
      if (year) yearSet.add(year);
    });
    return Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));
  }, [albums]);

  // Filter and sort albums
  const filteredAlbums = useMemo(() => {
    let result = [...albums];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (album) =>
          album.title.toLowerCase().includes(searchLower) ||
          album.displayartist?.toLowerCase().includes(searchLower) ||
          album.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply genre filter
    if (filters.genre) {
      const genre = filters.genre;
      result = result.filter((album) => album.genre?.includes(genre));
    }

    // Apply year filter
    if (filters.year) {
      result = result.filter((album) => {
        const year = album.year?.toString();
        return year === filters.year;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'year':
          comparison = (a.year || 0) - (b.year || 0);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'artist':
          comparison = (a.displayartist || '').localeCompare(b.displayartist || '');
          break;
        case 'dateadded':
          comparison = (a.dateadded || '').localeCompare(b.dateadded || '');
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [albums, filters]);

  return {
    filters,
    setFilters,
    filteredAlbums,
    genres,
    years,
    totalCount: kodiTotal ?? albums.length,
    filteredCount: filteredAlbums.length,
  };
}
