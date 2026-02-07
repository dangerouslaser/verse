import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, className }: EmptyStateProps) {
  return (
    <div className={cn('bg-muted/50 rounded-lg border p-12 text-center', className)}>
      {icon && <div className="text-muted-foreground mx-auto mb-4">{icon}</div>}
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
