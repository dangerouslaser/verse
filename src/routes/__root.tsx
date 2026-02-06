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
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useKodiWebSocket } from '@/api/hooks/useKodiWebSocket';

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

  return (
    <BreadcrumbProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadcrumbs />
          </header>
          <div className="min-w-0 flex-1 overflow-auto">
            <Outlet />
          </div>
          <NowPlaying />
        </SidebarInset>
      </SidebarProvider>
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
