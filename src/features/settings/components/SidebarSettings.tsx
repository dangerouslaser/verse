import { useCallback, useState } from 'react';
import { ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  buildSidebarConfig,
  DEFAULT_NAVIGATION,
  NAV_ITEM_BY_ID,
  saveSidebarNavigation,
} from '@/components/layout/navigation';
import type { SidebarNavItem } from '@/lib/settings';
import { toast } from 'sonner';

export function SidebarSettings() {
  const [items, setItems] = useState<SidebarNavItem[]>(buildSidebarConfig);

  const moveItem = useCallback((index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const updated = [...prev];
      const a = updated[index];
      const b = updated[target];
      if (!a || !b) return prev;
      updated[index] = b;
      updated[target] = a;
      saveSidebarNavigation(updated);
      return updated;
    });
  }, []);

  const toggleVisibility = useCallback((index: number) => {
    setItems((prev) => {
      const entry = prev[index];
      if (!entry) return prev;
      // Prevent hiding the last visible item
      if (entry.visible && prev.filter((i) => i.visible).length <= 1) {
        toast.error('At least one item must remain visible');
        return prev;
      }
      const updated = prev.map((item, i) =>
        i === index ? { ...item, visible: !item.visible } : item
      );
      saveSidebarNavigation(updated);
      return updated;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    const defaults = DEFAULT_NAVIGATION.map((n) => ({ id: n.id, visible: true }));
    setItems(defaults);
    saveSidebarNavigation(null);
    toast.success('Sidebar Reset', {
      description: 'Navigation has been restored to defaults.',
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sidebar Navigation</span>
          <Button variant="ghost" size="sm" onClick={resetToDefault}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
        </CardTitle>
        <CardDescription>Reorder and toggle sidebar navigation items</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {items.map((entry, index) => {
            const nav = NAV_ITEM_BY_ID.get(entry.id);
            if (!nav) return null;
            const Icon = nav.icon;
            return (
              <div key={entry.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    disabled={index === 0}
                    onClick={() => {
                      moveItem(index, -1);
                    }}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    disabled={index === items.length - 1}
                    onClick={() => {
                      moveItem(index, 1);
                    }}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-sm font-medium">{nav.title}</span>
                <Switch
                  checked={entry.visible}
                  onCheckedChange={() => {
                    toggleVisibility(index);
                  }}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
