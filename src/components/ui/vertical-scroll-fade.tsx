import * as React from 'react';
import { cn } from '@/lib/utils';

interface VerticalScrollFadeProps {
  children: React.ReactNode;
  className?: string;
  onScrollStateChange?: (state: { canScrollUp: boolean; canScrollDown: boolean }) => void;
}

export function VerticalScrollFade({
  children,
  className,
  onScrollStateChange,
}: VerticalScrollFadeProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = React.useState(false);
  const [canScrollDown, setCanScrollDown] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const newCanScrollUp = scrollTop > 0;
    const newCanScrollDown = scrollTop + clientHeight < scrollHeight - 1;

    setCanScrollUp(newCanScrollUp);
    setCanScrollDown(newCanScrollDown);
    onScrollStateChange?.({ canScrollUp: newCanScrollUp, canScrollDown: newCanScrollDown });
  }, [onScrollStateChange]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    // Also check on content changes with MutationObserver
    const observer = new MutationObserver(checkScroll);
    observer.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      observer.disconnect();
    };
  }, [checkScroll]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Top gradient fade */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-10 h-12 transition-opacity duration-300',
          canScrollUp ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background:
            'linear-gradient(to bottom, var(--color-background) 0%, color-mix(in srgb, var(--color-background) 50%, transparent) 50%, transparent 100%)',
        }}
      />

      {/* Scroll container */}
      <div
        ref={scrollRef}
        data-scroll-container
        className={cn('min-w-0 flex-1 overflow-auto', className)}
      >
        {children}
      </div>

      {/* Bottom gradient fade */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 transition-opacity duration-300',
          canScrollDown ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background:
            'linear-gradient(to top, var(--color-background) 0%, color-mix(in srgb, var(--color-background) 50%, transparent) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}
