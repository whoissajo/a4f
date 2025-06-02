import Link from 'next/link';
import Logo from '@/components/core/logo';
import { MainNav } from './main-nav';
import { ThemeToggle } from '@/components/core/theme-toggle';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo size="sm" />
        </Link>
        <MainNav />
        <div className="flex items-center gap-2">
          <Link href="/settings" passHref legacyBehavior>
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
