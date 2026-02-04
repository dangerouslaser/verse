import {
  useActivePlayers,
  usePlayerProperties,
  usePlayPause,
  useStop,
} from '@/api/hooks/usePlayback';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, X } from 'lucide-react';
import { toast } from 'sonner';

export function NowPlaying() {
  const { data: players } = useActivePlayers();
  const activePlayer = players?.[0];
  const { data: playerProps } = usePlayerProperties(activePlayer?.playerid);

  const playPauseMutation = usePlayPause();
  const stopMutation = useStop();

  if (!activePlayer || !playerProps) {
    return null;
  }

  const isPlaying = playerProps.speed === 1;
  const percentage = playerProps.percentage || 0;

  const handlePlayPause = () => {
    playPauseMutation.mutate(activePlayer.playerid, {
      onError: (error) => {
        toast.error('Error', {
          description: error instanceof Error ? error.message : 'Failed to toggle playback',
        });
      },
    });
  };

  const handleStop = () => {
    stopMutation.mutate(activePlayer.playerid, {
      onError: (error) => {
        toast.error('Error', {
          description: error instanceof Error ? error.message : 'Failed to stop playback',
        });
      },
    });
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${String(hours)}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes)}:${String(secs).padStart(2, '0')}`;
  };

  const currentTime = playerProps.time
    ? playerProps.time.hours * 3600 + playerProps.time.minutes * 60 + playerProps.time.seconds
    : 0;

  const totalTime = playerProps.totaltime
    ? playerProps.totaltime.hours * 3600 +
      playerProps.totaltime.minutes * 60 +
      playerProps.totaltime.seconds
    : 0;

  return (
    <Card className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Play/Pause and Stop controls */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
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
              onClick={handleStop}
              disabled={stopMutation.isPending}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Stop</span>
            </Button>
          </div>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {activePlayer.type === 'video' ? 'Playing Video' : 'Playing Audio'}
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">
              {formatTime(currentTime)} / {formatTime(totalTime)}
            </span>
            <div className="bg-secondary h-2 w-32 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${String(percentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
