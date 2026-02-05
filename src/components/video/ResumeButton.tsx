import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/format';
import type { KodiResume } from '@/api/types/common';

interface ResumeButtonProps {
  resume: KodiResume;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

export function ResumeButton({
  resume,
  onClick,
  disabled = false,
  className,
  size = 'default',
  variant = 'secondary',
}: ResumeButtonProps) {
  // Convert resume position to time object format for formatting
  const position = resume.position;

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant={variant}
      className={cn('gap-2', className)}
    >
      <Play className="h-4 w-4" />
      <span>Resume ({formatTime(position)})</span>
    </Button>
  );
}
