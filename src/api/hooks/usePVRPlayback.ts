import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import { toast } from 'sonner';

interface PlayChannelOptions {
  channelid: number;
  channelName?: string;
}

/**
 * Hook for tuning to a live TV channel
 */
export function usePlayChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: PlayChannelOptions) => {
      await kodi.call('Player.Open', {
        item: { channelid: options.channelid },
      });
      return options;
    },
    onSuccess: (options) => {
      void queryClient.invalidateQueries({ queryKey: ['player'] });

      toast.success('Tuning', {
        description: options.channelName ? `Now watching: ${options.channelName}` : 'Now watching',
      });
    },
    onError: (error) => {
      toast.error('Playback Error', {
        description: error instanceof Error ? error.message : 'Failed to tune channel',
      });
    },
  });
}

/**
 * Hook to start/stop recording on a channel
 */
export function useRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelid: number) => {
      await kodi.call('PVR.Record', { channel: channelid });
      return channelid;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['channels'] });
      void queryClient.invalidateQueries({ queryKey: ['recordings'] });
      void queryClient.invalidateQueries({ queryKey: ['timers'] });

      toast.success('Recording toggled');
    },
    onError: (error) => {
      toast.error('Recording Error', {
        description: error instanceof Error ? error.message : 'Failed to toggle recording',
      });
    },
  });
}
