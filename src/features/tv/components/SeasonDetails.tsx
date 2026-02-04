import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useTVShowDetails } from '@/api/hooks/useTVShowDetails';
import { useEpisodesBySeason } from '@/api/hooks/useEpisodes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaImage } from '@/components/media/MediaImage';
import { EpisodeList } from './EpisodeList';
import { getFanartUrl, getClearLogoUrl } from '@/lib/image-utils';

export function SeasonDetails() {
  const { tvshowId, season } = useParams({ strict: false });

  const tvshowIdNum = tvshowId ? parseInt(tvshowId, 10) : 0;
  const seasonNum = season ? parseInt(season, 10) : 0;

  const { data: tvshow, isLoading: isLoadingShow } = useTVShowDetails(tvshowIdNum);
  const {
    data: episodes,
    isLoading: isLoadingEpisodes,
    isError,
    error,
  } = useEpisodesBySeason(tvshowIdNum, seasonNum);

  if (!tvshowId || !season) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading season</h2>
          <p className="text-muted-foreground text-sm">Invalid params.</p>
        </div>
      </div>
    );
  }

  if (isLoadingShow || isLoadingEpisodes) {
    return (
      <div className="min-h-screen">
        <div className="relative h-[30vh] w-full">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !episodes || !tvshow) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link to="/tv/$tvshowId" params={{ tvshowId }}>
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to TV Show
          </Button>
        </Link>
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading season</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'Season not found'}
          </p>
        </div>
      </div>
    );
  }

  const fanartUrl = getFanartUrl(tvshow.art);
  const clearLogoUrl = getClearLogoUrl(tvshow.art);
  const totalEpisodes = episodes.length;
  const watchedEpisodes = episodes.filter((ep) => ep.playcount && ep.playcount > 0).length;

  return (
    <div className="min-h-screen">
      {/* Backdrop with gradient overlay */}
      {fanartUrl && (
        <div className="relative h-[30vh] w-full">
          <MediaImage
            src={fanartUrl}
            alt={tvshow.title}
            aspectRatio="fanart"
            loading="eager"
            placeholderType="fanart"
            className="h-full w-full"
          />
          <div className="from-background via-background/80 absolute inset-0 bg-gradient-to-t to-transparent" />

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
        <Link to="/tv/$tvshowId" params={{ tvshowId }}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to {tvshow.title}
          </Button>
        </Link>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="mb-2 text-4xl font-bold">
              {seasonNum === 0 ? 'Specials' : `Season ${String(seasonNum)}`}
            </h1>
            <p className="text-muted-foreground text-lg">{tvshow.title}</p>
            {totalEpisodes > 0 && (
              <p className="text-muted-foreground mt-2 text-sm">
                {watchedEpisodes}/{totalEpisodes} episodes watched
              </p>
            )}
          </div>

          {/* Episodes */}
          {episodes.length > 0 ? (
            <EpisodeList episodes={episodes} tvshowId={tvshowIdNum} season={seasonNum} />
          ) : (
            <div className="border-muted-foreground/20 rounded-lg border p-6 text-center">
              <p className="text-muted-foreground">No episodes found for this season</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
