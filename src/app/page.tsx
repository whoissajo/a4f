"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Image as ImageIcon, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import Logo from '@/components/core/logo';
import { AppHeader } from '@/components/layout/app-header';

export default function HomePage() {
  const router = useRouter();
  const settings = useSettings(); // Will throw if not in provider, ensure provider wraps this.
  
  // settings can be undefined initially if SettingsProvider is not fully initialized.
  // The SettingsProvider itself handles loading from localStorage and has an isInitialized state.
  // This page should only render its content once settings are available.
  // The useSettings hook will throw if context is undefined, meaning provider is missing.
  // If settings are just loading, settings would be default settings until localStorage is read.

  useEffect(() => {
    if (settings && !settings.isSetupComplete) {
      router.replace('/setup');
    }
  }, [settings, router]);

  if (!settings || !settings.isSetupComplete) {
    // Show loading or redirecting state
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your experience...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <Logo size="lg" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal AI assistant for browsing, chatting, and image generation.
            Choose an option below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          <FeatureCard
            href="/chat"
            icon={MessageCircle}
            title="Chat with AI"
            description="Engage in conversations, get answers, and explore ideas with your AI."
          />
          <FeatureCard
            href="/image-generator"
            icon={ImageIcon}
            title="Generate Images"
            description="Bring your imagination to life by generating unique images from text prompts."
          />
          <FeatureCard
            href="/settings"
            icon={SettingsIcon}
            title="Settings"
            description="Configure your API keys, model IDs, and application theme preferences."
          />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Rift AI Assistant. All rights reserved.
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ href, icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Link href={href} passHref>
      <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col group hover:border-primary">
        <CardHeader className="items-center text-center">
          <div className="p-3 bg-primary/10 rounded-full mb-3 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="text-center">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
