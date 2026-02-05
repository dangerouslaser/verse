import { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Play, Pause, SkipBack, SkipForward, Square, Maximize2 } from 'lucide-react';
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
} from '@/api/hooks/usePlayback';
import { usePlayerStore } from '@/stores/player';
import { Button } from '@/components/ui/button';
import { SeekBar } from './SeekBar';
import { VolumeControl } from './VolumeControl';
import { getImageUrl } from '@/lib/image-utils';
import { timeToSeconds, formatTime, formatEpisodeNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function getItemTitle(item: {
  type: string;
  title?: string;
  label: string;
  showtitle?: string;
  season?: number;
  episode?: number;
}) {
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
  return {
    title: item.title ?? item.label,
    subtitle: item.type === 'movie' ? 'Movie' : item.type,
  };
}

export function NowPlaying() {
  const { data: players } = useActivePlayers();
  const activePlayer = players?.[0];
  const { data: playerProps } = usePlayerProperties(activePlayer?.playerid);
  const { data: playerItemData } = usePlayerItem(activePlayer?.playerid);
  const { data: volumeData } = useVolume();

  const playPauseMutation = usePlayPause();
  const stopMutation = useStop();
  const skipNextMutation = useSkipNext();
  const skipPrevMutation = useSkipPrevious();
  const seekMutation = useSeek();
  const setVolumeMutation = useSetVolume();
  const toggleMuteMutation = useToggleMute();

  const { setPlayer, setCurrentItem, syncPlaybackState, setVolume } = usePlayerStore();

  // Sync player state to store
  useEffect(() => {
    if (activePlayer) {
      setPlayer(activePlayer.playerid, activePlayer.type);
    } else {
      setPlayer(undefined);
    }
  }, [activePlayer, setPlayer]);

  useEffect(() => {
    if (playerProps) {
      syncPlaybackState(playerProps);
    }
  }, [playerProps, syncPlaybackState]);

  useEffect(() => {
    if (playerItemData?.item) {
      setCurrentItem(playerItemData.item);
    }
  }, [playerItemData, setCurrentItem]);

  useEffect(() => {
    if (volumeData) {
      setVolume(volumeData.volume, volumeData.muted);
    }
  }, [volumeData, setVolume]);

  if (!activePlayer || !playerProps) {
    return null;
  }

  const isPlaying = (playerProps.speed ?? 0) > 0;
  const percentage = playerProps.percentage ?? 0;
  const currentTime = timeToSeconds(playerProps.time);
  const totalTime = timeToSeconds(playerProps.totaltime);

  const item = playerItemData?.item;
  const thumbnailUrl = item?.art?.thumb
    ? getImageUrl(item.art.thumb)
    : item?.thumbnail
      ? getImageUrl(item.thumbnail)
      : undefined;

  const { title, subtitle } = item
    ? getItemTitle(item)
    : { title: 'Playing', subtitle: activePlayer.type };

  const onError = (action: string) => (error: Error) => {
    toast.error('Error', {
      description: error.message || `Failed to ${action}`,
    });
  };

  const handlePlayPause = () => {
    playPauseMutation.mutate(activePlayer.playerid, { onError: onError('toggle playback') });
  };

  const handleStop = () => {
    stopMutation.mutate(activePlayer.playerid, { onError: onError('stop playback') });
  };

  const handleNext = () => {
    skipNextMutation.mutate(activePlayer.playerid, { onError: onError('skip') });
  };

  const handlePrevious = () => {
    skipPrevMutation.mutate(activePlayer.playerid, { onError: onError('skip') });
  };

  const handleSeek = (pct: number) => {
    seekMutation.mutate(
      { playerId: activePlayer.playerid, value: pct },
      { onError: onError('seek') }
    );
  };

  const handleVolumeChange = (vol: number) => {
    setVolumeMutation.mutate(vol);
  };

  const handleToggleMute = () => {
    toggleMuteMutation.mutate();
  };

  return (
    <div className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur">
      {/* Thin seek bar on top of the footer */}
      <div className="px-0">
        <SeekBar
          percentage={percentage}
          currentTime={currentTime}
          totalTime={totalTime}
          onSeek={handleSeek}
          disabled={!playerProps.canseek}
          size="sm"
        />
      </div>

      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Artwork + Title */}
          <Link to="/player" className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt={title}
                className="h-10 w-10 flex-shrink-0 rounded object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{title}</p>
              <p className="text-muted-foreground truncate text-xs">{subtitle}</p>
            </div>
          </Link>

          {/* Transport controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePrevious}
              disabled={skipPrevMutation.isPending}
            >
              <SkipBack className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn('h-9 w-9')}
              onClick={handlePlayPause}
              disabled={playPauseMutation.isPending}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" fill="currentColor" />
              )}
              <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleNext}
              disabled={skipNextMutation.isPending}
            >
              <SkipForward className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleStop}
              disabled={stopMutation.isPending}
            >
              <Square className="h-3.5 w-3.5" />
              <span className="sr-only">Stop</span>
            </Button>
          </div>

          {/* Time */}
          <span className="text-muted-foreground hidden font-mono text-xs whitespace-nowrap md:inline">
            {formatTime(currentTime)} / {formatTime(totalTime)}
          </span>

          {/* Volume */}
          <div className="hidden md:flex">
            <VolumeControl
              volume={volumeData?.volume ?? 100}
              muted={volumeData?.muted ?? false}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
            />
          </div>

          {/* Expand to full player */}
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to="/player">
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Full Player</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
