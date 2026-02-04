import { createFileRoute } from '@tanstack/react-router';
import { SeasonDetails } from '@/features/tv/components/SeasonDetails';

export const Route = createFileRoute('/tv/$tvshowId/$season')({
  component: SeasonDetails,
});
