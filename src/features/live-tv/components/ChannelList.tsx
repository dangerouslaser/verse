import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ViewToggle } from '@/components/media/ViewToggle';
import { useDebounce } from '@/hooks/useDebounce';
import { useViewMode } from '@/hooks/useViewMode';
import { useChannels, useChannelGroups, usePlayChannel } from '@/api/hooks/usePVR';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getImageUrl } from '@/lib/image-utils';
import { formatBroadcastTime } from '@/lib/format';
import { ChannelCard } from './ChannelCard';
import { ChannelGroupFilter } from './ChannelGroupFilter';
import { Search, Play, Radio, Tv } from 'lucide-react';
import type { KodiChannel } from '@/api/types/pvr';

function ChannelRow({
  channel,
  onPlay,
}: {
  channel: KodiChannel;
  onPlay: (ch: KodiChannel) => void;
}) {
  const thumbnailUrl = getImageUrl(channel.thumbnail);
  const now = channel.broadcastnow;
  const next = channel.broadcastnext;

  return (
    <TableRow>
      {/* Channel */}
      <TableCell className="w-16 text-center">
        <span className="text-muted-foreground text-sm font-medium">{channel.channelnumber}</span>
      </TableCell>
      <TableCell>
        <Link
          to="/live-tv/$channelId"
          params={{ channelId: channel.channelid.toString() }}
          className="flex items-center gap-3 hover:opacity-80"
        >
          <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="" className="h-full w-full object-contain p-1" />
            ) : (
              <Tv className="text-muted-foreground h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{channel.label}</p>
            {channel.isrecording && (
              <Badge variant="destructive" className="mt-0.5 gap-1 text-xs">
                <Radio className="h-3 w-3" />
                REC
              </Badge>
            )}
          </div>
        </Link>
      </TableCell>

      {/* Now Playing */}
      <TableCell className="max-w-xs">
        {now ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{now.title}</p>
              {now.isactive && (
                <Badge variant="default" className="shrink-0 text-xs">
                  LIVE
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              {formatBroadcastTime(now.starttime, now.endtime)}
            </p>
            {now.progresspercentage !== undefined && (
              <Progress value={now.progresspercentage} className="h-1" />
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>

      {/* Up Next */}
      <TableCell className="hidden max-w-xs md:table-cell">
        {next ? (
          <div>
            <p className="truncate text-sm">{next.title}</p>
            <p className="text-muted-foreground text-xs">
              {formatBroadcastTime(next.starttime, next.endtime)}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>

      {/* Genre */}
      <TableCell className="hidden lg:table-cell">
        {now?.genre && now.genre.length > 0 ? (
          <span className="text-muted-foreground text-sm">{now.genre[0]}</span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>

      {/* Play */}
      <TableCell className="w-16">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            onPlay(channel);
          }}
        >
          <Play className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function ChannelList() {
  const [groupId, setGroupId] = useState<number | 'alltv' | 'allradio'>('alltv');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [viewMode, setViewMode] = useViewMode('live-tv', 'list');
  const playChannel = usePlayChannel();

  const { data: groups = [] } = useChannelGroups('tv');
  const { data: channels, isLoading, isError, error } = useChannels({ channelgroupid: groupId });

  const { setItems } = useBreadcrumbs();

  useEffect(() => {
    setItems([{ label: 'Live TV' }]);
  }, [setItems]);

  const filteredChannels = (channels ?? []).filter((ch) => {
    if (!debouncedSearch) return true;
    const query = debouncedSearch.toLowerCase();
    return (
      ch.label.toLowerCase().includes(query) ||
      ch.channel.toLowerCase().includes(query) ||
      ch.channelnumber.toString().includes(query)
    );
  });

  const handlePlay = (channel: KodiChannel) => {
    playChannel.mutate({ channelid: channel.channelid, channelName: channel.label });
  };

  if (isLoading) {
    return (
      <div className="container space-y-4 py-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-8 w-48" />
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container space-y-4 py-6">
        <ErrorState title="Error loading channels" error={error} />
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="container space-y-4 py-6">
        <EmptyState
          title="No channels found"
          description="No PVR channels are available. Make sure a PVR backend is configured in Kodi."
        />
      </div>
    );
  }

  return (
    <div className="container space-y-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search channels..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            className="w-64 pl-8"
          />
        </div>

        {groups.length > 0 && (
          <ChannelGroupFilter groups={groups} value={groupId} onChange={setGroupId} />
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="bg-muted/50 flex h-11 items-center rounded-lg border px-3">
            <p className="text-muted-foreground text-sm">
              {filteredChannels.length.toLocaleString()} channels
            </p>
          </div>
          <ViewToggle value={viewMode} onChange={setViewMode} className="border" />
        </div>
      </div>

      {/* Content */}
      {filteredChannels.length > 0 ? (
        viewMode === 'list' ? (
          <div className="bg-muted/50 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Now Playing</TableHead>
                  <TableHead className="hidden md:table-cell">Up Next</TableHead>
                  <TableHead className="hidden lg:table-cell">Genre</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChannels.map((channel) => (
                  <ChannelRow key={channel.channelid} channel={channel} onPlay={handlePlay} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
            {filteredChannels.map((channel) => (
              <ChannelCard key={channel.channelid} channel={channel} />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="No results found"
          description="Try adjusting your search or filter criteria."
        />
      )}
    </div>
  );
}
