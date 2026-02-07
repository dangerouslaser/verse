import { useState } from 'react';
import { Download, ImageIcon, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ArtworkTypeConfig {
  key: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
}

interface ArtworkManagementTabProps {
  artworkTypes: readonly ArtworkTypeConfig[];
  getArtworkUrl: (key: string) => string | undefined;
  onSaveArtwork: (key: string, url: string) => void;
  isSaving: boolean;
  gridCols?: string;
  onFetchArtwork?: () => void;
}

export function ArtworkManagementTab({
  artworkTypes,
  getArtworkUrl,
  onSaveArtwork,
  isSaving,
  gridCols = 'md:grid-cols-2 lg:grid-cols-3',
  onFetchArtwork,
}: ArtworkManagementTabProps) {
  const [artworkDialogOpen, setArtworkDialogOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<{ type: string; url: string } | null>(null);

  const handleEditArtwork = (key: string, currentUrl: string | undefined) => {
    setEditingArtwork({ type: key, url: currentUrl ?? '' });
    setArtworkDialogOpen(true);
  };

  const handleSave = () => {
    if (editingArtwork) {
      onSaveArtwork(editingArtwork.type, editingArtwork.url);
      setArtworkDialogOpen(false);
      setEditingArtwork(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Artwork Management</CardTitle>
          {onFetchArtwork && (
            <Button variant="outline" onClick={onFetchArtwork}>
              <Download className="mr-2 h-4 w-4" />
              Fetch Artwork
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className={`grid gap-6 ${gridCols}`}>
            {artworkTypes.map(({ key, label }) => {
              const url = getArtworkUrl(key);
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{label}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleEditArtwork(key, url);
                      }}
                    >
                      <ImageIcon className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  {url ? (
                    <img
                      src={url}
                      alt={label}
                      className="h-32 w-full rounded-md border object-cover"
                    />
                  ) : (
                    <div className="bg-muted flex h-32 w-full items-center justify-center rounded-md border">
                      <span className="text-muted-foreground text-sm">No {label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={artworkDialogOpen} onOpenChange={setArtworkDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit {artworkTypes.find((t) => t.key === editingArtwork?.type)?.label}
            </DialogTitle>
            <DialogDescription>
              Enter the URL for the artwork image. This will update the Kodi database.
              {(() => {
                const artworkType = artworkTypes.find((t) => t.key === editingArtwork?.type);
                return artworkType
                  ? ` Recommended size: ${String(artworkType.width)}×${String(artworkType.height)}px`
                  : '';
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={editingArtwork?.url ?? ''}
                onChange={(e) => {
                  setEditingArtwork((prev) => (prev ? { ...prev, url: e.target.value } : null));
                }}
                placeholder="https://..."
              />
            </div>
            {editingArtwork?.url && (
              <div className="space-y-2">
                <Label>Preview</Label>
                {(() => {
                  const artworkType = artworkTypes.find((t) => t.key === editingArtwork.type);
                  const isPortrait = artworkType && artworkType.height > artworkType.width;
                  return (
                    <div
                      className="bg-muted/50 relative flex items-center justify-center overflow-hidden rounded-md border"
                      style={{
                        aspectRatio: artworkType?.aspectRatio ?? '16/9',
                        maxHeight: isPortrait ? '400px' : '300px',
                        width: isPortrait ? 'auto' : '100%',
                        margin: isPortrait ? '0 auto' : undefined,
                      }}
                    >
                      <img
                        src={editingArtwork.url}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setArtworkDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !editingArtwork?.url}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
