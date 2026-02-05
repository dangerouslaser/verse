import { useMemo } from 'react';
import type { KodiSong } from '@/api/types/audio';
import { SongRow } from './SongRow';

interface TrackListProps {
  songs: KodiSong[];
  onPlaySong?: (songId: number) => void;
}

export function TrackList({ songs, onPlaySong }: TrackListProps) {
  // Group songs by disc if multi-disc
  const songsByDisc = useMemo(() => {
    const hasMultipleDiscs = songs.some((song) => song.disc && song.disc > 1);

    if (!hasMultipleDiscs) {
      // Single disc - sort by track
      const sorted = [...songs].sort((a, b) => (a.track || 0) - (b.track || 0));
      return [{ disc: 1, songs: sorted }];
    }

    // Multiple discs - group and sort
    const groups = new Map<number, KodiSong[]>();
    songs.forEach((song) => {
      const disc = song.disc || 1;
      const existing = groups.get(disc) || [];
      groups.set(disc, [...existing, song]);
    });

    // Sort songs within each disc by track number
    const result = Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
      .map(([disc, discSongs]) => ({
        disc,
        songs: discSongs.sort((a, b) => (a.track || 0) - (b.track || 0)),
      }));

    return result;
  }, [songs]);

  const hasMultipleDiscs = songsByDisc.length > 1;

  return (
    <div className="space-y-4">
      {songsByDisc.map(({ disc, songs: discSongs }) => (
        <div key={disc}>
          {hasMultipleDiscs && (
            <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">
              Disc {String(disc)}
            </h3>
          )}
          <div className="space-y-0.5">
            {discSongs.map((song) => (
              <SongRow
                key={song.songid}
                song={song}
                onPlay={
                  onPlaySong
                    ? () => {
                        onPlaySong(song.songid);
                      }
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
