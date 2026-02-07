import { createFileRoute } from '@tanstack/react-router';
import { EPGGrid } from '@/features/live-tv/components/EPGGrid';

function GuidePage() {
  return <EPGGrid />;
}

export const Route = createFileRoute('/live-tv/guide')({
  component: GuidePage,
});
