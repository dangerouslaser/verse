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
    <div className={cn('bg-card flex items-center gap-1 rounded-lg border p-1', className)}>
      <Button
        variant={value === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => {
          onChange('grid');
        }}
        className={cn('h-8 gap-2', value === 'grid' && 'bg-secondary')}
        aria-label="Grid view"
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={value === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => {
          onChange('list');
        }}
        className={cn('h-8 gap-2', value === 'list' && 'bg-secondary')}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </Button>
    </div>
  );
}
