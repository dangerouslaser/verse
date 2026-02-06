'use client';

import * as React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
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
  ChevronsUpDown,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { KodiLogo } from '@/components/icons/KodiLogo';
import { useKodiConnectionStatus } from '@/api/hooks/useKodiWebSocket';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';

const navigation = [
  { title: 'Home', url: '/', icon: Home, exact: true },
  { title: 'Movies', url: '/movies', icon: Film },
  { title: 'TV Shows', url: '/tv', icon: Tv },
  { title: 'Artists', url: '/music', icon: Music },
  { title: 'Albums', url: '/music/albums', icon: Disc3 },
  { title: 'Songs', url: '/music/songs', icon: ListMusic },
];

interface NavButtonProps {
  item: { title: string; url: string; icon: React.ElementType };
  isActive: boolean;
  collapsed: boolean;
}

function NavButton({ item, isActive, collapsed }: NavButtonProps) {
  const button = (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full',
        collapsed ? 'justify-center px-2' : 'justify-start',
        isActive && 'bg-sidebar-accent'
      )}
      asChild
    >
      <Link to={item.url}>
        <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
        {!collapsed && item.title}
      </Link>
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

interface UserMenuProps {
  collapsed: boolean;
  isConnected: boolean;
  theme: string | undefined;
  toggleTheme: () => void;
}

function UserMenu({ collapsed, isConnected, theme, toggleTheme }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full focus-visible:ring-0 focus-visible:ring-offset-0',
            collapsed ? 'justify-center px-2' : 'justify-start gap-2'
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Kodi</span>
                <span className="text-muted-foreground truncate text-xs">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <ChevronsUpDown className="text-muted-foreground ml-auto h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-sidebar z-50 w-56 rounded-lg"
        side={collapsed ? 'right' : 'top'}
        align={collapsed ? 'end' : 'center'}
        sideOffset={16}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Kodi</span>
              <span className="text-muted-foreground truncate text-xs">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme();
  const isConnected = useKodiConnectionStatus();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-14 border-b p-0 px-4">
        <Link
          to="/"
          className={cn(
            'flex h-full items-center gap-2 font-semibold',
            collapsed && 'w-full justify-center'
          )}
        >
          <KodiLogo className="h-6 w-6 shrink-0" />
          {!collapsed && <span>Verse</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.url
              : location.pathname.startsWith(item.url);
            return (
              <NavButton key={item.url} item={item} isActive={isActive} collapsed={collapsed} />
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <UserMenu
          collapsed={collapsed}
          isConnected={isConnected}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
