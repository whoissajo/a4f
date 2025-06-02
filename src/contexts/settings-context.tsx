"use client";

import type { Settings, Theme } from '@/lib/types';
import { DEFAULT_SETTINGS, LOCAL_STORAGE_SETTINGS_KEY } from '@/lib/constants';
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface SettingsContextType extends Settings {
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  setTheme: (theme: Theme) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as Settings;
        // Ensure all keys from DEFAULT_SETTINGS are present
        const validatedSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
        setSettings(validatedSettings);
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
      setSettings(DEFAULT_SETTINGS);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save settings to localStorage:", error);
      }

      // Apply theme
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      if (settings.theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(settings.theme);
      }
    }
  }, [settings, isInitialized]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
        localStorage.removeItem(LOCAL_STORAGE_SETTINGS_KEY);
      } catch (error) {
        console.error("Failed to remove settings from localStorage:", error);
      }
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    updateSettings({ theme });
  }, [updateSettings]);
  
  if (!isInitialized) {
    return null; // Or a loading spinner, but null is fine to avoid flash of unstyled content
  }

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings, resetSettings, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};
