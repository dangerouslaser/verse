import { Film, Tv, PlaySquare, User, Disc3, Music } from 'lucide-react';
import { CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import type { SearchResult, MediaType } from '@/api/types/search';

const TYPE_ICONS: Record<MediaType, React.ElementType> = {
  movie: Film,
  tvshow: Tv,
  episode: PlaySquare,
  artist: User,
  album: Disc3,
  song: Music,
};

const TYPE_LABELS: Record<MediaType, string> = {
  movie: 'Movie',
  tvshow: 'TV Show',
  episode: 'Episode',
  artist: 'Artist',
  album: 'Album',
  song: 'Song',
};

interface SearchResultItemProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

export function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  const Icon = TYPE_ICONS[result.type];

  return (
    <CommandItem
      value={`${result.type}-${String(result.id)}-${result.title}`}
      onSelect={() => {
        onSelect(result);
      }}
      className="flex items-center gap-3 px-3 py-2"
    >
      {/* Thumbnail */}
      <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded">
        {result.imageUrl ? (
          <img
            src={result.imageUrl}
            alt={result.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="bg-muted flex h-full w-full items-center justify-center">
            <Icon className="text-muted-foreground h-5 w-5" />
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{result.title}</p>
        {result.subtitle && (
          <p className="text-muted-foreground truncate text-xs">{result.subtitle}</p>
        )}
      </div>

      {/* Type badge */}
      <Badge variant="secondary" className="shrink-0 text-xs">
        <Icon className="mr-1 h-3 w-3" />
        {TYPE_LABELS[result.type]}
      </Badge>
    </CommandItem>
  );
}
