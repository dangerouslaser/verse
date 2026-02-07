import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useChannels } from '@/api/hooks/usePVR';
import { useBroadcasts } from '@/api/hooks/useEPG';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import type { KodiChannel, KodiBroadcast } from '@/api/types/pvr';

const HOUR_WIDTH = 360; // pixels per hour
const CHANNEL_ROW_HEIGHT = 64; // pixels per channel row
const CHANNEL_LABEL_WIDTH = 180; // left sidebar width
const VISIBLE_HOURS = 3; // hours to show at once

function EPGChannelRow({
  channel,
  broadcasts,
  startTime,
  endTime,
}: {
  channel: KodiChannel;
  broadcasts: KodiBroadcast[];
  startTime: Date;
  endTime: Date;
}) {
  const thumbnailUrl = getImageUrl(channel.thumbnail);
  const timeRangeMs = endTime.getTime() - startTime.getTime();

  return (
    <div className="flex" style={{ height: CHANNEL_ROW_HEIGHT }}>
      {/* Channel label */}
      <div
        className="bg-background sticky left-0 z-10 flex shrink-0 items-center gap-2 border-r border-b px-3"
        style={{ width: CHANNEL_LABEL_WIDTH }}
      >
        <Link
          to="/live-tv/$channelId"
          params={{ channelId: channel.channelid.toString() }}
          className="flex min-w-0 items-center gap-2 hover:opacity-80"
        >
          <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="" className="h-full w-full object-contain p-0.5" />
            ) : (
              <Tv className="text-muted-foreground h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{channel.label}</p>
            <p className="text-muted-foreground text-xs">{channel.channelnumber}</p>
          </div>
        </Link>
      </div>

      {/* Programs */}
      <div
        className="relative flex-1 border-b"
        style={{ width: (timeRangeMs / 3600000) * HOUR_WIDTH }}
      >
        {broadcasts.map((broadcast) => {
          const bStart = new Date(broadcast.starttime);
          const bEnd = new Date(broadcast.endtime);

          // Clamp to visible range
          const visStart = Math.max(bStart.getTime(), startTime.getTime());
          const visEnd = Math.min(bEnd.getTime(), endTime.getTime());

          if (visEnd <= visStart) return null;

          const left = ((visStart - startTime.getTime()) / timeRangeMs) * 100;
          const width = ((visEnd - visStart) / timeRangeMs) * 100;

          return (
            <div
              key={broadcast.broadcastid}
              className={cn(
                'absolute top-1 bottom-1 overflow-hidden rounded border px-2 py-1 text-xs',
                broadcast.isactive
                  ? 'bg-primary/15 border-primary/40'
                  : 'bg-muted/50 border-border hover:bg-muted'
              )}
              style={{ left: `${String(left)}%`, width: `${String(width)}%` }}
              title={`${broadcast.title}\n${broadcast.plot ?? ''}`}
            >
              <p className="truncate font-medium">{broadcast.title}</p>
              {broadcast.genre && broadcast.genre.length > 0 && (
                <p className="text-muted-foreground truncate">{broadcast.genre[0]}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EPGChannelWithBroadcasts({
  channel,
  startTime,
  endTime,
}: {
  channel: KodiChannel;
  startTime: Date;
  endTime: Date;
}) {
  const { data: broadcasts = [] } = useBroadcasts({ channelid: channel.channelid });

  // Filter broadcasts that overlap with the visible time range
  const visibleBroadcasts = broadcasts.filter((b) => {
    const bStart = new Date(b.starttime);
    const bEnd = new Date(b.endtime);
    return bEnd > startTime && bStart < endTime;
  });

  return (
    <EPGChannelRow
      channel={channel}
      broadcasts={visibleBroadcasts}
      startTime={startTime}
      endTime={endTime}
    />
  );
}

function TimeHeader({ startTime, endTime }: { startTime: Date; endTime: Date }) {
  const hours: Date[] = [];
  const current = new Date(startTime);
  while (current < endTime) {
    hours.push(new Date(current));
    current.setMinutes(current.getMinutes() + 30);
  }

  const timeRangeMs = endTime.getTime() - startTime.getTime();

  return (
    <div className="bg-background sticky top-0 z-20 flex border-b">
      <div
        className="bg-background sticky left-0 z-30 shrink-0 border-r"
        style={{ width: CHANNEL_LABEL_WIDTH }}
      />
      <div
        className="relative flex-1"
        style={{ width: (timeRangeMs / 3600000) * HOUR_WIDTH, height: 32 }}
      >
        {hours.map((time, i) => {
          const left = ((time.getTime() - startTime.getTime()) / timeRangeMs) * 100;
          const isHour = time.getMinutes() === 0;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 flex items-center border-l px-2"
              style={{ left: `${String(left)}%` }}
            >
              <span
                className={cn(
                  'text-xs',
                  isHour ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EPGGrid() {
  const { data: channels, isLoading, isError, error } = useChannels({ channelgroupid: 'alltv' });
  const containerRef = useRef<HTMLDivElement>(null);

  const { setItems } = useBreadcrumbs();

  useEffect(() => {
    setItems([{ label: 'Live TV', href: '/live-tv' }, { label: 'Guide' }]);
  }, [setItems]);

  // Start time rounded down to nearest 30 min
  const [baseTime, setBaseTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() < 30 ? 0 : 30, 0, 0);
    return now;
  });

  const startTime = baseTime;
  const endTime = useMemo(() => {
    const end = new Date(startTime);
    end.setHours(end.getHours() + VISIBLE_HOURS);
    return end;
  }, [startTime]);

  const handlePrev = () => {
    setBaseTime((prev) => {
      const next = new Date(prev);
      next.setHours(next.getHours() - VISIBLE_HOURS);
      return next;
    });
  };

  const handleNext = () => {
    setBaseTime((prev) => {
      const next = new Date(prev);
      next.setHours(next.getHours() + VISIBLE_HOURS);
      return next;
    });
  };

  const handleNow = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() < 30 ? 0 : 30, 0, 0);
    setBaseTime(now);
  };

  if (isLoading) {
    return (
      <div className="container space-y-4 py-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container space-y-4 py-6">
        <ErrorState title="Error loading guide" error={error} />
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="container space-y-4 py-6">
        <EmptyState title="No channels" description="No PVR channels are available." />
      </div>
    );
  }

  return (
    <div className="container space-y-4 py-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleNow}>
          Now
        </Button>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-muted-foreground text-sm">
          {startTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* EPG Grid */}
      <div
        ref={containerRef}
        className="overflow-auto rounded-lg border"
        style={{ maxHeight: '70vh' }}
      >
        <TimeHeader startTime={startTime} endTime={endTime} />
        {channels.map((channel) => (
          <EPGChannelWithBroadcasts
            key={channel.channelid}
            channel={channel}
            startTime={startTime}
            endTime={endTime}
          />
        ))}
      </div>
    </div>
  );
}
