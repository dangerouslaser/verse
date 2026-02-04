import { Link } from '@tanstack/react-router';
import { Film, Tv, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { KodiLogo } from '@/components/icons/KodiLogo';

export function Navigation() {
  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center">
              <KodiLogo className="text-foreground h-6 w-6" />
            </div>
            <span className="text-xl font-bold">Verse</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/movies"
              className="text-muted-foreground hover:text-foreground [&.active]:text-foreground flex items-center space-x-2 transition-colors"
              activeProps={{ className: 'active' }}
            >
              <Film className="h-5 w-5" />
              <span>Movies</span>
            </Link>

            <Link
              to="/tv"
              className="text-muted-foreground hover:text-foreground [&.active]:text-foreground flex items-center space-x-2 transition-colors"
              activeProps={{ className: 'active' }}
            >
              <Tv className="h-5 w-5" />
              <span>TV Shows</span>
            </Link>

            <Link
              to="/settings"
              className="text-muted-foreground hover:text-foreground [&.active]:text-foreground flex items-center space-x-2 transition-colors"
              activeProps={{ className: 'active' }}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>

            <div className="ml-2 border-l pl-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
