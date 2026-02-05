import { create } from 'zustand';
import type { GetPlayerItemResponse } from '@/api/types/player';

interface PlayerTime {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds?: number;
}

interface PlayerItem {
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
}

interface PlaylistItem {
  id: number;
  type: string;
  label: string;
  title?: string;
  artist?: string[];
  album?: string;
  duration?: number;
  file?: string;
  thumbnail?: string;
}

interface PlayerState {
  // Connection
  playerId: number | undefined;
  playerType: 'video' | 'audio' | 'picture' | undefined;

  // Current item
  currentItem: PlayerItem | null;

  // Playback state
  isPlaying: boolean;
  speed: number;
  percentage: number;
  time: PlayerTime | null;
  totaltime: PlayerTime | null;

  // Playback options
  repeat: 'off' | 'one' | 'all';
  shuffled: boolean;
  canSeek: boolean;
  canRepeat: boolean;
  canShuffle: boolean;

  // Volume
  volume: number;
  muted: boolean;

  // Playlist
  playlistId: number;
  playlistPosition: number;
  playlist: PlaylistItem[];

  // Actions
  setPlayer: (playerId: number | undefined, playerType?: 'video' | 'audio' | 'picture') => void;
  setCurrentItem: (item: GetPlayerItemResponse['item'] | null) => void;
  syncPlaybackState: (state: {
    speed?: number;
    percentage?: number;
    time?: PlayerTime;
    totaltime?: PlayerTime;
    repeat?: 'off' | 'one' | 'all';
    shuffled?: boolean;
    canseek?: boolean;
    canrepeat?: boolean;
    canshuffle?: boolean;
    playlistid?: number;
    position?: number;
  }) => void;
  setVolume: (volume: number, muted: boolean) => void;
  setPlaylist: (items: PlaylistItem[]) => void;
  reset: () => void;
}

const initialState = {
  playerId: undefined as number | undefined,
  playerType: undefined as 'video' | 'audio' | 'picture' | undefined,
  currentItem: null as PlayerItem | null,
  isPlaying: false,
  speed: 0,
  percentage: 0,
  time: null as PlayerTime | null,
  totaltime: null as PlayerTime | null,
  repeat: 'off' as const,
  shuffled: false,
  canSeek: false,
  canRepeat: false,
  canShuffle: false,
  volume: 100,
  muted: false,
  playlistId: 0,
  playlistPosition: -1,
  playlist: [] as PlaylistItem[],
};

export const usePlayerStore = create<PlayerState>()((set) => ({
  ...initialState,

  setPlayer: (playerId, playerType) => {
    set({
      playerId,
      playerType,
      ...(playerId === undefined ? initialState : {}),
    });
  },

  setCurrentItem: (item) => {
    set({
      currentItem: item
        ? {
            id: item.id,
            type: item.type,
            label: item.label,
            title: item.title,
            album: item.album,
            artist: item.artist,
            season: item.season,
            episode: item.episode,
            showtitle: item.showtitle,
            year: item.year,
            duration: item.duration,
            file: item.file,
          }
        : null,
    });
  },

  syncPlaybackState: (state) => {
    set({
      speed: state.speed ?? 0,
      isPlaying: (state.speed ?? 0) > 0,
      percentage: state.percentage ?? 0,
      time: state.time ?? null,
      totaltime: state.totaltime ?? null,
      repeat: state.repeat ?? 'off',
      shuffled: state.shuffled ?? false,
      canSeek: state.canseek ?? false,
      canRepeat: state.canrepeat ?? false,
      canShuffle: state.canshuffle ?? false,
      playlistId: state.playlistid ?? 0,
      playlistPosition: state.position ?? -1,
    });
  },

  setVolume: (volume, muted) => {
    set({ volume, muted });
  },

  setPlaylist: (items) => {
    set({ playlist: items });
  },

  reset: () => {
    set(initialState);
  },
}));
