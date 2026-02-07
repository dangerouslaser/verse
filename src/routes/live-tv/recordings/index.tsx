import { createFileRoute } from '@tanstack/react-router';
import { RecordingList } from '@/features/live-tv/components/RecordingList';

function RecordingsPage() {
  return <RecordingList />;
}

export const Route = createFileRoute('/live-tv/recordings/')({
  component: RecordingsPage,
});
