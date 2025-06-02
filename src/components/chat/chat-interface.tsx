"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Bot, Loader2, AlertTriangle } from 'lucide-react';
import { aiChat, type AiChatInput, type AiChatOutput } from '@/ai/flows/ai-chat';
import { useSettings } from '@/hooks/use-settings';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export function ChatInterface() {
  const { isSetupComplete, apiKey, apiBaseUrl, chatModelId } = useSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Note: The aiChat flow uses Genkit's configuration.
      // User's apiKey, apiBaseUrl, chatModelId are collected but not directly
      // plumbed into this specific pre-built flow without modifying Genkit setup.
      const aiResponse: AiChatOutput = await aiChat({ message: userMessage.text } as AiChatInput);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      setError(err.message || "An error occurred while communicating with the AI.");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Error: ${err.message || "Could not get response."}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSetupComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Setup Required</AlertTitle>
          <AlertDescription>
            Please complete the setup process in the settings page to use the AI Chat.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <Card className="h-full flex flex-col shadow-2xl overflow-hidden">
      <CardContent className="flex-grow flex flex-col p-0">
        <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && (
                  <Avatar className="h-8 w-8 border border-primary/50">
                    <AvatarImage src="https://placehold.co/40x40.png?text=AI" alt="AI Avatar" data-ai-hint="robot face" />
                    <AvatarFallback><Bot size={18} /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-xl shadow ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground border border-border rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8 border border-muted-foreground/50">
                     <AvatarImage src="https://placehold.co/40x40.png?text=U" alt="User Avatar" data-ai-hint="person silhouette" />
                    <AvatarFallback><User size={18}/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-3">
                <Avatar className="h-8 w-8 border border-primary/50">
                  <AvatarImage src="https://placehold.co/40x40.png?text=AI" alt="AI Avatar" data-ai-hint="robot face" />
                  <AvatarFallback><Bot size={18} /></AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] p-3 rounded-xl shadow bg-card text-card-foreground border border-border rounded-bl-none">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        {error && (
          <div className="p-4 border-t border-destructive/50 bg-destructive/10">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
