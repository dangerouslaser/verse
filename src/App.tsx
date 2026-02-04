import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold">Verse</h1>
            <p className="text-muted-foreground">Modern Kodi Web Interface</p>
          </header>
          <main>
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <h2 className="mb-4 text-2xl font-semibold">Welcome to Verse</h2>
              <p className="mb-4">
                Phase 0 foundation is complete. The modern tech stack is ready:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>React 18 + TypeScript</li>
                <li>Vite for blazing-fast development</li>
                <li>Tailwind CSS for styling</li>
                <li>TanStack Query for data fetching</li>
                <li>Vitest for testing</li>
                <li>ESLint + Prettier for code quality</li>
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">
                Next up: Phase 1 - Music Library implementation
              </p>
            </div>
          </main>
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
