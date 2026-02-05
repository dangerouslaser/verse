/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import { NowPlaying } from './NowPlaying';
import userEvent from '@testing-library/user-event';
import * as playbackHooks from '@/api/hooks/usePlayback';

// Mock the playback hooks
vi.mock('@/api/hooks/usePlayback', () => ({
  useActivePlayers: vi.fn(),
  usePlayerProperties: vi.fn(),
  usePlayerItem: vi.fn(),
  usePlayPause: vi.fn(),
  useStop: vi.fn(),
  useSkipNext: vi.fn(),
  useSkipPrevious: vi.fn(),
  useSeek: vi.fn(),
  useVolume: vi.fn(),
  useSetVolume: vi.fn(),
  useToggleMute: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock the Zustand store
vi.mock('@/stores/player', () => ({
  usePlayerStore: vi.fn(() => ({
    setPlayer: vi.fn(),
    setCurrentItem: vi.fn(),
    syncPlaybackState: vi.fn(),
    setVolume: vi.fn(),
  })),
}));

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

// Mock child components to simplify tests
vi.mock('./SeekBar', () => ({
  SeekBar: ({ percentage }: { percentage: number }) => (
    <div data-testid="seek-bar" data-percentage={percentage} />
  ),
}));

vi.mock('./VolumeControl', () => ({
  VolumeControl: () => <div data-testid="volume-control" />,
}));

// Mock image utils
vi.mock('@/lib/image-utils', () => ({
  getImageUrl: (url: string) => url,
}));

const defaultMutationReturn = {
  mutate: vi.fn(),
  isPending: false,
  mutateAsync: vi.fn(),
  isIdle: true,
  isSuccess: false,
  isError: false,
  data: undefined,
  error: null,
  reset: vi.fn(),
  status: 'idle',
  variables: undefined,
  failureCount: 0,
  failureReason: null,
  context: undefined,
  isPaused: false,
  submittedAt: 0,
};

describe('NowPlaying', () => {
  const mockPlayPauseMutate = vi.fn();
  const mockStopMutate = vi.fn();
  const mockSkipNextMutate = vi.fn();
  const mockSkipPrevMutate = vi.fn();
  const mockSeekMutate = vi.fn();
  const mockSetVolumeMutate = vi.fn();
  const mockToggleMuteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(playbackHooks.usePlayPause).mockReturnValue({
      ...defaultMutationReturn,
      mutate: mockPlayPauseMutate,
    } as any);

    vi.mocked(playbackHooks.useStop).mockReturnValue({
      ...defaultMutationReturn,
      mutate: mockStopMutate,
    } as any);

    vi.mocked(playbackHooks.useSkipNext).mockReturnValue({
      ...defaultMutationReturn,
      mutate: mockSkipNextMutate,
    } as any);

    vi.mocked(playbackHooks.useSkipPrevious).mockReturnValue({
      ...defaultMutationReturn,
      mutate: mockSkipPrevMutate,
    } as any);

    vi.mocked(playbackHooks.useSeek).mockReturnValue({
      ...defaultMutationReturn,
      mutate: mockSeekMutate,
    } as any);

    vi.mocked(playbackHooks.useSetVolume).mockReturnValue({
      ...defaultMutationReturn,
      mutate: mockSetVolumeMutate,
    } as any);

    vi.mocked(playbackHooks.useToggleMute).mockReturnValue({
      ...defaultMutationReturn,
      mutate: mockToggleMuteMutate,
    } as any);

    vi.mocked(playbackHooks.usePlayerItem).mockReturnValue({
      data: undefined,
    } as any);

    vi.mocked(playbackHooks.useVolume).mockReturnValue({
      data: { volume: 80, muted: false },
    } as any);
  });

  it('returns null when no active player', () => {
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: undefined,
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: undefined,
    } as any);

    const { container } = render(<NowPlaying />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when no player properties', () => {
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: [{ playerid: 1, type: 'video' }],
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: undefined,
    } as any);

    const { container } = render(<NowPlaying />);
    expect(container.firstChild).toBeNull();
  });

  it('renders playing state correctly', () => {
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: [{ playerid: 1, type: 'video' }],
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: {
        speed: 1,
        percentage: 50,
        time: { hours: 0, minutes: 30, seconds: 15 },
        totaltime: { hours: 1, minutes: 0, seconds: 30 },
      },
    } as any);
    vi.mocked(playbackHooks.usePlayerItem).mockReturnValue({
      data: {
        item: {
          id: 1,
          type: 'movie',
          label: 'Test Movie',
          title: 'Test Movie',
        },
      },
    } as any);

    render(<NowPlaying />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('renders paused state correctly', () => {
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: [{ playerid: 1, type: 'video' }],
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: {
        speed: 0,
        percentage: 25,
        time: { hours: 0, minutes: 15, seconds: 0 },
        totaltime: { hours: 1, minutes: 0, seconds: 0 },
      },
    } as any);

    render(<NowPlaying />);

    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('handles play/pause button click', async () => {
    const user = userEvent.setup();
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: [{ playerid: 1, type: 'video' }],
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: {
        speed: 1,
        percentage: 50,
        time: { hours: 0, minutes: 30, seconds: 0 },
        totaltime: { hours: 1, minutes: 0, seconds: 0 },
      },
    } as any);

    render(<NowPlaying />);

    const playPauseButton = screen.getByRole('button', { name: 'Pause' });
    await user.click(playPauseButton);

    expect(mockPlayPauseMutate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        onError: expect.any(Function),
      })
    );
  });

  it('handles stop button click', async () => {
    const user = userEvent.setup();
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: [{ playerid: 1, type: 'video' }],
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: {
        speed: 1,
        percentage: 50,
        time: { hours: 0, minutes: 30, seconds: 0 },
        totaltime: { hours: 1, minutes: 0, seconds: 0 },
      },
    } as any);

    render(<NowPlaying />);

    const stopButton = screen.getByRole('button', { name: 'Stop' });
    await user.click(stopButton);

    expect(mockStopMutate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        onError: expect.any(Function),
      })
    );
  });

  it('disables buttons when mutations are pending', () => {
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: [{ playerid: 1, type: 'video' }],
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: {
        speed: 1,
        percentage: 50,
        time: { hours: 0, minutes: 0, seconds: 0 },
        totaltime: { hours: 1, minutes: 0, seconds: 0 },
      },
    } as any);
    vi.mocked(playbackHooks.usePlayPause).mockReturnValue({
      ...defaultMutationReturn,
      mutate: mockPlayPauseMutate,
      isPending: true,
    } as any);
    vi.mocked(playbackHooks.useStop).mockReturnValue({
      ...defaultMutationReturn,
      mutate: mockStopMutate,
      isPending: true,
    } as any);

    render(<NowPlaying />);

    const playPauseButton = screen.getByRole('button', { name: 'Pause' });
    const stopButton = screen.getByRole('button', { name: 'Stop' });

    expect(playPauseButton).toBeDisabled();
    expect(stopButton).toBeDisabled();
  });

  it('renders seek bar with correct percentage', () => {
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: [{ playerid: 1, type: 'video' }],
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: {
        speed: 1,
        percentage: 75,
        time: { hours: 0, minutes: 45, seconds: 0 },
        totaltime: { hours: 1, minutes: 0, seconds: 0 },
      },
    } as any);

    render(<NowPlaying />);

    const seekBar = screen.getByTestId('seek-bar');
    expect(seekBar).toHaveAttribute('data-percentage', '75');
  });

  it('displays item title from player item data', () => {
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: [{ playerid: 1, type: 'video' }],
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: {
        speed: 1,
        percentage: 50,
        time: { hours: 0, minutes: 30, seconds: 0 },
        totaltime: { hours: 1, minutes: 0, seconds: 0 },
      },
    } as any);
    vi.mocked(playbackHooks.usePlayerItem).mockReturnValue({
      data: {
        item: {
          id: 42,
          type: 'movie',
          label: 'The Matrix',
          title: 'The Matrix',
        },
      },
    } as any);

    render(<NowPlaying />);

    expect(screen.getByText('The Matrix')).toBeInTheDocument();
    expect(screen.getByText('Movie')).toBeInTheDocument();
  });

  it('displays episode title with show name', () => {
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: [{ playerid: 1, type: 'video' }],
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: {
        speed: 1,
        percentage: 50,
        time: { hours: 0, minutes: 20, seconds: 0 },
        totaltime: { hours: 0, minutes: 45, seconds: 0 },
      },
    } as any);
    vi.mocked(playbackHooks.usePlayerItem).mockReturnValue({
      data: {
        item: {
          id: 10,
          type: 'episode',
          label: 'Pilot',
          title: 'Pilot',
          showtitle: 'Breaking Bad',
          season: 1,
          episode: 1,
        },
      },
    } as any);

    render(<NowPlaying />);

    expect(screen.getByText('Pilot')).toBeInTheDocument();
    expect(screen.getByText('Breaking Bad - S01E01')).toBeInTheDocument();
  });

  it('handles next and previous button clicks', async () => {
    const user = userEvent.setup();
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: [{ playerid: 1, type: 'video' }],
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: {
        speed: 1,
        percentage: 50,
        time: { hours: 0, minutes: 30, seconds: 0 },
        totaltime: { hours: 1, minutes: 0, seconds: 0 },
      },
    } as any);

    render(<NowPlaying />);

    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);
    expect(mockSkipNextMutate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ onError: expect.any(Function) })
    );

    const prevButton = screen.getByRole('button', { name: 'Previous' });
    await user.click(prevButton);
    expect(mockSkipPrevMutate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ onError: expect.any(Function) })
    );
  });

  it('shows fallback title when no player item data', () => {
    vi.mocked(playbackHooks.useActivePlayers).mockReturnValue({
      data: [{ playerid: 1, type: 'audio' }],
    } as any);
    vi.mocked(playbackHooks.usePlayerProperties).mockReturnValue({
      data: {
        speed: 1,
        percentage: 50,
        time: { hours: 0, minutes: 2, seconds: 30 },
        totaltime: { hours: 0, minutes: 5, seconds: 0 },
      },
    } as any);
    vi.mocked(playbackHooks.usePlayerItem).mockReturnValue({
      data: undefined,
    } as any);

    render(<NowPlaying />);

    expect(screen.getByText('Playing')).toBeInTheDocument();
    expect(screen.getByText('audio')).toBeInTheDocument();
  });
});
