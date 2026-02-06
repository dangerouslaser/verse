import { Link } from '@tanstack/react-router';
import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollRow } from '@/components/ui/scroll-row';
import { MediaPoster } from '@/components/media/MediaPoster';
import { MediaImage } from '@/components/media/MediaImage';
import {
  useInProgressMovies,
  useInProgressEpisodes,
  type InProgressEpisode,
} from '@/api/hooks/useDashboard';
import { formatEpisodeNumber } from '@/lib/format';
import { getThumbUrl, getClearLogoUrl } from '@/lib/image-utils';
import type { KodiMovie } from '@/api/types/video';

function getProgress(resume?: { position?: number; total?: number }): number {
  if (!resume || !resume.position || !resume.total || resume.total === 0) return 0;
  return Math.round((resume.position / resume.total) * 100);
}

function MovieCard({ movie }: { movie: KodiMovie }) {
  const progress = getProgress(movie.resume);

  return (
    <Link to="/movies/$movieId" params={{ movieId: String(movie.movieid) }} className="group block">
      <Card className="overflow-hidden border-0 bg-transparent shadow-none">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-lg">
            <MediaPoster art={movie.art} title={movie.title} />
            {/* Progress bar */}
            {progress > 0 && (
              <div className="absolute right-0 bottom-0 left-0">
                <Progress value={progress} className="h-1 rounded-none" />
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
            <h3 className="line-clamp-1 text-sm font-medium">{movie.title}</h3>
            <p className="text-muted-foreground text-xs">{movie.year}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EpisodeCard({ episode }: { episode: InProgressEpisode }) {
  const progress = getProgress(episode.resume);
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
          {/* Progress bar */}
          {progress > 0 && (
            <div className="absolute right-0 bottom-0 left-0">
              <Progress value={progress} className="h-1 rounded-none" />
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
    <div className="w-28 flex-shrink-0 sm:w-32">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="mt-2 h-4 w-20" />
      <Skeleton className="mt-1 h-3 w-14" />
    </div>
  );
}

export function ContinueWatchingRow() {
  const { data: movies, isLoading: moviesLoading } = useInProgressMovies();
  const { data: episodes, isLoading: episodesLoading } = useInProgressEpisodes();

  const isLoading = moviesLoading || episodesLoading;

  // Combine and sort by last played
  const items: Array<
    { type: 'movie'; item: KodiMovie } | { type: 'episode'; item: InProgressEpisode }
  > = [
    ...(movies ?? []).map((movie) => ({ type: 'movie' as const, item: movie })),
    ...(episodes ?? []).map((episode) => ({ type: 'episode' as const, item: episode })),
  ]
    .sort((a, b) => {
      const aDate = a.item.lastplayed ? new Date(a.item.lastplayed).getTime() : 0;
      const bDate = b.item.lastplayed ? new Date(b.item.lastplayed).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 12);

  // Don't render if empty and not loading
  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Continue Watching</h2>
      <ScrollRow>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => {
              // Episode thumbnails (16:9) need to be wider to match poster (2:3) height
              // Width ratio: (16/9) / (2/3) = 2.67x wider
              // w-28 = 7rem -> 7 * 2.67 = 18.67rem, w-32 = 8rem -> 8 * 2.67 = 21.33rem
              const widthClass =
                item.type === 'movie' ? 'w-28 sm:w-32' : 'w-[18.67rem] sm:w-[21.33rem]';
              const key =
                item.type === 'movie'
                  ? `movie-${String(item.item.movieid)}`
                  : `episode-${String(item.item.episodeid)}`;

              return (
                <div key={key} className={`flex-shrink-0 overflow-hidden ${widthClass}`}>
                  {item.type === 'movie' ? (
                    <MovieCard movie={item.item} />
                  ) : (
                    <EpisodeCard episode={item.item} />
                  )}
                </div>
              );
            })}
      </ScrollRow>
    </section>
  );
}
