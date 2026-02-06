import { Link } from '@tanstack/react-router';
import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollRow } from '@/components/ui/scroll-row';
import { MediaImage } from '@/components/media/MediaImage';
import { useRecentEpisodes, type InProgressEpisode } from '@/api/hooks/useDashboard';
import { formatEpisodeNumber } from '@/lib/format';
import { getThumbUrl, getClearLogoUrl } from '@/lib/image-utils';

function EpisodeCard({ episode }: { episode: InProgressEpisode }) {
  const episodeNumber = formatEpisodeNumber(episode.season, episode.episode);
  const thumbUrl = getThumbUrl(episode.art);
  const clearLogoUrl = getClearLogoUrl(episode.showArt);

  const content = (
    <Card className="overflow-hidden border-0 bg-transparent shadow-none">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105">
          <MediaImage
            src={thumbUrl}
            alt={episode.title}
            aspectRatio="video"
            placeholderType="thumb"
          />
          {/* Gradient overlay for clearlogo readability */}
          {clearLogoUrl && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
          )}
          {/* Clearlogo overlay */}
          {clearLogoUrl && (
            <div className="absolute right-3 bottom-3 left-3">
              <img
                src={clearLogoUrl}
                alt={episode.showtitle ?? ''}
                className="h-10 w-auto max-w-[70%] object-contain drop-shadow-lg"
              />
            </div>
          )}
          {/* Play overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full">
              <Play className="h-5 w-5 fill-current" />
            </Button>
          </div>
        </div>
        <div className="mt-2 px-1">
          <h3 className="line-clamp-1 text-sm font-medium">{episode.showtitle}</h3>
          <p className="text-muted-foreground line-clamp-1 text-xs">
            {episodeNumber} · {episode.title}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (!episode.tvshowid) {
    return <div className="group">{content}</div>;
  }

  return (
    <Link
      to="/tv/$tvshowId/$season/$episodeId"
      params={{
        tvshowId: String(episode.tvshowid),
        season: String(episode.season),
        episodeId: String(episode.episodeid),
      }}
      className="group block"
    >
      {content}
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="w-[18.67rem] flex-shrink-0 sm:w-[21.33rem]">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="mt-2 h-4 w-32" />
      <Skeleton className="mt-1 h-3 w-24" />
    </div>
  );
}

export function RecentlyAddedEpisodesRow() {
  const { data: episodes, isLoading } = useRecentEpisodes();

  // Don't render if empty and not loading
  if (!isLoading && (!episodes || episodes.length === 0)) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Recently Added Episodes</h2>
      <ScrollRow>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : episodes?.map((episode) => (
              <div
                key={`episode-${String(episode.episodeid)}`}
                className="w-[18.67rem] flex-shrink-0 sm:w-[21.33rem]"
              >
                <EpisodeCard episode={episode} />
              </div>
            ))}
      </ScrollRow>
    </section>
  );
}
