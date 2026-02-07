import { useParams, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useArtistDetails } from '@/api/hooks/useArtistDetails';
import { useAlbumsByArtist } from '@/api/hooks/useAlbums';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { MediaImage } from '@/components/media/MediaImage';
import { ArtistActions } from './ArtistActions';
import { ArtistMetadata } from './ArtistMetadata';
import { AlbumCard } from './AlbumCard';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getFanartUrl, getClearLogoUrl } from '@/lib/image-utils';

export function ArtistDetails() {
  const params = useParams({ strict: false });
  const artistId = params.artistId ? Number(params.artistId) : undefined;
  const albumId = params.albumId;

  const { data: artist, isLoading, isError, error } = useArtistDetails(artistId);
  const { data: albums = [] } = useAlbumsByArtist(artistId);
  const { setItems } = useBreadcrumbs();

  // Set breadcrumbs when artist data is loaded
  useEffect(() => {
    if (!albumId && artist) {
      setItems([{ label: 'Music', href: '/music' }, { label: artist.artist }]);
    } else if (!albumId) {
      setItems([{ label: 'Music', href: '/music' }, { label: 'Loading...' }]);
    }
  }, [albumId, artist, setItems]);

  // If we're on an album route, render the outlet instead
  if (albumId) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="relative h-[50vh] w-full">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="container space-y-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !artist) {
    return (
      <div className="container space-y-4 py-6">
        <ErrorState
          title="Error loading artist"
          error={error ?? undefined}
          message="Artist not found"
        />
      </div>
    );
  }

  const fanartUrl = getFanartUrl(artist.art);
  const clearLogoUrl = getClearLogoUrl(artist.art);

  return (
    <div className="min-h-screen">
      {/* Backdrop with gradient overlay */}
      {fanartUrl && (
        <div className="relative h-[50vh] w-full">
          <MediaImage
            src={fanartUrl}
            alt={artist.artist}
            aspectRatio="fanart"
            loading="eager"
            placeholderType="fanart"
            className="h-full w-full"
          />
          <div className="from-background via-background/60 absolute inset-0 bg-gradient-to-t to-transparent transition-colors duration-300" />

          {/* Clearlogo overlay */}
          {clearLogoUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={clearLogoUrl}
                alt={artist.artist}
                className="max-h-[40%] max-w-[80%] object-contain drop-shadow-2xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="container space-y-4 py-6">
        <div className="space-y-6">
          {/* Artist name */}
          <div>
            <h1 className="mb-2 text-4xl font-bold">{artist.artist}</h1>
          </div>

          {/* Actions */}
          <ArtistActions artist={artist} />

          {/* Metadata */}
          <ArtistMetadata artist={artist} />

          {/* Albums */}
          {albums.length > 0 && (
            <div className="pt-6">
              <h2 className="mb-4 text-2xl font-bold">Albums</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {albums.map((album) => (
                  <AlbumCard key={album.albumid} album={album} showArtist={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
