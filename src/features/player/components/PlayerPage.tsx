import { Link } from '@tanstack/react-router';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Repeat,
  Repeat1,
  Shuffle,
  ChevronDown,
} from 'lucide-react';
import {
  useActivePlayers,
  usePlayerProperties,
  usePlayerItem,
  usePlayPause,
  useStop,
  useSkipNext,
  useSkipPrevious,
  useSeek,
  useVolume,
  useSetVolume,
  useToggleMute,
  useSetRepeat,
  useSetShuffle,
  usePlaylist,
} from '@/api/hooks/usePlayback';
import { Button } from '@/components/ui/button';
import { SeekBar } from '@/components/player/SeekBar';
import { VolumeControl } from '@/components/player/VolumeControl';
import { PlaylistQueue } from './PlaylistQueue';
import { getImageUrl } from '@/lib/image-utils';
import { timeToSeconds, formatEpisodeNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function RepeatIcon({ mode }: { mode: 'off' | 'one' | 'all' }) {
  if (mode === 'one') return <Repeat1 className="h-4 w-4" />;
  return <Repeat className="h-4 w-4" />;
}

export function PlayerPage() {
  const { data: players } = useActivePlayers();
  const activePlayer = players?.[0];
  const { data: playerProps } = usePlayerProperties(activePlayer?.playerid);
  const { data: playerItemData } = usePlayerItem(activePlayer?.playerid);
  const { data: volumeData } = useVolume();
  const { data: playlistItems } = usePlaylist(playerProps?.playlistid);

  const playPauseMutation = usePlayPause();
  const stopMutation = useStop();
  const skipNextMutation = useSkipNext();
  const skipPrevMutation = useSkipPrevious();
  const seekMutation = useSeek();
  const setVolumeMutation = useSetVolume();
  const toggleMuteMutation = useToggleMute();
  const setRepeatMutation = useSetRepeat();
  const setShuffleMutation = useSetShuffle();

  if (!activePlayer || !playerProps) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Nothing is playing</p>
        <Button variant="outline" asChild>
          <Link to="/movies">Browse Library</Link>
        </Button>
      </div>
    );
  }

  const isPlaying = (playerProps.speed ?? 0) > 0;
  const percentage = playerProps.percentage ?? 0;
  const currentTime = timeToSeconds(playerProps.time);
  const totalTime = timeToSeconds(playerProps.totaltime);
  const repeatMode = playerProps.repeat ?? 'off';
  const isShuffled = playerProps.shuffled ?? false;

  const item = playerItemData?.item;
  const artworkUrl = item?.art?.poster
    ? getImageUrl(item.art.poster)
    : item?.art?.thumb
      ? getImageUrl(item.art.thumb)
      : item?.thumbnail
        ? getImageUrl(item.thumbnail)
        : undefined;

  const fanartUrl = item?.art?.fanart ? getImageUrl(item.art.fanart) : undefined;

  let title = item?.title ?? item?.label ?? 'Unknown';
  let subtitle = '';
  let detailLink: string | undefined;

  if (item?.type === 'episode' && item.showtitle) {
    const epNum =
      item.season !== undefined && item.episode !== undefined
        ? formatEpisodeNumber(item.season, item.episode)
        : '';
    subtitle = `${item.showtitle}${epNum ? ` - ${epNum}` : ''}`;
    detailLink = `/tv/${String(item.id)}`;
  } else if (item?.type === 'movie') {
    subtitle = item.year ? `Movie (${String(item.year)})` : 'Movie';
    detailLink = `/movies/${String(item.id)}`;
  } else {
    title = item?.title ?? item?.label ?? 'Playing';
    subtitle = activePlayer.type;
  }

  const onError = (action: string) => (error: Error) => {
    toast.error('Error', { description: error.message || `Failed to ${action}` });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Background fanart */}
      {fanartUrl && (
        <div className="fixed inset-0 -z-10">
          <img src={fanartUrl} alt="" className="h-full w-full object-cover opacity-20 blur-2xl" />
          <div className="from-background to-background/80 absolute inset-0 bg-gradient-to-b" />
        </div>
      )}

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link to="/">
              <ChevronDown className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Left: Artwork */}
          <div className="flex items-start justify-center">
            {artworkUrl ? (
              <img src={artworkUrl} alt={title} className="w-full max-w-sm rounded-lg shadow-2xl" />
            ) : (
              <div className="bg-muted flex aspect-[2/3] w-full max-w-sm items-center justify-center rounded-lg">
                <Play className="text-muted-foreground h-16 w-16" />
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && <p className="text-muted-foreground mt-1 text-lg">{subtitle}</p>}
              {detailLink && (
                <Link
                  to={detailLink}
                  className="text-primary mt-2 inline-block text-sm hover:underline"
                >
                  View details
                </Link>
              )}
            </div>

            {/* Seek bar */}
            <SeekBar
              percentage={percentage}
              currentTime={currentTime}
              totalTime={totalTime}
              onSeek={(pct) => {
                seekMutation.mutate(
                  { playerId: activePlayer.playerid, value: pct },
                  { onError: onError('seek') }
                );
              }}
              disabled={!playerProps.canseek}
              size="default"
            />

            {/* Transport controls */}
            <div className="flex items-center justify-center gap-2">
              {/* Shuffle */}
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-9 w-9', isShuffled && 'text-primary')}
                onClick={() => {
                  setShuffleMutation.mutate(activePlayer.playerid);
                }}
                disabled={!playerProps.canshuffle || setShuffleMutation.isPending}
              >
                <Shuffle className="h-4 w-4" />
                <span className="sr-only">Shuffle</span>
              </Button>

              {/* Previous */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => {
                  skipPrevMutation.mutate(activePlayer.playerid, {
                    onError: onError('skip'),
                  });
                }}
                disabled={skipPrevMutation.isPending}
              >
                <SkipBack className="h-5 w-5" />
                <span className="sr-only">Previous</span>
              </Button>

              {/* Play/Pause */}
              <Button
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={() => {
                  playPauseMutation.mutate(activePlayer.playerid, {
                    onError: onError('toggle playback'),
                  });
                }}
                disabled={playPauseMutation.isPending}
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7" />
                ) : (
                  <Play className="h-7 w-7" fill="currentColor" />
                )}
                <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>

              {/* Next */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => {
                  skipNextMutation.mutate(activePlayer.playerid, {
                    onError: onError('skip'),
                  });
                }}
                disabled={skipNextMutation.isPending}
              >
                <SkipForward className="h-5 w-5" />
                <span className="sr-only">Next</span>
              </Button>

              {/* Repeat */}
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-9 w-9', repeatMode !== 'off' && 'text-primary')}
                onClick={() => {
                  setRepeatMutation.mutate(activePlayer.playerid);
                }}
                disabled={!playerProps.canrepeat || setRepeatMutation.isPending}
              >
                <RepeatIcon mode={repeatMode} />
                <span className="sr-only">Repeat: {repeatMode}</span>
              </Button>
            </div>

            {/* Volume + Stop */}
            <div className="flex items-center justify-between">
              <VolumeControl
                volume={volumeData?.volume ?? 100}
                muted={volumeData?.muted ?? false}
                onVolumeChange={(vol) => {
                  setVolumeMutation.mutate(vol);
                }}
                onToggleMute={() => {
                  toggleMuteMutation.mutate();
                }}
              />

              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  stopMutation.mutate(activePlayer.playerid, {
                    onError: onError('stop playback'),
                  });
                }}
                disabled={stopMutation.isPending}
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </Button>
            </div>

            {/* Stream info */}
            {playerProps.currentvideostream && (
              <div className="text-muted-foreground space-y-1 text-xs">
                <p>
                  {playerProps.currentvideostream.codec.toUpperCase()}{' '}
                  {playerProps.currentvideostream.width}x{playerProps.currentvideostream.height}
                </p>
                {playerProps.currentaudiostream && (
                  <p>
                    {playerProps.currentaudiostream.codec.toUpperCase()}{' '}
                    {playerProps.currentaudiostream.channels}ch
                    {playerProps.currentaudiostream.language
                      ? ` (${playerProps.currentaudiostream.language})`
                      : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Playlist queue */}
        {playlistItems && playlistItems.length > 0 && (
          <div className="mt-12">
            <PlaylistQueue
              items={playlistItems}
              playlistId={playerProps.playlistid ?? 0}
              playerId={activePlayer.playerid}
              currentPosition={playerProps.position ?? -1}
            />
          </div>
        )}
      </div>
    </div>
  );
}
