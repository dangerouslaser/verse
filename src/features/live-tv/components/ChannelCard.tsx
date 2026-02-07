import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { KodiChannel } from '@/api/types/pvr';
import { getImageUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { Radio, Tv } from 'lucide-react';

interface ChannelCardProps {
  channel: KodiChannel;
  className?: string;
}

export function ChannelCard({ channel, className }: ChannelCardProps) {
  const thumbnailUrl = getImageUrl(channel.thumbnail);

  return (
    <Link
      to="/live-tv/$channelId"
      params={{ channelId: channel.channelid.toString() }}
      className={cn('group block w-full', className)}
    >
      <Card className="overflow-hidden border-0 bg-transparent shadow-none transition-transform duration-300 hover:scale-105">
        <CardContent className="p-0">
          <div className="relative">
            {/* Channel logo / thumbnail */}
            <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden rounded-lg">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={channel.label}
                  loading="lazy"
                  className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <Tv className="text-muted-foreground h-12 w-12" />
              )}
            </div>

            {/* Channel number badge */}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                {channel.channelnumber}
              </Badge>
            </div>

            {/* Recording indicator */}
            {channel.isrecording && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="gap-1">
                  <Radio className="h-3 w-3" />
                  REC
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-2 space-y-1 px-1">
            <h3 className="group-hover:text-primary line-clamp-1 leading-tight font-semibold">
              {channel.label}
            </h3>
            {channel.broadcastnow && (
              <p className="text-muted-foreground line-clamp-1 text-sm">
                {channel.broadcastnow.title}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
