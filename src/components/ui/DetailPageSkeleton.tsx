import { Skeleton } from './skeleton';

interface DetailPageSkeletonProps {
  backdropHeight?: '30vh' | '50vh';
}

/**
 * Loading skeleton for detail pages (movies, TV shows, episodes, seasons)
 */
export function DetailPageSkeleton({ backdropHeight = '50vh' }: DetailPageSkeletonProps) {
  return (
    <div className="min-h-screen">
      <div className={`relative h-[${backdropHeight}] w-full`}>
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
