import { useEffect, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { kodiWebSocket } from '@/api/websocket';

/**
 * Subscribe to WebSocket connection state from any component.
 * Uses useSyncExternalStore to stay in sync with the singleton.
 */
export function useKodiConnectionStatus() {
  return useSyncExternalStore(
    (callback) => kodiWebSocket.subscribe(callback),
    () => kodiWebSocket.isConnected
  );
}

export function useKodiWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = kodiWebSocket.onNotification((method, _data) => {
      switch (method) {
        // Player notifications
        case 'Player.OnPlay':
        case 'Player.OnResume':
          void queryClient.invalidateQueries({ queryKey: ['player'] });
          void queryClient.invalidateQueries({ queryKey: ['playlist'] });
          break;

        case 'Player.OnPause':
        case 'Player.OnSpeedChanged':
          void queryClient.invalidateQueries({ queryKey: ['player', 'properties'] });
          break;

        case 'Player.OnStop':
          void queryClient.invalidateQueries({ queryKey: ['player'] });
          void queryClient.invalidateQueries({ queryKey: ['movies'] });
          void queryClient.invalidateQueries({ queryKey: ['episodes'] });
          void queryClient.invalidateQueries({ queryKey: ['tvshows'] });
          void queryClient.invalidateQueries({ queryKey: ['artists'] });
          void queryClient.invalidateQueries({ queryKey: ['albums'] });
          void queryClient.invalidateQueries({ queryKey: ['songs'] });
          break;

        case 'Player.OnPropertyChanged':
          void queryClient.invalidateQueries({ queryKey: ['player', 'properties'] });
          break;

        case 'Player.OnSeek':
          void queryClient.invalidateQueries({ queryKey: ['player', 'properties'] });
          break;

        // Application notifications
        case 'Application.OnVolumeChanged':
          void queryClient.invalidateQueries({ queryKey: ['application', 'volume'] });
          break;

        // Playlist notifications
        case 'Playlist.OnAdd':
        case 'Playlist.OnRemove':
        case 'Playlist.OnClear':
          void queryClient.invalidateQueries({ queryKey: ['playlist'] });
          break;

        // Library notifications
        case 'VideoLibrary.OnUpdate':
        case 'VideoLibrary.OnScanFinished':
          void queryClient.invalidateQueries({ queryKey: ['movies'] });
          void queryClient.invalidateQueries({ queryKey: ['tvshows'] });
          void queryClient.invalidateQueries({ queryKey: ['episodes'] });
          void queryClient.invalidateQueries({ queryKey: ['seasons'] });
          break;

        case 'VideoLibrary.OnRemove':
          void queryClient.invalidateQueries({ queryKey: ['movies'] });
          void queryClient.invalidateQueries({ queryKey: ['tvshows'] });
          break;

        // Audio library notifications
        case 'AudioLibrary.OnUpdate':
          void queryClient.invalidateQueries({ queryKey: ['artists'] });
          void queryClient.invalidateQueries({ queryKey: ['albums'] });
          void queryClient.invalidateQueries({ queryKey: ['songs'] });
          void queryClient.invalidateQueries({ queryKey: ['music-genres'] });
          break;

        case 'AudioLibrary.OnRemove':
          void queryClient.invalidateQueries({ queryKey: ['artists'] });
          void queryClient.invalidateQueries({ queryKey: ['albums'] });
          void queryClient.invalidateQueries({ queryKey: ['songs'] });
          break;

        case 'AudioLibrary.OnScanFinished':
        case 'AudioLibrary.OnCleanFinished':
          void queryClient.invalidateQueries({ queryKey: ['artists'] });
          void queryClient.invalidateQueries({ queryKey: ['albums'] });
          void queryClient.invalidateQueries({ queryKey: ['songs'] });
          void queryClient.invalidateQueries({ queryKey: ['music-genres'] });
          break;
      }
    });

    kodiWebSocket.connect();

    return () => {
      unsubscribe();
      kodiWebSocket.disconnect();
    };
  }, [queryClient]);
}
