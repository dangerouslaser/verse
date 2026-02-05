import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VolumeControlProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  disabled?: boolean;
  className?: string;
}

function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
  if (muted || volume === 0) return <VolumeX className="h-4 w-4" />;
  if (volume < 33) return <Volume className="h-4 w-4" />;
  if (volume < 66) return <Volume1 className="h-4 w-4" />;
  return <Volume2 className="h-4 w-4" />;
}

export function VolumeControl({
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
  disabled = false,
  className,
}: VolumeControlProps) {
  return (
    <div className={cn('group flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onToggleMute}
        disabled={disabled}
      >
        <VolumeIcon volume={volume} muted={muted} />
        <span className="sr-only">{muted ? 'Unmute' : 'Mute'}</span>
      </Button>

      <Slider
        value={[muted ? 0 : volume]}
        max={100}
        step={1}
        onValueChange={([val]) => {
          if (val !== undefined) {
            onVolumeChange(val);
          }
        }}
        disabled={disabled}
        className="w-20"
        aria-label="Volume"
      />
    </div>
  );
}
