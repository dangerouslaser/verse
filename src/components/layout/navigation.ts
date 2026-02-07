import type React from 'react';
import { useSyncExternalStore } from 'react';
import { Film, Tv, Music, Disc3, ListMusic, Home, Radio } from 'lucide-react';
import { getSidebarNavigation, setSidebarNavigation, type SidebarNavItem } from '@/lib/settings';

export interface NavItem {
  id: string;
  title: string;
  url: string;
  icon: React.ElementType;
  exact?: boolean;
}

export const DEFAULT_NAVIGATION: NavItem[] = [
  { id: 'home', title: 'Home', url: '/', icon: Home, exact: true },
  { id: 'movies', title: 'Movies', url: '/movies', icon: Film },
  { id: 'tv', title: 'TV Shows', url: '/tv', icon: Tv },
  { id: 'artists', title: 'Artists', url: '/music', icon: Music },
  { id: 'albums', title: 'Albums', url: '/music/albums', icon: Disc3 },
  { id: 'songs', title: 'Songs', url: '/music/songs', icon: ListMusic },
  { id: 'live-tv', title: 'Live TV', url: '/live-tv', icon: Radio },
];

/** Lookup NavItem metadata by id */
export const NAV_ITEM_BY_ID = new Map(DEFAULT_NAVIGATION.map((n) => [n.id, n]));

/**
 * Reconcile saved config against DEFAULT_NAVIGATION.
 * Returns a full SidebarNavItem[] with stale entries removed and new defaults appended.
 */
export function buildSidebarConfig(): SidebarNavItem[] {
  const saved = getSidebarNavigation();
  if (!saved) {
    return DEFAULT_NAVIGATION.map((n) => ({ id: n.id, visible: true }));
  }
  const knownIds = new Set(DEFAULT_NAVIGATION.map((n) => n.id));
  const result = saved.filter((s) => knownIds.has(s.id));
  const savedIds = new Set(result.map((s) => s.id));
  for (const nav of DEFAULT_NAVIGATION) {
    if (!savedIds.has(nav.id)) {
      result.push({ id: nav.id, visible: true });
    }
  }
  return result;
}

// --- Reactive sidebar navigation for useSyncExternalStore ---

const SIDEBAR_CHANGE_EVENT = 'verse:sidebar-nav-changed';

function buildVisibleNavigation(): NavItem[] {
  const config = buildSidebarConfig();
  const result: NavItem[] = [];
  for (const entry of config) {
    if (!entry.visible) continue;
    const item = NAV_ITEM_BY_ID.get(entry.id);
    if (item) {
      result.push(item);
    }
  }
  return result;
}

// Cache the snapshot so useSyncExternalStore gets a stable reference
let cachedNav: NavItem[] = buildVisibleNavigation();

/**
 * Persist sidebar config and notify subscribers (sidebar re-renders).
 * Pass null to reset to defaults.
 */
export function saveSidebarNavigation(items: SidebarNavItem[] | null): void {
  setSidebarNavigation(items);
  cachedNav = buildVisibleNavigation();
  window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(SIDEBAR_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): NavItem[] {
  return cachedNav;
}

export function useSidebarNavigation(): NavItem[] {
  return useSyncExternalStore(subscribe, getSnapshot);
}
