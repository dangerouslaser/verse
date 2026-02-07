import { createFileRoute } from '@tanstack/react-router';
import { ChannelList } from '@/features/live-tv/components/ChannelList';

function LiveTVPage() {
  return <ChannelList />;
}

export const Route = createFileRoute('/live-tv/')({
  component: LiveTVPage,
});
