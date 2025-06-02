import { ChatInterface } from '@/components/chat/chat-interface';
import { AppHeader } from '@/components/layout/app-header';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4 sm:py-8 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
