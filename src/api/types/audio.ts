/**
 * Audio library types (Artists, Albums, Songs)
 */

import type { KodiMediaBase } from './common';

/**
 * Artist item from AudioLibrary.GetArtists
 */
export interface KodiArtist extends KodiMediaBase {
  artistid: number;
  artist: string;
  genre?: string[];
  description?: string;
  born?: string;
  died?: string;
  formed?: string;
  disbanded?: string;
  yearsactive?: string[];
  mood?: string[];
  style?: string[];
  instrument?: string[];
  musicbrainzartistid?: string;
  isalbumartist?: boolean;
  songgenres?: Array<{ genreid: number; title: string }>;
  roles?: Array<{ roleid: number; role: string }>;
}

/**
 * Album item from AudioLibrary.GetAlbums
 */
export interface KodiAlbum extends KodiMediaBase {
  albumid: number;
  title: string;
  artist?: string[];
  artistid?: number[];
  displayartist?: string;
  genre?: string[];
  year?: number;
  rating?: number;
  userrating?: number;
  votes?: string;
  musicbrainzalbumid?: string;
  musicbrainzreleasegroupid?: string;
  description?: string;
  albumlabel?: string;
  type?: string;
  style?: string[];
  mood?: string[];
  theme?: string[];
  compilation?: boolean;
  releasetype?: string;
  totaldiscs?: number;
  songgenres?: Array<{ genreid: number; title: string }>;
}

/**
 * Song item from AudioLibrary.GetSongs
 */
export interface KodiSong extends KodiMediaBase {
  songid: number;
  title: string;
  artist?: string[];
  artistid?: number[];
  albumartist?: string[];
  albumartistid?: number[];
  displayartist?: string;
  album?: string;
  albumid?: number;
  genre?: string[];
  year?: number;
  rating?: number;
  userrating?: number;
  votes?: string;
  track?: number;
  disc?: number;
  duration?: number;
  comment?: string;
  lyrics?: string;
  musicbrainztrackid?: string;
  musicbrainzartistid?: string;
  file?: string;
  genreid?: number[];
  contributors?: Array<{ name: string; role: string; roleid: number }>;
}

/**
 * Response from AudioLibrary.GetArtists
 */
export interface GetArtistsResponse {
  artists?: KodiArtist[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

/**
 * Response from AudioLibrary.GetArtistDetails
 */
export interface GetArtistDetailsResponse {
  artistdetails: KodiArtist;
}

/**
 * Response from AudioLibrary.GetAlbums
 */
export interface GetAlbumsResponse {
  albums?: KodiAlbum[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

/**
 * Response from AudioLibrary.GetAlbumDetails
 */
export interface GetAlbumDetailsResponse {
  albumdetails: KodiAlbum;
}

/**
 * Response from AudioLibrary.GetSongs
 */
export interface GetSongsResponse {
  songs?: KodiSong[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

/**
 * Response from AudioLibrary.GetSongDetails
 */
export interface GetSongDetailsResponse {
  songdetails: KodiSong;
}

/**
 * Properties that can be requested for artists
 */
export const ARTIST_PROPERTIES = [
  'artist',
  'genre',
  'description',
  'born',
  'died',
  'formed',
  'disbanded',
  'yearsactive',
  'mood',
  'style',
  'instrument',
  'musicbrainzartistid',
  'isalbumartist',
  'songgenres',
  'roles',
  'art',
  'thumbnail',
  'fanart',
  'dateadded',
  'playcount',
  'lastplayed',
] as const;

/**
 * Lighter property set for artist list views
 */
export const ARTIST_LIST_PROPERTIES = [
  'artist',
  'genre',
  'description',
  'art',
  'thumbnail',
  'fanart',
  'dateadded',
] as const;

/**
 * Properties that can be requested for albums
 */
export const ALBUM_PROPERTIES = [
  'title',
  'artist',
  'artistid',
  'displayartist',
  'genre',
  'year',
  'rating',
  'userrating',
  'votes',
  'musicbrainzalbumid',
  'musicbrainzreleasegroupid',
  'description',
  'albumlabel',
  'type',
  'style',
  'mood',
  'theme',
  'compilation',
  'releasetype',
  'totaldiscs',
  'songgenres',
  'art',
  'thumbnail',
  'fanart',
  'playcount',
  'lastplayed',
  'dateadded',
] as const;

/**
 * Lighter property set for album list views
 */
export const ALBUM_LIST_PROPERTIES = [
  'title',
  'artist',
  'artistid',
  'displayartist',
  'genre',
  'year',
  'rating',
  'art',
  'thumbnail',
  'playcount',
  'dateadded',
] as const;

/**
 * Properties that can be requested for songs
 */
export const SONG_PROPERTIES = [
  'title',
  'artist',
  'artistid',
  'albumartist',
  'albumartistid',
  'displayartist',
  'album',
  'albumid',
  'genre',
  'year',
  'rating',
  'userrating',
  'votes',
  'track',
  'disc',
  'duration',
  'comment',
  'lyrics',
  'musicbrainztrackid',
  'musicbrainzartistid',
  'file',
  'genreid',
  'art',
  'thumbnail',
  'fanart',
  'playcount',
  'lastplayed',
  'dateadded',
] as const;

/**
 * Lighter property set for song list views
 */
export const SONG_LIST_PROPERTIES = [
  'title',
  'artist',
  'album',
  'albumid',
  'genre',
  'year',
  'track',
  'disc',
  'duration',
  'file',
  'art',
  'thumbnail',
  'playcount',
  'dateadded',
] as const;
