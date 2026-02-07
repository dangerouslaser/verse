import { useEffect } from 'react';
import { Clock, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTimers, useDeleteTimer, useToggleTimer } from '@/api/hooks/usePVR';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import type { KodiTimer } from '@/api/types/pvr';

function getTimerStatusVariant(
  state: KodiTimer['state']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (state) {
    case 'recording':
      return 'destructive';
    case 'scheduled':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'conflict_notok':
    case 'error':
      return 'destructive';
    default:
      return 'outline';
  }
}

function formatTimerTime(starttime: string, endtime: string): string {
  try {
    const start = new Date(starttime);
    const end = new Date(endtime);
    const dateFormat: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    };
    const timeFormat: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    return `${start.toLocaleDateString([], dateFormat)} - ${end.toLocaleTimeString([], timeFormat)}`;
  } catch {
    return '';
  }
}

interface TimerRowProps {
  timer: KodiTimer;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  isDeleting: boolean;
  isToggling: boolean;
}

function TimerRow({ timer, onDelete, onToggle, isDeleting, isToggling }: TimerRowProps) {
  const timeStr = formatTimerTime(timer.starttime, timer.endtime);
  const isDisabled = timer.state === 'disabled';

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{timer.title}</p>
          <Badge variant={getTimerStatusVariant(timer.state)}>{timer.state}</Badge>
          {timer.istimerrule && (
            <Badge variant="outline" className="text-xs">
              Rule
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
          <Clock className="h-3 w-3" />
          {timeStr}
        </div>
        {timer.summary && (
          <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">{timer.summary}</p>
        )}
      </div>

      <div className="flex shrink-0 gap-1">
        {!timer.isreadonly && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onToggle(timer.timerid);
              }}
              disabled={isToggling}
              title={isDisabled ? 'Enable timer' : 'Disable timer'}
            >
              {isDisabled ? (
                <ToggleLeft className="h-4 w-4" />
              ) : (
                <ToggleRight className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onDelete(timer.timerid);
              }}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function TimerList() {
  const { data: timers, isLoading, isError, error } = useTimers();
  const deleteTimer = useDeleteTimer();
  const toggleTimer = useToggleTimer();

  const { setItems } = useBreadcrumbs();

  useEffect(() => {
    setItems([{ label: 'Live TV', href: '/live-tv' }, { label: 'Timers' }]);
  }, [setItems]);

  if (isLoading) {
    return (
      <div className="container space-y-4 py-6">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container space-y-4 py-6">
        <ErrorState title="Error loading timers" error={error} />
      </div>
    );
  }

  if (!timers || timers.length === 0) {
    return (
      <div className="container space-y-4 py-6">
        <EmptyState title="No timers" description="No scheduled recordings found." />
      </div>
    );
  }

  return (
    <div className="container space-y-4 py-6">
      <div className="bg-muted/50 flex h-11 items-center rounded-lg border px-3">
        <p className="text-muted-foreground text-sm">{timers.length.toLocaleString()} timers</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y px-6">
            {timers.map((timer) => (
              <TimerRow
                key={timer.timerid}
                timer={timer}
                onDelete={(id) => {
                  deleteTimer.mutate(id);
                }}
                onToggle={(id) => {
                  toggleTimer.mutate(id);
                }}
                isDeleting={deleteTimer.isPending}
                isToggling={toggleTimer.isPending}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
