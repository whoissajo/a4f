export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
  apiBaseUrl: string;
  apiKey: string;
  chatModelId: string;
  imageModelId: string;
  theme: Theme;
  isSetupComplete: boolean;
}
