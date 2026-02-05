import { formatEpisodeNumber } from '@/lib/format';

/**
 * Formats a player item into a display title and subtitle.
 */
export function getItemTitle(item: {
  type: string;
  title?: string;
  label: string;
  showtitle?: string;
  season?: number;
  episode?: number;
  year?: number;
}): { title: string; subtitle: string } {
  if (item.type === 'episode' && item.showtitle) {
    const epNum =
      item.season !== undefined && item.episode !== undefined
        ? formatEpisodeNumber(item.season, item.episode)
        : '';
    return {
      title: item.title ?? item.label,
      subtitle: `${item.showtitle}${epNum ? ` - ${epNum}` : ''}`,
    };
  }
  if (item.type === 'movie') {
    const yearStr = item.year ? ` (${String(item.year)})` : '';
    return {
      title: item.title ?? item.label,
      subtitle: `Movie${yearStr}`,
    };
  }
  return {
    title: item.title ?? item.label,
    subtitle: item.type,
  };
}

/**
 * Returns a detail route link for a player item, or undefined if no link is available.
 */
export function getItemDetailLink(item: {
  id: number;
  type: string;
  tvshowid?: number;
  season?: number;
}): string | undefined {
  if (item.type === 'movie') {
    return `/movies/${String(item.id)}`;
  }
  if (item.type === 'episode' && item.tvshowid && item.season !== undefined) {
    return `/tv/${String(item.tvshowid)}/${String(item.season)}/${String(item.id)}`;
  }
  return undefined;
}
