/**
 * PVR (Personal Video Recorder) / Live TV types
 */

import type { KodiArt, KodiResume } from './common';

/**
 * Broadcast/EPG entry from PVR.GetBroadcasts
 */
export interface KodiBroadcast {
  broadcastid: number;
  title: string;
  starttime: string;
  endtime: string;
  plot?: string;
  plotoutline?: string;
  genre?: string[];
  episodename?: string;
  episodenum?: number;
  episodepart?: number;
  hastimer?: boolean;
  hastimerrule?: boolean;
  isactive?: boolean;
  wasactive?: boolean;
  progresspercentage?: number;
  thumbnail?: string;
}

/**
 * Channel item from PVR.GetChannels
 */
export interface KodiChannel {
  channelid: number;
  channel: string;
  channelnumber: number;
  label: string;
  thumbnail?: string;
  hidden?: boolean;
  locked?: boolean;
  isrecording?: boolean;
  clientid?: number;
  broadcastnow?: KodiBroadcast;
  broadcastnext?: KodiBroadcast;
}

/**
 * Channel group from PVR.GetChannelGroups
 */
export interface KodiChannelGroup {
  channelgroupid: number;
  channeltype: 'tv' | 'radio';
  label: string;
}

/**
 * Recording item from PVR.GetRecordings
 */
export interface KodiRecording {
  recordingid: number;
  title: string;
  label: string;
  plot?: string;
  plotoutline?: string;
  genre?: string[];
  starttime: string;
  endtime: string;
  runtime?: number;
  channel?: string;
  channeluid?: number;
  directory?: string;
  file?: string;
  art?: KodiArt;
  resume?: KodiResume;
  playcount?: number;
  isdeleted?: boolean;
  radio?: boolean;
}

/**
 * Timer item from PVR.GetTimers
 */
export interface KodiTimer {
  timerid: number;
  title: string;
  summary?: string;
  channelid: number;
  starttime: string;
  endtime: string;
  state:
    | 'unknown'
    | 'scheduled'
    | 'recording'
    | 'completed'
    | 'aborted'
    | 'cancelled'
    | 'conflict_ok'
    | 'conflict_notok'
    | 'error'
    | 'disabled';
  ismanual?: boolean;
  istimerrule?: boolean;
  isreadonly?: boolean;
  isreminder?: boolean;
  priority?: number;
  lifetime?: number;
  preventduplicates?: number;
  startmargin?: number;
  endmargin?: number;
  directory?: string;
}

/**
 * PVR system properties from PVR.GetProperties
 */
export interface KodiPVRProperties {
  available?: boolean;
  recording?: boolean;
  scanning?: boolean;
}

// ── Response types ──────────────────────────────────────────

export interface GetChannelGroupsResponse {
  channelgroups?: KodiChannelGroup[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

export interface GetChannelsResponse {
  channels?: KodiChannel[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

export interface GetChannelDetailsResponse {
  channeldetails: KodiChannel;
}

export interface GetBroadcastsResponse {
  broadcasts?: KodiBroadcast[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

export interface GetRecordingsResponse {
  recordings?: KodiRecording[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

export interface GetRecordingDetailsResponse {
  recordingdetails: KodiRecording;
}

export interface GetTimersResponse {
  timers?: KodiTimer[];
  limits: {
    start: number;
    end: number;
    total: number;
  };
}

export interface GetTimerDetailsResponse {
  timerdetails: KodiTimer;
}

// ── Property constants ──────────────────────────────────────

export const CHANNEL_PROPERTIES = [
  'channel',
  'channelnumber',
  'thumbnail',
  'hidden',
  'locked',
  'isrecording',
  'clientid',
  'broadcastnow',
  'broadcastnext',
] as const;

export const RECORDING_PROPERTIES = [
  'title',
  'plot',
  'plotoutline',
  'genre',
  'starttime',
  'endtime',
  'runtime',
  'channel',
  'channeluid',
  'directory',
  'file',
  'art',
  'resume',
  'playcount',
  'isdeleted',
  'radio',
] as const;

export const TIMER_PROPERTIES = [
  'title',
  'summary',
  'channelid',
  'starttime',
  'endtime',
  'state',
  'ismanual',
  'istimerrule',
  'isreadonly',
  'isreminder',
  'priority',
  'lifetime',
] as const;

export const BROADCAST_PROPERTIES = [
  'title',
  'starttime',
  'endtime',
  'plot',
  'plotoutline',
  'genre',
  'episodename',
  'episodenum',
  'hastimer',
  'isactive',
  'wasactive',
  'progresspercentage',
  'thumbnail',
] as const;
