/**
 * Player and playback types
 */

/**
 * Player type
 */
export type PlayerType = 'video' | 'audio' | 'picture';

/**
 * Player speed
 */
export type PlayerSpeed = -32 | -16 | -8 | -4 | -2 | -1 | 0 | 1 | 2 | 4 | 8 | 16 | 32;

/**
 * Player state
 */
export interface PlayerState {
  playerid: number;
  speed: PlayerSpeed;
  type: PlayerType;
  percentage?: number;
  position?: number;
  time?: {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
  };
  totaltime?: {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
  };
}

/**
 * Item to play
 */
export interface PlayableItem {
  movieid?: number;
  episodeid?: number;
  tvshowid?: number;
  seasonid?: number;
  file?: string;
}

/**
 * Play options
 */
export interface PlayOptions {
  item: PlayableItem;
  options?: {
    resume?: boolean;
    shuffled?: boolean;
    repeat?: 'off' | 'one' | 'all';
  };
}

/**
 * Response from Player.GetActivePlayers
 */
export interface GetActivePlayersResponse {
  playerid: number;
  playertype: string;
  type: PlayerType;
}

/**
 * Response from Player.GetProperties
 */
export interface GetPlayerPropertiesResponse {
  audiostreams?: Array<{
    index: number;
    language: string;
    name: string;
    codec: string;
    bitrate: number;
    channels: number;
  }>;
  canchangespeed?: boolean;
  canmove?: boolean;
  canrepeat?: boolean;
  canrotate?: boolean;
  canseek?: boolean;
  canshuffle?: boolean;
  canzoom?: boolean;
  currentaudiostream?: {
    index: number;
    language: string;
    name: string;
    codec: string;
    bitrate: number;
    channels: number;
  };
  currentsubtitle?: {
    index: number;
    language: string;
    name: string;
  };
  currentvideostream?: {
    index: number;
    language: string;
    name: string;
    codec: string;
    width: number;
    height: number;
  };
  live?: boolean;
  partymode?: boolean;
  percentage?: number;
  playlistid?: number;
  position?: number;
  repeat?: 'off' | 'one' | 'all';
  shuffled?: boolean;
  speed?: PlayerSpeed;
  subtitleenabled?: boolean;
  subtitles?: Array<{
    index: number;
    language: string;
    name: string;
  }>;
  time?: {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
  };
  totaltime?: {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
  };
  type?: PlayerType;
  videostreams?: Array<{
    index: number;
    language: string;
    name: string;
    codec: string;
    width: number;
    height: number;
  }>;
}

/**
 * Response from Player.GetItem
 */
export interface GetPlayerItemResponse {
  item: {
    id: number;
    type: 'movie' | 'episode' | 'musicvideo' | 'song' | 'picture' | 'channel';
    label: string;
    title?: string;
    album?: string;
    artist?: string[];
    season?: number;
    episode?: number;
    showtitle?: string;
    year?: number;
    duration?: number;
    file?: string;
    thumbnail?: string;
    art?: {
      poster?: string;
      fanart?: string;
      thumb?: string;
      clearlogo?: string;
      [key: string]: string | undefined;
    };
  };
}

/**
 * Seek target
 */
export type SeekTarget =
  | { percentage: number }
  | { time: { hours: number; minutes: number; seconds: number; milliseconds?: number } }
  | { seconds: number }
  | 'smallforward'
  | 'smallbackward'
  | 'bigforward'
  | 'bigbackward';

/**
 * Playback properties for Player.Open
 */
export const PLAYER_PROPERTIES = [
  'audiostreams',
  'canchangespeed',
  'canmove',
  'canrepeat',
  'canrotate',
  'canseek',
  'canshuffle',
  'canzoom',
  'currentaudiostream',
  'currentsubtitle',
  'currentvideostream',
  'live',
  'partymode',
  'percentage',
  'playlistid',
  'position',
  'repeat',
  'shuffled',
  'speed',
  'subtitleenabled',
  'subtitles',
  'time',
  'totaltime',
  'type',
  'videostreams',
] as const;
