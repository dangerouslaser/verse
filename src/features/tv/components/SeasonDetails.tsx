import { useParams } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Calendar, Star, Tv } from 'lucide-react';
import { useTVShowDetails } from '@/api/hooks/useTVShowDetails';
import { useSeasons } from '@/api/hooks/useSeasons';
import { useEpisodesBySeason } from '@/api/hooks/useEpisodes';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MediaImage } from '@/components/media/MediaImage';
import { EpisodeList } from './EpisodeList';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getFanartUrl, getPosterUrl } from '@/lib/image-utils';
import { ErrorState } from '@/components/ui/ErrorState';

export function SeasonDetails() {
  const { tvshowId, season } = useParams({ strict: false });

  const tvshowIdNum = tvshowId ? parseInt(tvshowId, 10) : 0;
  const seasonNum = season ? parseInt(season, 10) : 0;

  const { data: tvshow, isLoading: isLoadingShow } = useTVShowDetails(tvshowIdNum);
  const { data: seasons } = useSeasons(tvshowIdNum);
  const {
    data: episodes,
    isLoading: isLoadingEpisodes,
    isError,
    error,
  } = useEpisodesBySeason(tvshowIdNum, seasonNum);
  const { setItems } = useBreadcrumbs();

  // Find the current season data
  const currentSeason = seasons?.find((s) => s.season === seasonNum);

  // Set breadcrumbs when data is loaded
  useEffect(() => {
    if (tvshow) {
      const seasonLabel = seasonNum === 0 ? 'Specials' : `Season ${String(seasonNum)}`;
      setItems([
        { label: 'TV Shows', href: '/tv' },
        { label: tvshow.title, href: `/tv/${tvshowId ?? ''}` },
        { label: seasonLabel },
      ]);
    } else if (tvshowId && season) {
      const seasonLabel = seasonNum === 0 ? 'Specials' : `Season ${String(seasonNum)}`;
      setItems([
        { label: 'TV Shows', href: '/tv' },
        { label: 'Loading...', href: `/tv/${tvshowId}` },
        { label: seasonLabel },
      ]);
    }
  }, [tvshow, tvshowId, season, seasonNum, setItems]);

  if (!tvshowId || !season) {
    return (
      <div className="container py-6">
        <ErrorState title="Error loading season" message="Invalid params." centered />
      </div>
    );
  }

  if (isLoadingShow || isLoadingEpisodes) {
    return (
      <div className="container space-y-6 py-6">
        <div className="relative overflow-hidden rounded-lg">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !episodes || !tvshow) {
    return (
      <div className="container py-6">
        <ErrorState
          title="Error loading season"
          error={error ?? undefined}
          message="Season not found"
          centered
        />
      </div>
    );
  }

  const fanartUrl = getFanartUrl(tvshow.art);
  // Use season poster if available, otherwise fall back to show poster
  const posterUrl = getPosterUrl(currentSeason?.art) ?? getPosterUrl(tvshow.art);

  const totalEpisodes = episodes.length;
  const watchedEpisodes = episodes.filter((ep) => ep.playcount && ep.playcount > 0).length;
  const progressPercent =
    totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0;

  const seasonLabel = seasonNum === 0 ? 'Specials' : `Season ${String(seasonNum)}`;

  return (
    <div className="container space-y-6 py-6">
      {/* Hero Section with Fanart */}
      <div className="bg-muted relative overflow-hidden rounded-lg">
        {fanartUrl ? (
          <>
            <MediaImage
              src={fanartUrl}
              alt=""
              aspectRatio="fanart"
              loading="eager"
              placeholderType="fanart"
              className="h-64 w-full object-cover"
            />
            <div className="from-background via-background/80 absolute inset-0 bg-gradient-to-t to-transparent" />
          </>
        ) : (
          <div className="h-32 w-full" />
        )}

        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="flex items-end gap-6">
            {/* Poster */}
            {posterUrl ? (
              <MediaImage
                src={posterUrl}
                alt={seasonLabel}
                aspectRatio="poster"
                placeholderType="poster"
                className="h-48 w-32 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="bg-muted flex h-48 w-32 items-center justify-center rounded-lg">
                <Tv className="text-muted-foreground h-12 w-12" />
              </div>
            )}

            {/* Title and metadata */}
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-sm">{tvshow.title}</p>
              <h1 className="truncate text-3xl font-bold">{seasonLabel}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {tvshow.premiered && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {tvshow.premiered.substring(0, 4)}
                  </Badge>
                )}
                {tvshow.rating && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    {tvshow.rating.toFixed(1)}
                  </Badge>
                )}
                <Badge variant="outline">{totalEpisodes} episodes</Badge>
              </div>
              {/* Progress bar */}
              {totalEpisodes > 0 && (
                <div className="mt-3 flex max-w-xs items-center gap-2">
                  <Progress value={progressPercent} className="h-2 flex-1" />
                  <span className="text-muted-foreground text-sm">
                    {watchedEpisodes}/{totalEpisodes} watched
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
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
  );
}
