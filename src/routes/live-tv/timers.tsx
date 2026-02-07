import { createFileRoute } from '@tanstack/react-router';
import { TimerList } from '@/features/live-tv/components/TimerList';

function TimersPage() {
  return <TimerList />;
}

export const Route = createFileRoute('/live-tv/timers')({
  component: TimersPage,
});
