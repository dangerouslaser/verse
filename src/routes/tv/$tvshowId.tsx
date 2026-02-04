import { createFileRoute } from '@tanstack/react-router';
import { TVShowDetails } from '@/features/tv/components/TVShowDetails';

export const Route = createFileRoute('/tv/$tvshowId')({
  component: TVShowDetails,
});
