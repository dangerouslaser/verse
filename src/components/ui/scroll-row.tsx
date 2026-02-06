import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScrollRowProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollRow({ children, className }: ScrollRowProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Re-check when children change (e.g., data loads)
  React.useEffect(() => {
    checkScroll();
  }, [children, checkScroll]);

  return (
    <div className="relative">
      {/* Left gradient fade */}
      <div
        className={cn(
          'pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16 transition-opacity duration-300',
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background:
            'linear-gradient(to right, hsl(var(--color-background)) 0%, hsl(var(--color-background) / 0.5) 50%, transparent 100%)',
        }}
      />

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={cn('scrollbar-hide flex gap-3 overflow-x-auto pb-2', className)}
      >
        {children}
      </div>

      {/* Right gradient fade */}
      <div
        className={cn(
          'pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 transition-opacity duration-300',
          canScrollRight ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background:
            'linear-gradient(to left, hsl(var(--color-background)) 0%, hsl(var(--color-background) / 0.5) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}
