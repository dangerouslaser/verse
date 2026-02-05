/**
 * Utilities for formatting data (runtime, dates, ratings, etc.)
 */

/**
 * Format runtime in seconds to human-readable string
 * @param runtime Runtime in seconds
 * @returns Formatted string like "2h 15m" or "45m"
 */
export function formatRuntime(runtime?: number): string {
  if (!runtime || runtime <= 0) {
    return '';
  }

  // Convert seconds to minutes
  const totalMinutes = Math.floor(runtime / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${String(minutes)}m`;
  }

  if (minutes === 0) {
    return `${String(hours)}h`;
  }

  return `${String(hours)}h ${String(minutes)}m`;
}

/**
 * Format a date string to localized format
 * @param dateString ISO date string or Kodi date format
 * @returns Formatted date like "Jan 15, 2024"
 */
export function formatDate(dateString?: string): string {
  if (!dateString) {
    return '';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Format a year from date string
 * @param dateString ISO date string or year
 * @returns Year as string
 */
export function formatYear(dateString?: string | number): string {
  if (!dateString) {
    return '';
  }

  // If it's already a year number
  if (typeof dateString === 'number') {
    return dateString.toString();
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.getFullYear().toString();
  } catch {
    return '';
  }
}

/**
 * Format rating to fixed decimal places
 * @param rating Rating value (usually 0-10)
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted rating like "8.5"
 */
export function formatRating(rating?: number, decimals: number = 1): string {
  if (rating === undefined) {
    return '';
  }

  return rating.toFixed(decimals);
}

/**
 * Format percentage
 * @param value Percentage value (0-100)
 * @returns Formatted percentage like "75%"
 */
export function formatPercentage(value?: number): string {
  if (value === undefined) {
    return '';
  }

  return `${String(Math.round(value))}%`;
}

/**
 * Format file size in bytes to human-readable string
 * @param bytes File size in bytes
 * @returns Formatted string like "1.5 GB"
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) {
    return '';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${String(units[unitIndex])}`;
}

/**
 * Format time object from Kodi to seconds
 * @param time Kodi time object
 * @returns Total seconds
 */
export function timeToSeconds(time?: {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds?: number;
}): number {
  if (!time) {
    return 0;
  }

  return time.hours * 3600 + time.minutes * 60 + time.seconds;
}

/**
 * Format seconds to time string
 * @param seconds Total seconds
 * @returns Formatted time like "1:23:45" or "23:45"
 */
export function formatTime(seconds?: number): string {
  if (!seconds || seconds <= 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${String(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

  return `${String(minutes)}:${pad(secs)}`;
}

/**
 * Join array of strings with proper separators
 * @param items Array of strings
 * @param separator Separator string (default: ", ")
 * @returns Joined string
 */
export function joinArray(items?: string[], separator: string = ', '): string {
  if (!items || items.length === 0) {
    return '';
  }

  return items.join(separator);
}

/**
 * Pluralize a word based on count
 * @param count Number to check
 * @param singular Singular form
 * @param plural Plural form (optional, defaults to singular + 's')
 * @returns Pluralized string with count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return `${String(count)} ${word}`;
}

/**
 * Truncate text to a maximum length
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @param ellipsis Ellipsis string (default: "...")
 * @returns Truncated text
 */
export function truncate(text?: string, maxLength: number = 100, ellipsis: string = '...'): string {
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Format episode number as S##E## format
 * @param season Season number
 * @param episode Episode number
 * @returns Formatted string like "S01E05"
 */
export function formatEpisodeNumber(season: number, episode: number): string {
  return `S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`;
}

/**
 * Format track number with zero-padding
 * @param track Track number
 * @returns Formatted string like "01"
 */
export function formatTrackNumber(track?: number): string {
  if (!track) return '';
  return track.toString().padStart(2, '0');
}

/**
 * Format disc and track for multi-disc albums
 * @param disc Disc number
 * @param track Track number
 * @returns Formatted string like "1-01" or "01"
 */
export function formatDiscTrack(disc?: number, track?: number): string {
  if (!track) return '';
  if (disc && disc > 1) {
    return `${String(disc)}-${track.toString().padStart(2, '0')}`;
  }
  return track.toString().padStart(2, '0');
}

/**
 * Format duration in seconds for songs (alias of formatTime)
 * @param seconds Duration in seconds
 * @returns Formatted string like "3:45" or "1:23:45"
 */
export function formatDuration(seconds?: number): string {
  return formatTime(seconds);
}
