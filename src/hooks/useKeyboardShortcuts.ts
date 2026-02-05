import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { usePlayerStore } from '@/stores/player';
import {
  usePlayPause,
  useStop,
  useSkipNext,
  useSkipPrevious,
  useSeek,
  useSetVolume,
  useToggleMute,
} from '@/api/hooks/usePlayback';

function isInputFocused(): boolean {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    (active as HTMLElement).isContentEditable
  );
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const playPauseMutation = usePlayPause();
  const stopMutation = useStop();
  const skipNextMutation = useSkipNext();
  const skipPrevMutation = useSkipPrevious();
  const seekMutation = useSeek();
  const setVolumeMutation = useSetVolume();
  const toggleMuteMutation = useToggleMute();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      const { playerId, percentage, volume } = usePlayerStore.getState();
      if (playerId === undefined) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          playPauseMutation.mutate(playerId);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          seekMutation.mutate({
            playerId,
            value: Math.max(0, percentage - 2),
          });
          break;

        case 'ArrowRight':
          e.preventDefault();
          seekMutation.mutate({
            playerId,
            value: Math.min(100, percentage + 2),
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setVolumeMutation.mutate(Math.min(100, volume + 5));
          break;

        case 'ArrowDown':
          e.preventDefault();
          setVolumeMutation.mutate(Math.max(0, volume - 5));
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          toggleMuteMutation.mutate();
          break;

        case 'n':
        case 'N':
          e.preventDefault();
          skipNextMutation.mutate(playerId);
          break;

        case 'p':
        case 'P':
          e.preventDefault();
          skipPrevMutation.mutate(playerId);
          break;

        case 's':
        case 'S':
          e.preventDefault();
          stopMutation.mutate(playerId);
          break;

        case 'f':
        case 'F':
          e.preventDefault();
          void navigate({ to: '/player' });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    navigate,
    playPauseMutation,
    stopMutation,
    skipNextMutation,
    skipPrevMutation,
    seekMutation,
    setVolumeMutation,
    toggleMuteMutation,
  ]);
}
