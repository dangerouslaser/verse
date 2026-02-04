import { Button } from '@/components/ui/button';
import { Grid3x3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn('bg-muted/50 flex items-center gap-1 rounded-lg p-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          onChange('grid');
        }}
        className={cn(
          'h-8 gap-2 transition-all',
          value === 'grid'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="Grid view"
        aria-pressed={value === 'grid'}
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          onChange('list');
        }}
        className={cn(
          'h-8 gap-2 transition-all',
          value === 'list'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="List view"
        aria-pressed={value === 'list'}
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </Button>
    </div>
  );
}
