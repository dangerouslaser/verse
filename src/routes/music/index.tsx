import { createFileRoute } from '@tanstack/react-router';
import { ArtistList } from '@/features/music/components/ArtistList';

function MusicArtistsPage() {
  return <ArtistList />;
}

export const Route = createFileRoute('/music/')({
  component: MusicArtistsPage,
});
