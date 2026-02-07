import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title: string;
  error?: Error;
  message?: string;
  centered?: boolean;
  className?: string;
}

/**
 * Reusable error state component for displaying errors
 */
export function ErrorState({ title, error, message, centered, className }: ErrorStateProps) {
  const errorMessage =
    (error instanceof Error ? error.message : undefined) || message || 'An unknown error occurred';

  return (
    <div
      className={cn(
        'border-destructive bg-destructive/10 rounded-lg border p-6',
        centered && 'text-center',
        className
      )}
    >
      <h2 className="text-destructive mb-2 text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground text-sm">{errorMessage}</p>
    </div>
  );
}
