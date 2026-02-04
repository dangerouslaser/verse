import { createFileRoute } from '@tanstack/react-router';
import { EpisodeDetails } from '@/features/tv/components/EpisodeDetails';

export const Route = createFileRoute('/tv/$tvshowId/$season/$episodeId')({
  component: EpisodeDetails,
});
