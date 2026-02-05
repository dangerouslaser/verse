import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { kodiWebSocket } from '@/api/websocket';

export function useKodiWebSocket() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = kodiWebSocket.onNotification((method, _data) => {
      switch (method) {
        case 'Internal.OnConnect':
          setIsConnected(true);
          break;

        case 'Internal.OnDisconnect':
          setIsConnected(false);
          break;

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
      }
    });

    kodiWebSocket.connect();

    return () => {
      unsubscribe();
      kodiWebSocket.disconnect();
    };
  }, [queryClient]);

  return { isConnected };
}
