'use client';

import * as React from 'react';
import { Link } from '@tanstack/react-router';
import {
  Film,
  Tv,
  Settings,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Music,
  Disc3,
  ListMusic,
  Home,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { KodiLogo } from '@/components/icons/KodiLogo';
import { useKodiConnectionStatus } from '@/api/hooks/useKodiWebSocket';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme();
  const isConnected = useKodiConnectionStatus();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <KodiLogo className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Verse</span>
                  <span className="truncate text-xs">Kodi Interface</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Home">
                  <Link
                    to="/"
                    activeProps={{
                      className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    }}
                    activeOptions={{ exact: true }}
                  >
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Video</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Movies">
                  <Link
                    to="/movies"
                    activeProps={{
                      className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    }}
                  >
                    <Film />
                    <span>Movies</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="TV Shows">
                  <Link
                    to="/tv"
                    activeProps={{
                      className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    }}
                  >
                    <Tv />
                    <span>TV Shows</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Music</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Artists">
                  <Link
                    to="/music"
                    activeProps={{
                      className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    }}
                  >
                    <Music />
                    <span>Artists</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Albums">
                  <Link
                    to="/music/albums"
                    activeProps={{
                      className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    }}
                  >
                    <Disc3 />
                    <span>Albums</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Songs">
                  <Link
                    to="/music/songs"
                    activeProps={{
                      className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    }}
                  >
                    <ListMusic />
                    <span>Songs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={isConnected ? 'Connected to Kodi' : 'Disconnected from Kodi'}
            >
              {isConnected ? (
                <Wifi className="text-green-500" />
              ) : (
                <WifiOff className="text-muted-foreground" />
              )}
              <span className={isConnected ? 'text-green-500' : 'text-muted-foreground'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link
                to="/settings"
                activeProps={{
                  className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                }}
              >
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Toggle Theme"
              onClick={() => {
                setTheme(theme === 'light' ? 'dark' : 'light');
              }}
            >
              <Sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span>Theme</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
