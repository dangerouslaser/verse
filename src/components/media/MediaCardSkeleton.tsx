import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MediaCardSkeletonProps {
  className?: string;
}

export function MediaCardSkeleton({ className }: MediaCardSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

interface MediaCardSkeletonGridProps {
  count?: number;
  className?: string;
}

export function MediaCardSkeletonGrid({ count = 20, className }: MediaCardSkeletonGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}

interface MediaListSkeletonProps {
  count?: number;
  className?: string;
}

export function MediaListSkeleton({ count = 10, className }: MediaListSkeletonProps) {
  return (
    <div className={cn('bg-muted/50 rounded-md border', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0">
          <Skeleton className="aspect-[2/3] w-10 shrink-0 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}
