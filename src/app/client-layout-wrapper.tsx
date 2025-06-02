"use client";

import { SettingsProvider } from '@/contexts/settings-context';
import { Toaster } from '@/components/ui/toaster';
import { ReactNode } from 'react';

export function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      {children}
      <Toaster />
    </SettingsProvider>
  );
}
