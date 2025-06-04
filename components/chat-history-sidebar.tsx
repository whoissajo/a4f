// components/chat-history-sidebar.tsx
import React from 'react';
import { motion } from 'framer-motion'; // Moved import to the top
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, MessageSquareText, History } from 'lucide-react';
import { ChatHistoryEntry, formatRelativeTime, cn } from '@/lib/utils';

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  chatHistory: ChatHistoryEntry[];
  onLoadChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = React.memo(({
  isOpen,
  onOpenChange,
  chatHistory,
  onLoadChat,
  onDeleteChat,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Chat History
          </SheetTitle>
          <SheetDescription className="text-xs">
            Your last {chatHistory.length > 0 ? Math.min(chatHistory.length, 10) : '0'} conversations. Click to load.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 dialog-custom-scrollbar">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageSquareText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-muted-foreground">No chat history yet.</p>
              <p className="text-xs text-muted-foreground/70">Start a conversation to see it here.</p>
            </div>
          ) : (
            <div className="py-2 px-2 space-y-1.5">
              {chatHistory.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group relative"
                >
                  <Button
                    variant="ghost"
                    className="w-full h-auto justify-start items-start text-left p-2.5 rounded-md hover:bg-accent dark:hover:bg-accent/50"
                    onClick={() => {
                      onLoadChat(entry.id);
                      onOpenChange(false); // Close sidebar on load
                    }}
                  >
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className="text-xs font-medium text-foreground truncate block max-w-[230px] sm:max-w-[280px]">
                        {entry.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1.5 -translate-y-1/2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent loading chat when deleting
                      onDeleteChat(entry.id);
                    }}
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
        {chatHistory.length > 0 && (
           <div className="p-3 border-t text-center">
             <SheetClose asChild>
                <Button variant="outline" size="sm" className="w-full">Close</Button>
             </SheetClose>
           </div>
        )}
      </SheetContent>
    </Sheet>
  );
});

ChatHistorySidebar.displayName = 'ChatHistorySidebar'; // Good practice for memoized components
