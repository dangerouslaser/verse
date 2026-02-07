import { useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { Clock, Play, Radio, Tv } from 'lucide-react';
import { useChannelDetails, useBroadcasts, usePlayChannel, useRecord } from '@/api/hooks/usePVR';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getImageUrl } from '@/lib/image-utils';
import { formatBroadcastTime } from '@/lib/format';
import type { KodiBroadcast } from '@/api/types/pvr';

function BroadcastRow({ broadcast }: { broadcast: KodiBroadcast }) {
  const timeStr = formatBroadcastTime(broadcast.starttime, broadcast.endtime);

  return (
    <div className="flex items-start gap-4 py-3">
      <div className="text-muted-foreground w-36 shrink-0 text-sm">{timeStr}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{broadcast.title}</p>
          {broadcast.isactive && (
            <Badge variant="default" className="text-xs">
              LIVE
            </Badge>
          )}
          {broadcast.hastimer && (
            <Badge variant="outline" className="text-xs">
              Timer
            </Badge>
          )}
        </div>
        {broadcast.plot && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{broadcast.plot}</p>
        )}
        {broadcast.genre && broadcast.genre.length > 0 && (
          <p className="text-muted-foreground mt-1 text-xs">{broadcast.genre.join(', ')}</p>
        )}
      </div>
      {broadcast.progresspercentage !== undefined && broadcast.isactive && (
        <div className="w-20 shrink-0">
          <Progress value={broadcast.progresspercentage} className="h-1.5" />
          <p className="text-muted-foreground mt-1 text-right text-xs">
            {Math.round(broadcast.progresspercentage)}%
          </p>
        </div>
      )}
    </div>
  );
}

export function ChannelDetails() {
  const { channelId } = useParams({ strict: false });
  const channelIdNum = parseInt(channelId ?? '0', 10);

  const { data: channel, isLoading, isError, error } = useChannelDetails(channelIdNum);
  const { data: broadcasts = [] } = useBroadcasts({ channelid: channelIdNum });
  const playChannel = usePlayChannel();
  const record = useRecord();

  const { setItems } = useBreadcrumbs();

  useEffect(() => {
    if (channel) {
      setItems([{ label: 'Live TV', href: '/live-tv' }, { label: channel.label }]);
    } else {
      setItems([{ label: 'Live TV', href: '/live-tv' }, { label: 'Loading...' }]);
    }
  }, [channel, setItems]);

  if (isLoading) {
    return (
      <div className="container space-y-6 py-6">
        <div className="relative overflow-hidden rounded-lg">
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !channel) {
    return (
      <div className="container py-6">
        <ErrorState
          title="Error loading channel"
          error={error ?? undefined}
          message="Channel not found"
          centered
        />
      </div>
    );
  }

  const thumbnailUrl = getImageUrl(channel.thumbnail);
  const nowPlaying = channel.broadcastnow;
  const upNext = channel.broadcastnext;

  // Filter upcoming broadcasts (exclude already ended ones)
  const upcomingBroadcasts = broadcasts.filter((b) => {
    try {
      return new Date(b.endtime) > new Date();
    } catch {
      return true;
    }
  });

  return (
    <div className="container space-y-6 py-6">
      {/* Hero Section */}
      <div className="bg-muted relative overflow-hidden rounded-lg">
        <div className="h-48 w-full" />

        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="flex items-end gap-6">
            {/* Channel logo */}
            <div className="bg-background flex h-24 w-24 items-center justify-center rounded-lg shadow-lg">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={channel.label}
                  className="h-full w-full rounded-lg object-contain p-2"
                />
              ) : (
                <Tv className="text-muted-foreground h-12 w-12" />
              )}
            </div>

            {/* Channel info */}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-3xl font-bold">{channel.label}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">Ch. {channel.channelnumber}</Badge>
                {channel.isrecording && (
                  <Badge variant="destructive" className="gap-1">
                    <Radio className="h-3 w-3" />
                    Recording
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="hidden gap-2 md:flex">
              <Button
                onClick={() => {
                  playChannel.mutate({
                    channelid: channel.channelid,
                    channelName: channel.label,
                  });
                }}
                disabled={playChannel.isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                Watch
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  record.mutate(channel.channelid);
                }}
                disabled={record.isPending}
              >
                <Radio className="mr-2 h-4 w-4" />
                Record
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile actions */}
      <div className="flex gap-2 md:hidden">
        <Button
          className="flex-1"
          onClick={() => {
            playChannel.mutate({
              channelid: channel.channelid,
              channelName: channel.label,
            });
          }}
          disabled={playChannel.isPending}
        >
          <Play className="mr-2 h-4 w-4" />
          Watch
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            record.mutate(channel.channelid);
          }}
          disabled={record.isPending}
        >
          <Radio className="mr-2 h-4 w-4" />
          Record
        </Button>
      </div>

      {/* Now Playing */}
      {nowPlaying && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default">Now</Badge>
              {nowPlaying.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {formatBroadcastTime(nowPlaying.starttime, nowPlaying.endtime)}
            </div>
            {nowPlaying.progresspercentage !== undefined && (
              <Progress value={nowPlaying.progresspercentage} className="h-2" />
            )}
            {nowPlaying.plot && <p className="text-sm leading-relaxed">{nowPlaying.plot}</p>}
            {nowPlaying.genre && nowPlaying.genre.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {nowPlaying.genre.map((g) => (
                  <Badge key={g} variant="outline">
                    {g}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Up Next */}
      {upNext && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Next</Badge>
              {upNext.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {formatBroadcastTime(upNext.starttime, upNext.endtime)}
            </div>
            {upNext.plot && <p className="mt-2 text-sm leading-relaxed">{upNext.plot}</p>}
          </CardContent>
        </Card>
      )}

      {/* EPG / Upcoming Broadcasts */}
      {upcomingBroadcasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Program Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {upcomingBroadcasts.slice(0, 20).map((broadcast) => (
                <BroadcastRow key={broadcast.broadcastid} broadcast={broadcast} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
