import { createFileRoute } from '@tanstack/react-router';
import { TVShowList } from '@/features/tv/components/TVShowList';

export const Route = createFileRoute('/tv/')({
  component: TVShowList,
});
