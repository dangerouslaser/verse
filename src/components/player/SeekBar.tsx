import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/format';

interface SeekBarProps {
  percentage: number;
  currentTime: number;
  totalTime: number;
  onSeek: (percentage: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

export function SeekBar({
  percentage,
  currentTime,
  totalTime,
  onSeek,
  disabled = false,
  size = 'default',
  className,
}: SeekBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPercentage, setHoverPercentage] = useState<number | null>(null);
  const [dragPercentage, setDragPercentage] = useState<number | null>(null);

  const getPercentageFromEvent = useCallback((clientX: number) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);
      const pct = getPercentageFromEvent(e.clientX);
      setDragPercentage(pct);

      const handleMouseMove = (ev: MouseEvent) => {
        const p = getPercentageFromEvent(ev.clientX);
        setDragPercentage(p);
      };

      const handleMouseUp = (ev: MouseEvent) => {
        const p = getPercentageFromEvent(ev.clientX);
        onSeek(p);
        setIsDragging(false);
        setDragPercentage(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [disabled, getPercentageFromEvent, onSeek]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      const pct = getPercentageFromEvent(e.clientX);
      setHoverPercentage(pct);
    },
    [disabled, getPercentageFromEvent]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverPercentage(null);
  }, []);

  const displayPercentage = dragPercentage ?? percentage;
  const hoverTime = hoverPercentage !== null ? (hoverPercentage / 100) * totalTime : null;

  const barHeight = size === 'sm' ? 'h-1 group-hover:h-2' : 'h-2';
  const thumbSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className={cn('group flex items-center gap-2', className)}>
      {size === 'default' && (
        <span className="text-muted-foreground w-12 text-right font-mono text-xs">
          {formatTime(currentTime)}
        </span>
      )}

      <div
        ref={barRef}
        className={cn(
          'relative flex-1 cursor-pointer select-none',
          disabled && 'pointer-events-none opacity-50'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayPercentage)}
        aria-label="Seek"
        tabIndex={disabled ? -1 : 0}
      >
        {/* Hover time tooltip */}
        {hoverPercentage !== null && hoverTime !== null && !isDragging && (
          <div
            className="bg-popover text-popover-foreground absolute -top-8 z-10 rounded px-2 py-0.5 text-xs shadow-md"
            style={{
              left: `${String(hoverPercentage)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        {/* Track */}
        <div
          className={cn(
            'bg-secondary relative w-full overflow-hidden rounded-full transition-all',
            barHeight
          )}
        >
          {/* Hover preview */}
          {hoverPercentage !== null && (
            <div
              className="bg-muted-foreground/20 absolute inset-y-0 left-0"
              style={{ width: `${String(hoverPercentage)}%` }}
            />
          )}

          {/* Progress fill */}
          <div
            className="bg-primary absolute inset-y-0 left-0 transition-[width]"
            style={{
              width: `${String(displayPercentage)}%`,
              transitionDuration: isDragging ? '0ms' : '150ms',
            }}
          />
        </div>

        {/* Thumb */}
        <div
          className={cn(
            'bg-primary absolute top-1/2 -translate-y-1/2 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100',
            thumbSize,
            isDragging && 'scale-110 opacity-100'
          )}
          style={{
            left: `${String(displayPercentage)}%`,
            transform: `translateX(-50%) translateY(-50%)`,
          }}
        />
      </div>

      {size === 'default' && (
        <span className="text-muted-foreground w-12 font-mono text-xs">
          {formatTime(totalTime)}
        </span>
      )}
    </div>
  );
}
