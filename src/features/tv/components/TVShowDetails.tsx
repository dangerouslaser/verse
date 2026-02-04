import { useParams, Link, Outlet, useMatches } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useTVShowDetails } from '@/api/hooks/useTVShowDetails';
import { useSeasons } from '@/api/hooks/useSeasons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaImage } from '@/components/media/MediaImage';
import { WatchedIndicator } from '@/components/video/WatchedIndicator';
import { TVShowActions } from './TVShowActions';
import { TVShowMetadata } from './TVShowMetadata';
import { SeasonList } from './SeasonList';
import { getFanartUrl, getClearLogoUrl } from '@/lib/image-utils';

export function TVShowDetails() {
  const { tvshowId } = useParams({ strict: false });
  const tvshowIdNum = parseInt(tvshowId, 10);
  const matches = useMatches();

  // Check if we're on a child route (season or episode)
  const isOnChildRoute = matches.some((match) => match.routeId.includes('/$season'));

  const { data: tvshow, isLoading, isError, error } = useTVShowDetails(tvshowIdNum);
  const { data: seasons, isLoading: isLoadingSeasons } = useSeasons(tvshowIdNum);

  // If we're on a child route, just render the outlet
  if (isOnChildRoute) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="relative h-[50vh] w-full">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !tvshow) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link to="/tv">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to TV Shows
          </Button>
        </Link>
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading TV show</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'TV show not found'}
          </p>
        </div>
      </div>
    );
  }

  const fanartUrl = getFanartUrl(tvshow.art);
  const clearLogoUrl = getClearLogoUrl(tvshow.art);

  const totalEpisodes = tvshow.episode || 0;
  const watchedEpisodes = tvshow.watchedepisodes || 0;

  return (
    <div className="min-h-screen">
      {/* Backdrop with gradient overlay */}
      {fanartUrl && (
        <div className="relative h-[50vh] w-full">
          <MediaImage
            src={fanartUrl}
            alt={tvshow.title}
            aspectRatio="fanart"
            loading="eager"
            placeholderType="fanart"
            className="h-full w-full"
          />
          <div className="from-background via-background/60 absolute inset-0 bg-gradient-to-t to-transparent transition-colors duration-300" />

          {/* Clearlogo overlay */}
          {clearLogoUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={clearLogoUrl}
                alt={tvshow.title}
                className="max-h-[40%] max-w-[80%] object-contain drop-shadow-2xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Link to="/tv">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to TV Shows
          </Button>
        </Link>

        <div className="space-y-6">
          {/* Title and Watched Indicator */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-4xl font-bold">{tvshow.title}</h1>
              {tvshow.originaltitle && tvshow.originaltitle !== tvshow.title && (
                <p className="text-muted-foreground text-lg">{tvshow.originaltitle}</p>
              )}
              {totalEpisodes > 0 && (
                <p className="text-muted-foreground mt-2 text-sm">
                  {watchedEpisodes}/{totalEpisodes} episodes watched
                </p>
              )}
            </div>
            {tvshow.playcount !== undefined && tvshow.playcount > 0 && (
              <WatchedIndicator playcount={tvshow.playcount} variant="icon" />
            )}
          </div>

          {/* Actions */}
          <TVShowActions tvshow={tvshow} />

          {/* Metadata */}
          <TVShowMetadata tvshow={tvshow} />

          {/* Seasons */}
          {isLoadingSeasons ? (
            <div className="pt-6">
              <h2 className="mb-4 text-2xl font-bold">Seasons</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
          ) : (
            seasons &&
            seasons.length > 0 && (
              <div className="pt-6">
                <h2 className="mb-4 text-2xl font-bold">Seasons</h2>
                <SeasonList seasons={seasons} tvshowId={tvshowIdNum} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
