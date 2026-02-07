import { createFileRoute } from '@tanstack/react-router';
import { RecordingDetails } from '@/features/live-tv/components/RecordingDetails';

function RecordingDetailPage() {
  return <RecordingDetails />;
}

export const Route = createFileRoute('/live-tv/recordings/$recordingId')({
  component: RecordingDetailPage,
});
