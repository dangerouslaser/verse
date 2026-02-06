import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/stores/search';

/**
 * Detect if running on macOS for keyboard shortcut display.
 * Uses userAgent since userAgentData is not universally supported.
 */
function isMacOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

/**
 * Button that opens the global search dialog.
 * Shows keyboard shortcut hint (Cmd+K on Mac, Ctrl+K on Windows/Linux).
 */
export function SearchTrigger() {
  const open = useSearchStore((s) => s.open);

  const shortcutKey = isMacOS() ? '⌘' : 'Ctrl';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={open}
      className="text-muted-foreground hover:text-foreground gap-2"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline-block">Search</span>
      <kbd className="bg-muted pointer-events-none hidden h-5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-flex">
        {shortcutKey}K
      </kbd>
    </Button>
  );
}
