import { useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Settings as SettingsIcon, ChevronRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { SidebarSettings } from '@/features/settings/components/SidebarSettings';
import { TMDBSettings } from '@/features/settings/components/TMDBSettings';

function Settings() {
  const { setItems } = useBreadcrumbs();

  useEffect(() => {
    setItems([{ label: 'Settings' }]);
  }, [setItems]);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Kodi Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Kodi Settings
          </CardTitle>
          <CardDescription>Configure your Kodi media center directly from Verse</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/settings/kodi">
            <Button variant="outline" className="w-full justify-between">
              Open Kodi Settings
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Sidebar Navigation */}
      <SidebarSettings />

      {/* API Keys Section */}
      <TMDBSettings />

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Verse</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Verse is a modern web interface for Kodi. Built with React, TypeScript, and Tailwind
            CSS.
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://github.com/bryanhoban/verse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
            >
              GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/settings/')({
  component: Settings,
});
