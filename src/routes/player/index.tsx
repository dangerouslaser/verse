import { createFileRoute } from '@tanstack/react-router';
import { PlayerPage } from '@/features/player/components/PlayerPage';

export const Route = createFileRoute('/player/')({
  component: PlayerPage,
});
