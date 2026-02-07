import { useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { Calendar, Clock, Film, Play } from 'lucide-react';
import { useRecordingDetails } from '@/api/hooks/usePVR';
import { usePlay } from '@/api/hooks/usePlayback';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaImage } from '@/components/media/MediaImage';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { getFanartUrl, getPosterUrl } from '@/lib/image-utils';
import { formatRuntime, formatDate, joinArray } from '@/lib/format';
import { toast } from 'sonner';

export function RecordingDetails() {
  const { recordingId } = useParams({ strict: false });
  const recordingIdNum = parseInt(recordingId ?? '0', 10);

  const { data: recording, isLoading, isError, error } = useRecordingDetails(recordingIdNum);
  const play = usePlay();

  const { setItems } = useBreadcrumbs();

  useEffect(() => {
    if (recording) {
      setItems([
        { label: 'Live TV', href: '/live-tv' },
        { label: 'Recordings', href: '/live-tv/recordings' },
        { label: recording.title },
      ]);
    } else {
      setItems([
        { label: 'Live TV', href: '/live-tv' },
        { label: 'Recordings', href: '/live-tv/recordings' },
        { label: 'Loading...' },
      ]);
    }
  }, [recording, setItems]);

  const handlePlay = (resume: boolean) => {
    if (!recording?.file) return;
    play.mutate(
      {
        item: { file: recording.file },
        options: resume ? { resume: true } : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Playing', {
            description: `Now playing: ${recording.title}`,
          });
        },
        onError: (err) => {
          toast.error('Playback Error', {
            description: err instanceof Error ? err.message : 'Failed to start playback',
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container space-y-6 py-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !recording) {
    return (
      <div className="container py-6">
        <ErrorState
          title="Error loading recording"
          error={error ?? undefined}
          message="Recording not found"
          centered
        />
      </div>
    );
  }

  const fanartUrl = getFanartUrl(recording.art);
  const posterUrl = getPosterUrl(recording.art);
  const genres = joinArray(recording.genre);
  const hasResume = recording.resume && recording.resume.position > 0;

  return (
    <div className="container space-y-6 py-6">
      {/* Hero Section */}
      <div className="bg-muted relative overflow-hidden rounded-lg">
        {fanartUrl ? (
          <>
            <MediaImage
              src={fanartUrl}
              alt=""
              aspectRatio="fanart"
              loading="eager"
              placeholderType="fanart"
              className="h-64 w-full object-cover"
            />
            <div className="from-background via-background/80 absolute inset-0 bg-gradient-to-t to-transparent" />
          </>
        ) : (
          <div className="h-32 w-full" />
        )}

        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="flex items-end gap-6">
            {posterUrl ? (
              <MediaImage
                src={posterUrl}
                alt={recording.title}
                aspectRatio="poster"
                placeholderType="poster"
                className="h-48 w-32 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="bg-muted flex h-48 w-32 items-center justify-center rounded-lg">
                <Film className="text-muted-foreground h-12 w-12" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-3xl font-bold">{recording.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {recording.channel && <Badge variant="secondary">{recording.channel}</Badge>}
                {recording.starttime && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(recording.starttime)}
                  </Badge>
                )}
                {recording.runtime && recording.runtime > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRuntime(recording.runtime)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="hidden gap-2 md:flex">
              {hasResume && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handlePlay(true);
                  }}
                  disabled={play.isPending}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              )}
              <Button
                onClick={() => {
                  handlePlay(false);
                }}
                disabled={play.isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                {hasResume ? 'Play from Start' : 'Play'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile actions */}
      <div className="flex gap-2 md:hidden">
        {hasResume && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              handlePlay(true);
            }}
            disabled={play.isPending}
          >
            <Play className="mr-2 h-4 w-4" />
            Resume
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={() => {
            handlePlay(false);
          }}
          disabled={play.isPending}
        >
          <Play className="mr-2 h-4 w-4" />
          {hasResume ? 'Play from Start' : 'Play'}
        </Button>
      </div>

      {/* Details */}
      {recording.plot && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{recording.plot}</p>
          </CardContent>
        </Card>
      )}

      {genres && (
        <Card>
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <span className="text-muted-foreground text-sm">Genre</span>
              <p>{genres}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
