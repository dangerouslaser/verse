import { createFileRoute } from '@tanstack/react-router';
import { ChannelDetails } from '@/features/live-tv/components/ChannelDetails';

function ChannelDetailPage() {
  return <ChannelDetails />;
}

export const Route = createFileRoute('/live-tv/$channelId')({
  component: ChannelDetailPage,
});
