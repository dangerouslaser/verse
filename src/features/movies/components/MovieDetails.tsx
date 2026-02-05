import { useParams } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useMovieDetails } from '@/api/hooks/useMovieDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaImage } from '@/components/media/MediaImage';
import { WatchedIndicator } from '@/components/video/WatchedIndicator';
import { MovieActions } from './MovieActions';
import { MovieMetadata } from './MovieMetadata';
import { MovieCast } from './MovieCast';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getFanartUrl, getClearLogoUrl } from '@/lib/image-utils';

export function MovieDetails() {
  const { movieId } = useParams({ strict: false });
  const movieIdNum = parseInt(movieId ?? '0', 10);

  const { data: movie, isLoading, isError, error } = useMovieDetails(movieIdNum);
  const { setItems } = useBreadcrumbs();

  // Set breadcrumbs when movie data is loaded
  useEffect(() => {
    if (movie) {
      const movieLabel = movie.year ? `${movie.title} (${String(movie.year)})` : movie.title;
      setItems([{ label: 'Movies', href: '/movies' }, { label: movieLabel }]);
    } else {
      setItems([{ label: 'Movies', href: '/movies' }, { label: 'Loading...' }]);
    }
  }, [movie, setItems]);

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

  if (isError || !movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border-destructive bg-destructive/10 rounded-lg border p-6">
          <h2 className="text-destructive mb-2 text-lg font-semibold">Error loading movie</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'Movie not found'}
          </p>
        </div>
      </div>
    );
  }

  const fanartUrl = getFanartUrl(movie.art);
  const clearLogoUrl = getClearLogoUrl(movie.art);

  return (
    <div className="min-h-screen">
      {/* Backdrop with gradient overlay */}
      {fanartUrl && (
        <div className="relative h-[50vh] w-full">
          <MediaImage
            src={fanartUrl}
            alt={movie.title}
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
                alt={movie.title}
                className="max-h-[40%] max-w-[80%] object-contain drop-shadow-2xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Title and Watched Indicator */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-4xl font-bold">{movie.title}</h1>
              {movie.originaltitle && movie.originaltitle !== movie.title && (
                <p className="text-muted-foreground text-lg">{movie.originaltitle}</p>
              )}
            </div>
            {movie.playcount !== undefined && movie.playcount > 0 && (
              <WatchedIndicator playcount={movie.playcount} resume={movie.resume} variant="icon" />
            )}
          </div>

          {/* Actions */}
          <MovieActions movie={movie} />

          {/* Metadata */}
          <MovieMetadata movie={movie} />

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="pt-6">
              <MovieCast cast={movie.cast} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
