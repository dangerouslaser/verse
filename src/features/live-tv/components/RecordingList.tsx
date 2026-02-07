import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { useRecordings } from '@/api/hooks/usePVR';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { RecordingCard } from './RecordingCard';
import { Search } from 'lucide-react';

export function RecordingList() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: recordings, isLoading, isError, error } = useRecordings();

  const { setItems } = useBreadcrumbs();

  useEffect(() => {
    setItems([{ label: 'Live TV', href: '/live-tv' }, { label: 'Recordings' }]);
  }, [setItems]);

  const filteredRecordings = (recordings ?? []).filter((rec) => {
    if (rec.isdeleted) return false;
    if (!debouncedSearch) return true;
    const query = debouncedSearch.toLowerCase();
    return (
      rec.title.toLowerCase().includes(query) ||
      (rec.channel?.toLowerCase().includes(query) ?? false)
    );
  });

  if (isLoading) {
    return (
      <div className="container space-y-4 py-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container space-y-4 py-6">
        <ErrorState title="Error loading recordings" error={error} />
      </div>
    );
  }

  if (!recordings || recordings.length === 0) {
    return (
      <div className="container space-y-4 py-6">
        <EmptyState title="No recordings" description="No PVR recordings are available." />
      </div>
    );
  }

  return (
    <div className="container space-y-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search recordings..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            className="w-64 pl-8"
          />
        </div>

        <div className="bg-muted/50 flex h-11 items-center rounded-lg border px-3">
          <p className="text-muted-foreground text-sm">
            {filteredRecordings.length.toLocaleString()} recordings
          </p>
        </div>
      </div>

      {/* Grid */}
      {filteredRecordings.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
          {filteredRecordings.map((recording) => (
            <RecordingCard key={recording.recordingid} recording={recording} />
          ))}
        </div>
      ) : (
        <EmptyState title="No results found" description="Try adjusting your search criteria." />
      )}
    </div>
  );
}
