import React, { memo } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Plus, KeyRound, Settings as SettingsIcon, User, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageNavbarProps {
  hasMessages: boolean;
  onNewChat: () => void;
  onOpenAccountDialog: () => void;
  onOpenApiKeyDialog: () => void;
  onToggleHistorySidebar: () => void; // New prop
}

/**
 * Navigation bar component for the chat page.
 * It includes a theme toggle, new chat button, and settings menu.
 */
export const PageNavbar: React.FC<PageNavbarProps> = memo(({
    hasMessages,
    onNewChat,
    onOpenAccountDialog,
    onOpenApiKeyDialog,
    onToggleHistorySidebar // New prop
}) => {
  const { resolvedTheme, setTheme: setNextThemeHook } = useTheme();

  const ThemeToggle: React.FC = () => (
      <Button
          variant="ghost"
          size="icon"
          onClick={() => setNextThemeHook(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Toggle theme"
      >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
  );
  ThemeToggle.displayName = 'ThemeToggle';


  return (
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4",
          hasMessages
            ? "bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60"
            : "bg-background",
          "transition-colors duration-300"
        )}
      >
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleHistorySidebar}
            className="rounded-full bg-accent hover:bg-accent/80 backdrop-blur-xs group transition-all hover:scale-105 pointer-events-auto"
            aria-label="Toggle Chat History"
          >
            <History size={18} className="group-hover:scale-110 transition-all" />
          </Button>
          <Button
            type="button"
            variant={"secondary"}
            onClick={onNewChat}
            className="rounded-full bg-accent hover:bg-accent/80 backdrop-blur-xs group transition-all hover:scale-105 pointer-events-auto"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-all" />
            <span className="text-sm ml-2 group-hover:block hidden animate-in fade-in duration-300">
              New Chat
            </span>
          </Button>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Settings"
              >
                <SettingsIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onOpenAccountDialog}>
                <User className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenApiKeyDialog}>
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Edit API Key</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
});
PageNavbar.displayName = 'PageNavbar';
