import { createFileRoute } from '@tanstack/react-router';
import { SongList } from '@/features/music/components/SongList';

function SongsPage() {
  return <SongList />;
}

export const Route = createFileRoute('/music/songs')({
  component: SongsPage,
});
