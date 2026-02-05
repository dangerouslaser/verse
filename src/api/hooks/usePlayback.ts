/**
 * Barrel re-export for all playback-related hooks.
 *
 * Individual modules:
 *   usePlayer.ts   – player control (play, pause, stop, seek, skip, repeat, shuffle)
 *   useVolume.ts   – volume and mute
 *   usePlaylist.ts – playlist CRUD
 *   useWatched.ts  – watched status mutations
 */
export {
  usePlay,
  useActivePlayers,
  usePlayerProperties,
  usePlayerItem,
  usePlayPause,
  useStop,
  useSeek,
  useSkipNext,
  useSkipPrevious,
  useSetRepeat,
  useSetShuffle,
  usePlayEpisode,
} from './usePlayer';

export { useVolume, useSetVolume, useToggleMute } from './useVolume';

export {
  usePlaylist,
  useRemoveFromPlaylist,
  useClearPlaylist,
  useGoToPlaylistPosition,
} from './usePlaylist';

export { useSetMovieWatched, useSetEpisodeWatched } from './useWatched';

export { usePlaySong, usePlayAlbum, usePlayArtist, useAddToPlaylist } from './useMusicPlayback';
