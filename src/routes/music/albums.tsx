import { createFileRoute } from '@tanstack/react-router';
import { AlbumList } from '@/features/music/components/AlbumList';

function AlbumsPage() {
  return <AlbumList />;
}

export const Route = createFileRoute('/music/albums')({
  component: AlbumsPage,
});
