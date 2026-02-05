import { createFileRoute } from '@tanstack/react-router';
import { AlbumDetails } from '@/features/music/components/AlbumDetails';

function AlbumDetailPage() {
  return <AlbumDetails />;
}

export const Route = createFileRoute('/music/$artistId/$albumId')({
  component: AlbumDetailPage,
});
