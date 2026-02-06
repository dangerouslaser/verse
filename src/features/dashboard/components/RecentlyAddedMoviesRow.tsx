import { Link } from '@tanstack/react-router';
import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollRow } from '@/components/ui/scroll-row';
import { MediaPoster } from '@/components/media/MediaPoster';
import { useRecentMovies } from '@/api/hooks/useDashboard';
import type { KodiMovie } from '@/api/types/video';

function MovieCard({ movie }: { movie: KodiMovie }) {
  return (
    <Link to="/movies/$movieId" params={{ movieId: String(movie.movieid) }} className="group block">
      <Card className="overflow-hidden border-0 bg-transparent shadow-none">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-lg">
            <MediaPoster art={movie.art} title={movie.title} />
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

function SkeletonCard() {
  return (
    <div className="w-28 flex-shrink-0 sm:w-32">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="mt-2 h-4 w-20" />
      <Skeleton className="mt-1 h-3 w-14" />
    </div>
  );
}

export function RecentlyAddedMoviesRow() {
  const { data: movies, isLoading } = useRecentMovies();

  // Don't render if empty and not loading
  if (!isLoading && (!movies || movies.length === 0)) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Recently Added Movies</h2>
      <ScrollRow>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : movies?.map((movie) => (
              <div key={`movie-${String(movie.movieid)}`} className="w-28 flex-shrink-0 sm:w-32">
                <MovieCard movie={movie} />
              </div>
            ))}
      </ScrollRow>
    </section>
  );
}
