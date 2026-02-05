import { useEffect, useRef } from 'react';
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

  // Store mutation functions in refs so the keydown effect doesn't re-run on every render
  const mutationsRef = useRef({
    playPause: playPauseMutation.mutate,
    stop: stopMutation.mutate,
    skipNext: skipNextMutation.mutate,
    skipPrev: skipPrevMutation.mutate,
    seek: seekMutation.mutate,
    setVolume: setVolumeMutation.mutate,
    toggleMute: toggleMuteMutation.mutate,
  });

  useEffect(() => {
    mutationsRef.current = {
      playPause: playPauseMutation.mutate,
      stop: stopMutation.mutate,
      skipNext: skipNextMutation.mutate,
      skipPrev: skipPrevMutation.mutate,
      seek: seekMutation.mutate,
      setVolume: setVolumeMutation.mutate,
      toggleMute: toggleMuteMutation.mutate,
    };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      const { playerId, percentage, volume } = usePlayerStore.getState();
      if (playerId === undefined) return;

      const m = mutationsRef.current;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          m.playPause(playerId);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          m.seek({
            playerId,
            value: Math.max(0, percentage - 2),
          });
          break;

        case 'ArrowRight':
          e.preventDefault();
          m.seek({
            playerId,
            value: Math.min(100, percentage + 2),
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          m.setVolume(Math.min(100, volume + 5));
          break;

        case 'ArrowDown':
          e.preventDefault();
          m.setVolume(Math.max(0, volume - 5));
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          m.toggleMute();
          break;

        case 'n':
        case 'N':
          e.preventDefault();
          m.skipNext(playerId);
          break;

        case 'p':
        case 'P':
          e.preventDefault();
          m.skipPrev(playerId);
          break;

        case 's':
        case 'S':
          e.preventDefault();
          m.stop(playerId);
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
  }, [navigate]);
}
