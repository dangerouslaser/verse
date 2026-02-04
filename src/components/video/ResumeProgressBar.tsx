import type { KodiResume } from '@/api/types/common';
import { cn } from '@/lib/utils';

interface ResumeProgressBarProps {
  resume: KodiResume;
  className?: string;
}

/**
 * Progress bar showing resume position for partially watched content
 */
export function ResumeProgressBar({ resume, className }: ResumeProgressBarProps) {
  const percentage = resume.total > 0 ? (resume.position / resume.total) * 100 : 0;

  return (
    <div className={cn('h-1 w-full overflow-hidden rounded-full bg-black/60', className)}>
      <div
        className="bg-primary h-full transition-all"
        style={{ width: `${String(percentage)}%` }}
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
        aria-label={`${String(Math.round(percentage))}% watched`}
      />
    </div>
  );
}
