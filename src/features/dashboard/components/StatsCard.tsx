import { Link } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value?: string | number;
  isLoading?: boolean;
  href?: string;
}

export function StatsCard({ icon: Icon, label, value, isLoading, href }: StatsCardProps) {
  const content = (
    <CardContent className="flex items-center gap-4 p-4">
      <div className="bg-primary/10 rounded-lg p-3">
        <Icon className="text-primary h-6 w-6" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-7 w-16" />
        ) : (
          <p className={cn('font-bold', typeof value === 'string' ? 'text-lg' : 'text-2xl')}>
            {typeof value === 'number' ? value.toLocaleString() : (value ?? '0')}
          </p>
        )}
      </div>
    </CardContent>
  );

  if (href) {
    return (
      <Link to={href}>
        <Card className={cn('hover:bg-accent transition-colors')}>{content}</Card>
      </Link>
    );
  }

  return <Card>{content}</Card>;
}

interface StatsGridProps {
  children: React.ReactNode;
}

export function StatsGrid({ children }: StatsGridProps) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}
