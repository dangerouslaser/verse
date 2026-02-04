/**
 * Video library types (Movies, TV Shows, Episodes)
 */

import type {
  KodiArt,
  KodiCast,
  KodiMediaBase,
  KodiRating,
  KodiResume,
  KodiStreamDetails,
  KodiUniqueId,
} from './common';

/**
 * Movie item from VideoLibrary.GetMovies
 */
export interface KodiMovie extends KodiMediaBase {
  movieid: number;
  title: string;
  originaltitle?: string;
  sorttitle?: string;
  year?: number;
  rating?: number;
  userrating?: number;
  ratings?: Record<string, KodiRating>;
  votes?: string;
  top250?: number;
  runtime?: number;
  genre?: string[];
  country?: string[];
  tagline?: string;
  plot?: string;
  plotoutline?: string;
  director?: string[];
  writer?: string[];
  studio?: string[];
  mpaa?: string;
  cast?: KodiCast[];
  imdbnumber?: string;
  uniqueid?: KodiUniqueId;
  premiered?: string;
  file?: string;
  streamdetails?: KodiStreamDetails;
  resume?: KodiResume;
  set?: string;
  setid?: number;
  tag?: string[];
  trailer?: string;
}

/**
 * TV Show item from VideoLibrary.GetTVShows
 */
export interface KodiTVShow extends KodiMediaBase {
  tvshowid: number;
  title: string;
  originaltitle?: string;
  sorttitle?: string;
  year?: number;
  rating?: number;
  userrating?: number;
  ratings?: Record<string, KodiRating>;
  votes?: string;
  runtime?: number;
  genre?: string[];
  studio?: string[];
  mpaa?: string;
  cast?: KodiCast[];
  imdbnumber?: string;
  uniqueid?: KodiUniqueId;
  premiered?: string;
  plot?: string;
  tag?: string[];
  season?: number;
  episode?: number;
  watchedepisodes?: number;
  file?: string;
}

/**
 * Season item from VideoLibrary.GetSeasons
 */
export interface KodiSeason extends KodiMediaBase {
  seasonid: number;
  season: number;
  tvshowid: number;
  episode?: number;
  showtitle?: string;
  watchedepisodes?: number;
  userrating?: number;
}

/**
 * Episode item from VideoLibrary.GetEpisodes
 */
export interface KodiEpisode extends KodiMediaBase {
  episodeid: number;
  episode: number;
  season: number;
  tvshowid: number;
  title: string;
  originaltitle?: string;
  showtitle?: string;
  rating?: number;
  userrating?: number;
  ratings?: Record<string, KodiRating>;
  votes?: string;
  runtime?: number;
  director?: string[];
  writer?: string[];
  cast?: KodiCast[];
  firstaired?: string;
  plot?: string;
  file?: string;
  streamdetails?: KodiStreamDetails;
  resume?: KodiResume;
  uniqueid?: KodiUniqueId;
  productioncode?: string;
}

/**
 * Movie set/collection
 */
export interface KodiMovieSet {
  setid: number;
  title: string;
  plot?: string;
  art?: KodiArt;
}

/**
 * Response from VideoLibrary.GetMovies
 */
export interface GetMoviesResponse {
  movies: KodiMovie[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

/**
 * Response from VideoLibrary.GetMovieDetails
 */
export interface GetMovieDetailsResponse {
  moviedetails: KodiMovie;
}

/**
 * Response from VideoLibrary.GetTVShows
 */
export interface GetTVShowsResponse {
  tvshows: KodiTVShow[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

/**
 * Response from VideoLibrary.GetTVShowDetails
 */
export interface GetTVShowDetailsResponse {
  tvshowdetails: KodiTVShow;
}

/**
 * Response from VideoLibrary.GetSeasons
 */
export interface GetSeasonsResponse {
  seasons: KodiSeason[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

/**
 * Response from VideoLibrary.GetEpisodes
 */
export interface GetEpisodesResponse {
  episodes: KodiEpisode[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

/**
 * Response from VideoLibrary.GetEpisodeDetails
 */
export interface GetEpisodeDetailsResponse {
  episodedetails: KodiEpisode;
}

/**
 * Properties that can be requested for movies
 */
export const MOVIE_PROPERTIES = [
  'title',
  'originaltitle',
  'sorttitle',
  'year',
  'rating',
  'userrating',
  'ratings',
  'votes',
  'top250',
  'runtime',
  'genre',
  'country',
  'tagline',
  'plot',
  'plotoutline',
  'director',
  'writer',
  'studio',
  'mpaa',
  'cast',
  'imdbnumber',
  'uniqueid',
  'premiered',
  'file',
  'streamdetails',
  'resume',
  'set',
  'setid',
  'tag',
  'art',
  'playcount',
  'lastplayed',
  'dateadded',
  'fanart',
  'thumbnail',
  'trailer',
] as const;

/**
 * Properties that can be requested for TV shows
 */
export const TVSHOW_PROPERTIES = [
  'title',
  'originaltitle',
  'sorttitle',
  'year',
  'rating',
  'userrating',
  'ratings',
  'votes',
  'runtime',
  'genre',
  'studio',
  'mpaa',
  'cast',
  'imdbnumber',
  'uniqueid',
  'premiered',
  'plot',
  'tag',
  'season',
  'episode',
  'watchedepisodes',
  'art',
  'playcount',
  'lastplayed',
  'dateadded',
  'fanart',
  'thumbnail',
] as const;

/**
 * Properties that can be requested for seasons
 */
export const SEASON_PROPERTIES = [
  'season',
  'showtitle',
  'playcount',
  'episode',
  'watchedepisodes',
  'art',
  'userrating',
  'title',
  'tvshowid',
  'thumbnail',
  'fanart',
] as const;

/**
 * Properties that can be requested for episodes
 */
export const EPISODE_PROPERTIES = [
  'title',
  'originaltitle',
  'showtitle',
  'season',
  'episode',
  'rating',
  'userrating',
  'ratings',
  'votes',
  'runtime',
  'director',
  'writer',
  'cast',
  'firstaired',
  'plot',
  'file',
  'streamdetails',
  'resume',
  'uniqueid',
  'productioncode',
  'art',
  'playcount',
  'lastplayed',
  'dateadded',
  'fanart',
  'thumbnail',
] as const;
