import { useQuery } from '@tanstack/react-query';
import { kodi } from '../client';
import type { GetEpisodesResponse, GetEpisodeDetailsResponse, KodiEpisode } from '../types/video';
import { EPISODE_PROPERTIES } from '../types/video';

/**
 * Fetch episodes for a specific season
 */
export function useEpisodesBySeason(tvshowid: number | undefined, season: number | undefined) {
  return useQuery({
    queryKey: ['episodes', tvshowid, season],
    queryFn: async () => {
      if (!tvshowid) throw new Error('TV show ID is required');
      if (season === undefined) throw new Error('Season number is required');

      const response = await kodi.call<GetEpisodesResponse>('VideoLibrary.GetEpisodes', {
        tvshowid,
        season,
        properties: EPISODE_PROPERTIES,
        sort: { method: 'episode', order: 'ascending' },
      });

      return response.episodes;
    },
    enabled: !!tvshowid && season !== undefined,
  });
}

/**
 * Fetch all episodes for a TV show
 */
export function useAllEpisodes(tvshowid: number | undefined) {
  return useQuery({
    queryKey: ['episodes', tvshowid],
    queryFn: async () => {
      if (!tvshowid) throw new Error('TV show ID is required');

      const response = await kodi.call<GetEpisodesResponse>('VideoLibrary.GetEpisodes', {
        tvshowid,
        properties: EPISODE_PROPERTIES,
        sort: { method: 'episode', order: 'ascending' },
      });

      return response.episodes;
    },
    enabled: !!tvshowid,
  });
}

/**
 * Fetch details for a specific episode
 */
export function useEpisodeDetails(episodeid: number | undefined) {
  return useQuery({
    queryKey: ['episode', episodeid],
    queryFn: async () => {
      if (!episodeid) throw new Error('Episode ID is required');

      const response = await kodi.call<GetEpisodeDetailsResponse>(
        'VideoLibrary.GetEpisodeDetails',
        {
          episodeid,
          properties: EPISODE_PROPERTIES,
        }
      );

      return response.episodedetails;
    },
    enabled: !!episodeid,
  });
}

/**
 * Helper to group episodes by season
 */
export function groupEpisodesBySeason(episodes: KodiEpisode[]): Map<number, KodiEpisode[]> {
  const grouped = new Map<number, KodiEpisode[]>();

  episodes.forEach((episode) => {
    const seasonNum = episode.season;
    if (!grouped.has(seasonNum)) {
      grouped.set(seasonNum, []);
    }
    grouped.get(seasonNum)?.push(episode);
  });

  return grouped;
}
