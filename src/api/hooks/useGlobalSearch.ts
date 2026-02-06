import { useQuery } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import { useDebounce } from '@/hooks/useDebounce';
import { getPosterUrl, getThumbUrl } from '@/lib/image-utils';
import type { KodiMovie, KodiTVShow, KodiEpisode } from '@/api/types/video';
import type { KodiArtist, KodiAlbum, KodiSong } from '@/api/types/audio';
import type { SearchResult, SearchResults } from '@/api/types/search';

// Minimal properties for fast search results
const SEARCH_MOVIE_PROPS = ['title', 'year', 'art'] as const;
const SEARCH_TVSHOW_PROPS = ['title', 'year', 'art'] as const;
const SEARCH_EPISODE_PROPS = [
  'title',
  'showtitle',
  'season',
  'episode',
  'art',
  'tvshowid',
] as const;
const SEARCH_ARTIST_PROPS = ['artist', 'art'] as const;
const SEARCH_ALBUM_PROPS = ['title', 'artist', 'artistid', 'year', 'art'] as const;
const SEARCH_SONG_PROPS = ['title', 'artist', 'album', 'albumid', 'artistid', 'art'] as const;

const RESULTS_PER_CATEGORY = 5;
const MIN_QUERY_LENGTH = 2;

interface SearchApiResponses {
  movies: { movies?: KodiMovie[] };
  tvshows: { tvshows?: KodiTVShow[] };
  episodes: { episodes?: KodiEpisode[] };
  artists: { artists?: KodiArtist[] };
  albums: { albums?: KodiAlbum[] };
  songs: { songs?: KodiSong[] };
}

// Mapper functions to convert Kodi types to unified SearchResult
function mapMovieToSearchResult(movie: KodiMovie): SearchResult {
  return {
    id: movie.movieid,
    type: 'movie',
    title: movie.title,
    subtitle: movie.year?.toString(),
    imageUrl: getPosterUrl(movie.art),
    route: `/movies/${String(movie.movieid)}`,
  };
}

function mapTVShowToSearchResult(show: KodiTVShow): SearchResult {
  return {
    id: show.tvshowid,
    type: 'tvshow',
    title: show.title,
    subtitle: show.year?.toString(),
    imageUrl: getPosterUrl(show.art),
    route: `/tv/${String(show.tvshowid)}`,
  };
}

function mapEpisodeToSearchResult(episode: KodiEpisode): SearchResult {
  const seasonStr = String(episode.season).padStart(2, '0');
  const episodeStr = String(episode.episode).padStart(2, '0');
  return {
    id: episode.episodeid,
    type: 'episode',
    title: episode.title,
    subtitle: `${episode.showtitle ?? 'Unknown'} S${seasonStr}E${episodeStr}`,
    imageUrl: getThumbUrl(episode.art),
    route: `/tv/${String(episode.tvshowid ?? 0)}/${String(episode.season)}/${String(episode.episodeid)}`,
  };
}

function mapArtistToSearchResult(artist: KodiArtist): SearchResult {
  return {
    id: artist.artistid,
    type: 'artist',
    title: artist.artist,
    subtitle: undefined,
    imageUrl: getPosterUrl(artist.art),
    route: `/music/${String(artist.artistid)}`,
  };
}

function mapAlbumToSearchResult(album: KodiAlbum): SearchResult {
  const artistId = album.artistid?.[0];
  return {
    id: album.albumid,
    type: 'album',
    title: album.title,
    subtitle: album.artist?.join(', ') ?? (album.year ? String(album.year) : undefined),
    imageUrl: getPosterUrl(album.art),
    route: artistId ? `/music/${String(artistId)}/${String(album.albumid)}` : `/music/albums`,
  };
}

function mapSongToSearchResult(song: KodiSong): SearchResult {
  const artistId = song.artistid?.[0];
  const albumId = song.albumid;
  return {
    id: song.songid,
    type: 'song',
    title: song.title,
    subtitle: song.artist?.join(', ') ?? song.album,
    imageUrl: getPosterUrl(song.art),
    // Navigate to album if available, otherwise to music index
    route: artistId && albumId ? `/music/${String(artistId)}/${String(albumId)}` : `/music`,
  };
}

// Helper to safely call an API and return empty result on error
async function safeCall<T>(promise: Promise<T>, defaultValue: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return defaultValue;
  }
}

async function searchAllLibraries(query: string): Promise<SearchResults> {
  // Run all searches in parallel, with individual error handling
  const [movies, tvshows, episodes, artists, albums, songs] = await Promise.all([
    safeCall(
      kodi.call<SearchApiResponses['movies']>('VideoLibrary.GetMovies', {
        properties: [...SEARCH_MOVIE_PROPS],
        filter: { field: 'title', operator: 'contains', value: query },
        limits: { start: 0, end: RESULTS_PER_CATEGORY },
      }),
      { movies: [] }
    ),
    safeCall(
      kodi.call<SearchApiResponses['tvshows']>('VideoLibrary.GetTVShows', {
        properties: [...SEARCH_TVSHOW_PROPS],
        filter: { field: 'title', operator: 'contains', value: query },
        limits: { start: 0, end: RESULTS_PER_CATEGORY },
      }),
      { tvshows: [] }
    ),
    safeCall(
      kodi.call<SearchApiResponses['episodes']>('VideoLibrary.GetEpisodes', {
        properties: [...SEARCH_EPISODE_PROPS],
        filter: { field: 'title', operator: 'contains', value: query },
        limits: { start: 0, end: RESULTS_PER_CATEGORY },
      }),
      { episodes: [] }
    ),
    safeCall(
      kodi.call<SearchApiResponses['artists']>('AudioLibrary.GetArtists', {
        properties: [...SEARCH_ARTIST_PROPS],
        filter: { field: 'artist', operator: 'contains', value: query },
        limits: { start: 0, end: RESULTS_PER_CATEGORY },
      }),
      { artists: [] }
    ),
    safeCall(
      kodi.call<SearchApiResponses['albums']>('AudioLibrary.GetAlbums', {
        properties: [...SEARCH_ALBUM_PROPS],
        filter: { field: 'album', operator: 'contains', value: query },
        limits: { start: 0, end: RESULTS_PER_CATEGORY },
      }),
      { albums: [] }
    ),
    safeCall(
      kodi.call<SearchApiResponses['songs']>('AudioLibrary.GetSongs', {
        properties: [...SEARCH_SONG_PROPS],
        filter: { field: 'title', operator: 'contains', value: query },
        limits: { start: 0, end: RESULTS_PER_CATEGORY },
      }),
      { songs: [] }
    ),
  ]);

  const movieResults = (movies.movies ?? []).map(mapMovieToSearchResult);
  const tvshowResults = (tvshows.tvshows ?? []).map(mapTVShowToSearchResult);
  const episodeResults = (episodes.episodes ?? []).map(mapEpisodeToSearchResult);
  const artistResults = (artists.artists ?? []).map(mapArtistToSearchResult);
  const albumResults = (albums.albums ?? []).map(mapAlbumToSearchResult);
  const songResults = (songs.songs ?? []).map(mapSongToSearchResult);

  return {
    movies: movieResults,
    tvshows: tvshowResults,
    episodes: episodeResults,
    artists: artistResults,
    albums: albumResults,
    songs: songResults,
    totalCount:
      movieResults.length +
      tvshowResults.length +
      episodeResults.length +
      artistResults.length +
      albumResults.length +
      songResults.length,
  };
}

export interface UseGlobalSearchOptions {
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Minimum query length to trigger search (default: 2) */
  minLength?: number;
}

export function useGlobalSearch(query: string, options: UseGlobalSearchOptions = {}) {
  const { debounceMs = 300, minLength = MIN_QUERY_LENGTH } = options;

  const debouncedQuery = useDebounce(query.trim(), debounceMs);
  const isQueryValid = debouncedQuery.length >= minLength;

  return useQuery({
    queryKey: ['search', 'global', debouncedQuery],
    queryFn: () => searchAllLibraries(debouncedQuery),
    enabled: isQueryValid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
