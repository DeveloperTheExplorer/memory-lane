import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GalleryVerticalEnd, User, LogOut } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/auth-context';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../shared/theme-toggle';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b p-4 transition-shadow duration-200",
      isScrolled ? 'glass-strong shadow-md' : ''
    )}>
      <div className="flex items-center">
        <div className="mr-4 flex items-center gap-1 sm:gap-2">
          <SidebarTrigger className="mr-2" />
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <GalleryVerticalEnd className="h-5 w-5" />
            <span className="font-bold sm:text-lg text-base whitespace-nowrap">Memory Lane</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-1 sm:space-x-2">
          <ThemeToggle />
          {user ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2" aria-label="User menu">
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm sm:block hidden">{user.email}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 py-2" align="end">
                  <span className="text-sm sm:hidden block my-2">
                    {user.email}
                  </span>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

Navbar.displayName = 'Navbar';

export default Navbar;

