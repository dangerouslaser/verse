import { createFileRoute } from '@tanstack/react-router';
import { ArtistDetails } from '@/features/music/components/ArtistDetails';

function ArtistDetailPage() {
  return <ArtistDetails />;
}

export const Route = createFileRoute('/music/$artistId')({
  component: ArtistDetailPage,
});
