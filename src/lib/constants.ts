import type { Settings } from './types';

export const LOCAL_STORAGE_SETTINGS_KEY = 'rift-ai-assistant-settings';

export const DEFAULT_SETTINGS: Settings = {
  apiBaseUrl: '',
  apiKey: '',
  chatModelId: '',
  imageModelId: '',
  theme: 'system',
  isSetupComplete: false,
};
