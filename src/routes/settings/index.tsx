import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import {
  Key,
  ExternalLink,
  Check,
  Loader2,
  AlertCircle,
  Settings as SettingsIcon,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTmdbApiKey, setTmdbApiKey } from '@/lib/settings';
import { tmdb } from '@/api/tmdb';
import { toast } from 'sonner';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { SidebarSettings } from '@/features/settings/components/SidebarSettings';

function Settings() {
  const { setItems } = useBreadcrumbs();

  useEffect(() => {
    setItems([{ label: 'Settings' }]);
  }, [setItems]);

  // Initialize state directly from localStorage
  const savedKey = getTmdbApiKey();
  const [tmdbKey, setTmdbKey] = useState(savedKey ?? '');
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(savedKey ? true : null);

  // Validate API key mutation
  const validateMutation = useMutation({
    mutationFn: (apiKey: string) => tmdb.validateApiKey(apiKey),
    onSuccess: (isValid) => {
      setIsKeyValid(isValid);
      if (isValid) {
        setTmdbApiKey(tmdbKey);
        toast.success('API Key Saved', {
          description: 'Your TMDB API key has been validated and saved.',
        });
      } else {
        toast.error('Invalid API Key', {
          description: 'The API key could not be validated. Please check and try again.',
        });
      }
    },
    onError: () => {
      setIsKeyValid(false);
      toast.error('Validation Failed', {
        description: 'Could not validate the API key. Please check your connection.',
      });
    },
  });

  const handleSaveApiKey = () => {
    if (!tmdbKey.trim()) {
      // Clear the key
      setTmdbApiKey(null);
      setIsKeyValid(null);
      toast.success('API Key Removed', {
        description: 'Your TMDB API key has been removed.',
      });
      return;
    }

    validateMutation.mutate(tmdbKey);
  };

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>Configure API keys for external services used by Verse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* TMDB API Key */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tmdb-key" className="text-base font-medium">
                  TMDB API Key
                </Label>
                <p className="text-muted-foreground text-sm">
                  Used for fetching movie and TV show artwork
                </p>
              </div>
              {isKeyValid !== null && (
                <Badge variant={isKeyValid ? 'default' : 'destructive'}>
                  {isKeyValid ? 'Valid' : 'Invalid'}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                id="tmdb-key"
                type="password"
                value={tmdbKey}
                onChange={(e) => {
                  setTmdbKey(e.target.value);
                  setIsKeyValid(null); // Reset validation state on change
                }}
                placeholder="Enter your TMDB API key"
                className="flex-1"
              />
              <Button onClick={handleSaveApiKey} disabled={validateMutation.isPending}>
                {validateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                To get a TMDB API key, create a free account at{' '}
                <a
                  href="https://www.themoviedb.org/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 hover:underline"
                >
                  themoviedb.org
                  <ExternalLink className="h-3 w-3" />
                </a>
                , then go to Settings → API to request an API key.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

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
