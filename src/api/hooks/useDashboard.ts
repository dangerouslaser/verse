import { useQuery } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type { KodiMovie, KodiEpisode, KodiTVShow } from '@/api/types/video';
import type { KodiArt } from '@/api/types/common';

// Extended episode type with show's clearlogo
export interface InProgressEpisode extends KodiEpisode {
  showArt?: KodiArt;
}

interface LibraryStats {
  movies: number;
  tvshows: number;
  episodes: number;
}

export function useRecentMovies(limit = 20) {
  return useQuery({
    queryKey: ['movies', 'recent', limit],
    queryFn: async () => {
      const result = await kodi.call<{ movies?: KodiMovie[] }>('VideoLibrary.GetMovies', {
        properties: RECENT_MOVIE_PROPS,
        sort: { method: 'dateadded', order: 'descending' },
        limits: { start: 0, end: limit },
      });
      return result.movies ?? [];
    },
  });
}

export function useRecentEpisodes(limit = 20) {
  return useQuery({
    queryKey: ['episodes', 'recent', limit],
    queryFn: async (): Promise<InProgressEpisode[]> => {
      const result = await kodi.call<{ episodes?: KodiEpisode[] }>('VideoLibrary.GetEpisodes', {
        properties: RECENT_EPISODE_PROPS,
        sort: { method: 'dateadded', order: 'descending' },
        limits: { start: 0, end: limit },
      });

      const episodes = result.episodes ?? [];
      if (episodes.length === 0) return [];

      // Get unique TV show IDs
      const showIds = [...new Set(episodes.map((ep) => ep.tvshowid).filter(Boolean))] as number[];

      // Fetch TV show art for clearlogos
      const showArtMap = new Map<number, KodiArt>();
      if (showIds.length > 0) {
        await Promise.all(
          showIds.map(async (tvshowid) => {
            try {
              const showResult = await kodi.call<{ tvshowdetails?: KodiTVShow }>(
                'VideoLibrary.GetTVShowDetails',
                { tvshowid, properties: ['art'] }
              );
              if (showResult.tvshowdetails?.art) {
                showArtMap.set(tvshowid, showResult.tvshowdetails.art);
              }
            } catch {
              // Ignore errors for individual show fetches
            }
          })
        );
      }

      // Attach show art to episodes
      return episodes.map((episode) => ({
        ...episode,
        showArt: episode.tvshowid ? showArtMap.get(episode.tvshowid) : undefined,
      }));
    },
  });
}

export function useLibraryStats() {
  return useQuery({
    queryKey: ['library', 'stats'],
    queryFn: async (): Promise<LibraryStats> => {
      const [moviesResult, tvshowsResult] = await Promise.all([
        kodi.call<{ limits: { total: number } }>('VideoLibrary.GetMovies', {
          limits: { start: 0, end: 0 },
        }),
        kodi.call<{ limits: { total: number } }>('VideoLibrary.GetTVShows', {
          limits: { start: 0, end: 0 },
        }),
      ]);

      // Get episode count from TV shows result or make separate call
      const episodesResult = await kodi.call<{ limits: { total: number } }>(
        'VideoLibrary.GetEpisodes',
        { limits: { start: 0, end: 0 } }
      );

      return {
        movies: moviesResult.limits.total,
        tvshows: tvshowsResult.limits.total,
        episodes: episodesResult.limits.total,
      };
    },
  });
}

const RECENT_MOVIE_PROPS = ['title', 'year', 'art'] as const;

const RECENT_EPISODE_PROPS = [
  'title',
  'showtitle',
  'season',
  'episode',
  'art',
  'tvshowid',
] as const;

const IN_PROGRESS_MOVIE_PROPS = [
  'title',
  'year',
  'runtime',
  'art',
  'resume',
  'lastplayed',
] as const;

const IN_PROGRESS_EPISODE_PROPS = [
  'title',
  'showtitle',
  'season',
  'episode',
  'runtime',
  'art',
  'resume',
  'lastplayed',
  'tvshowid',
] as const;

export function useInProgressMovies() {
  return useQuery({
    queryKey: ['movies', 'in-progress'],
    queryFn: async () => {
      const result = await kodi.call<{ movies?: KodiMovie[] }>('VideoLibrary.GetMovies', {
        properties: IN_PROGRESS_MOVIE_PROPS,
        filter: {
          field: 'inprogress',
          operator: 'is',
          value: 'true',
        },
        sort: { method: 'lastplayed', order: 'descending' },
        limits: { start: 0, end: 12 },
      });
      return result.movies ?? [];
    },
  });
}

export function useInProgressEpisodes() {
  return useQuery({
    queryKey: ['episodes', 'in-progress'],
    queryFn: async (): Promise<InProgressEpisode[]> => {
      const result = await kodi.call<{ episodes?: KodiEpisode[] }>('VideoLibrary.GetEpisodes', {
        properties: IN_PROGRESS_EPISODE_PROPS,
        filter: {
          field: 'inprogress',
          operator: 'is',
          value: 'true',
        },
        sort: { method: 'lastplayed', order: 'descending' },
        limits: { start: 0, end: 12 },
      });

      const episodes = result.episodes ?? [];
      if (episodes.length === 0) return [];

      // Get unique TV show IDs
      const showIds = [...new Set(episodes.map((ep) => ep.tvshowid).filter(Boolean))] as number[];

      // Fetch TV show art for clearlogos
      const showArtMap = new Map<number, KodiArt>();
      if (showIds.length > 0) {
        await Promise.all(
          showIds.map(async (tvshowid) => {
            try {
              const showResult = await kodi.call<{ tvshowdetails?: KodiTVShow }>(
                'VideoLibrary.GetTVShowDetails',
                { tvshowid, properties: ['art'] }
              );
              if (showResult.tvshowdetails?.art) {
                showArtMap.set(tvshowid, showResult.tvshowdetails.art);
              }
            } catch {
              // Ignore errors for individual show fetches
            }
          })
        );
      }

      // Attach show art to episodes
      return episodes.map((episode) => ({
        ...episode,
        showArt: episode.tvshowid ? showArtMap.get(episode.tvshowid) : undefined,
      }));
    },
  });
}
