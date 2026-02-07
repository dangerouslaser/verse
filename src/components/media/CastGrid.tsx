import { getImageUrl } from '@/lib/image-utils';
import type { KodiCast } from '@/api/types/common';
import { cn } from '@/lib/utils';

interface CastGridProps {
  cast: KodiCast[];
  className?: string;
}

export function CastGrid({ cast, className }: CastGridProps) {
  if (cast.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">No cast information available</p>;
  }

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 md:grid-cols-3', className)}>
      {cast.map((member, idx) => {
        const thumbnailUrl = member.thumbnail ? getImageUrl(member.thumbnail) : null;
        return (
          <div
            key={`${member.name}-${String(idx)}`}
            className="bg-muted/50 flex items-center gap-3 rounded-md p-2"
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={member.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium">
                {member.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">{member.name}</p>
              {member.role && (
                <p className="text-muted-foreground truncate text-sm">{member.role}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
