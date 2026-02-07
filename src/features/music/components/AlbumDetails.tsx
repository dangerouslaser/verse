import { useParams, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAlbumDetails } from '@/api/hooks/useAlbumDetails';
import { useSongsByAlbum } from '@/api/hooks/useSongs';
import { usePlaySong } from '@/api/hooks/useMusicPlayback';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { MediaImage } from '@/components/media/MediaImage';
import { AlbumActions } from './AlbumActions';
import { AlbumMetadata } from './AlbumMetadata';
import { TrackList } from './TrackList';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getThumbUrl, getFanartUrl } from '@/lib/image-utils';
import { toast } from 'sonner';

export function AlbumDetails() {
  const params = useParams({ strict: false });
  const artistId = params.artistId;
  const albumId = params.albumId ? Number(params.albumId) : undefined;

  const { data: album, isLoading, isError, error } = useAlbumDetails(albumId);
  const { data: songs = [] } = useSongsByAlbum(albumId);
  const playMutation = usePlaySong();
  const { setItems } = useBreadcrumbs();

  // Set breadcrumbs when album data is loaded
  useEffect(() => {
    if (album) {
      const artistName = album.displayartist || 'Unknown Artist';
      const artistHref = artistId ? `/music/${artistId}` : '/music';

      setItems([
        { label: 'Music', href: '/music' },
        { label: artistName, href: artistHref },
        { label: album.title },
      ]);
    } else {
      setItems([{ label: 'Music', href: '/music' }, { label: 'Loading...' }]);
    }
  }, [album, artistId, setItems]);

  const handlePlaySong = (songId: number) => {
    playMutation.mutate(songId, {
      onSuccess: () => {
        const song = songs.find((s) => s.songid === songId);
        toast.success('Playing', {
          description: song ? `Now playing: ${song.title}` : 'Now playing',
        });
      },
      onError: (err: unknown) => {
        toast.error('Playback Error', {
          description: err instanceof Error ? err.message : 'Failed to start playback',
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container space-y-4 py-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <Skeleton className="aspect-square w-full md:w-64" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !album) {
    return (
      <div className="container space-y-4 py-6">
        <ErrorState
          title="Error loading album"
          error={error ?? undefined}
          message="Album not found"
        />
      </div>
    );
  }

  const thumbUrl = getThumbUrl(album.art);
  const fanartUrl = getFanartUrl(album.art);

  return (
    <div className="min-h-screen">
      {/* Optional backdrop for visual appeal */}
      {fanartUrl && (
        <div className="absolute inset-x-0 top-0 -z-10 h-[40vh] opacity-20">
          <MediaImage
            src={fanartUrl}
            alt={album.title}
            aspectRatio="fanart"
            loading="eager"
            placeholderType="fanart"
            className="h-full w-full blur-xl"
          />
          <div className="to-background absolute inset-0 bg-gradient-to-b from-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="container space-y-4 py-6">
        <div className="space-y-6">
          {/* Album info section */}
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Album art */}
            <div className="w-full md:w-64 md:flex-shrink-0">
              <MediaImage
                src={thumbUrl}
                alt={album.title}
                aspectRatio="square"
                loading="eager"
                placeholderType="thumb"
                className="rounded-lg shadow-xl"
              />
            </div>

            {/* Album details */}
            <div className="flex-1 space-y-4">
              {/* Title and artist */}
              <div>
                <h1 className="mb-2 text-4xl font-bold">{album.title}</h1>
                {album.displayartist && artistId && (
                  <Link
                    to="/music/$artistId"
                    params={{ artistId }}
                    className="text-muted-foreground hover:text-primary text-xl"
                  >
                    {album.displayartist}
                  </Link>
                )}
              </div>

              {/* Actions */}
              <AlbumActions album={album} />

              {/* Metadata */}
              <AlbumMetadata album={album} />
            </div>
          </div>

          {/* Track list */}
          {songs.length > 0 && (
            <div className="pt-6">
              <h2 className="mb-4 text-2xl font-bold">Tracks</h2>
              <TrackList songs={songs} onPlaySong={handlePlaySong} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
