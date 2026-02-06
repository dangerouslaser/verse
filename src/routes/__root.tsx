import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppBreadcrumbs } from '@/components/layout/AppBreadcrumbs';
import { BreadcrumbProvider } from '@/components/layout/BreadcrumbContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeProvider } from '@/components/theme-provider';
import { NowPlaying } from '@/components/player/NowPlaying';
import { VerticalScrollFade } from '@/components/ui/vertical-scroll-fade';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useKodiWebSocket } from '@/api/hooks/useKodiWebSocket';
import { cn } from '@/lib/utils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppShell() {
  useKeyboardShortcuts();
  useKodiWebSocket();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScrollStateChange = useCallback(
    ({ canScrollUp }: { canScrollUp: boolean; canScrollDown: boolean }) => {
      setIsScrolled(canScrollUp);
    },
    []
  );

  return (
    <BreadcrumbProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <header
            className={cn(
              'flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[border-color] duration-300',
              isScrolled ? 'border-transparent' : 'border-border'
            )}
          >
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadcrumbs />
            <div className="ml-auto">
              <SearchTrigger />
            </div>
          </header>
          <VerticalScrollFade onScrollStateChange={handleScrollStateChange}>
            <Outlet />
          </VerticalScrollFade>
          <NowPlaying />
        </SidebarInset>
      </SidebarProvider>
      <GlobalSearch />
    </BreadcrumbProvider>
  );
}

function RootComponent() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AppShell />
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
        <TanStackRouterDevtools position="bottom-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
