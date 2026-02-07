import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { MediaPoster } from '@/components/media/MediaPoster';
import type { KodiRecording } from '@/api/types/pvr';
import { formatDate, formatRuntime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface RecordingCardProps {
  recording: KodiRecording;
  className?: string;
}

export function RecordingCard({ recording, className }: RecordingCardProps) {
  return (
    <Link
      to="/live-tv/recordings/$recordingId"
      params={{ recordingId: recording.recordingid.toString() }}
      className={cn('group block w-full', className)}
    >
      <Card className="overflow-hidden border-0 bg-transparent shadow-none transition-transform duration-300 hover:scale-105">
        <CardContent className="p-0">
          <div className="relative">
            <MediaPoster art={recording.art} title={recording.title} />

            {/* Resume indicator */}
            {recording.resume && recording.resume.position > 0 && (
              <div className="absolute right-0 bottom-0 left-0">
                <div
                  className="bg-primary h-1"
                  style={{
                    width: `${String(Math.round((recording.resume.position / recording.resume.total) * 100))}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-2 space-y-1 px-1">
            <h3 className="group-hover:text-primary line-clamp-2 leading-tight font-semibold">
              {recording.title}
            </h3>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              {recording.channel && <span>{recording.channel}</span>}
              {recording.starttime && (
                <>
                  <span>&middot;</span>
                  <span>{formatDate(recording.starttime)}</span>
                </>
              )}
            </div>
            {recording.runtime && recording.runtime > 0 && (
              <div className="text-muted-foreground text-xs">
                {formatRuntime(recording.runtime)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
