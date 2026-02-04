import { useQuery } from '@tanstack/react-query';
import { kodi } from '../client';

/**
 * Hook to check Kodi connection status
 */
export function useKodiConnection() {
  return useQuery({
    queryKey: ['kodi', 'connection'],
    queryFn: async () => {
      const result = await kodi.ping();
      return result === 'pong';
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: 2,
  });
}

/**
 * Hook to get Kodi version
 */
export function useKodiVersion() {
  return useQuery({
    queryKey: ['kodi', 'version'],
    queryFn: () => kodi.getVersion(),
    staleTime: Infinity, // Version doesn't change
  });
}
