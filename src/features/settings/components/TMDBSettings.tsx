import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Key, ExternalLink, Check, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTmdbApiKey, setTmdbApiKey } from '@/lib/settings';
import { tmdb } from '@/api/tmdb';
import { toast } from 'sonner';

export function TMDBSettings() {
  const savedKey = getTmdbApiKey();
  const [tmdbKey, setTmdbKey] = useState(savedKey ?? '');
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(savedKey ? true : null);

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </CardTitle>
        <CardDescription>Configure API keys for external services used by Verse</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
                setIsKeyValid(null);
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
  );
}
