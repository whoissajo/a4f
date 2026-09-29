// hooks/use-api-keys.tsx
import { useEffect, useState } from 'react';
import { useLocalStorage } from './use-local-storage';

export const A4F_API_KEY_STORAGE_KEY = 'a4f-api-key';
export const TAVILY_API_KEY_STORAGE_KEY = 'tavily-api-key';
export const ELEVENLABS_API_KEY_STORAGE_KEY = 'elevenlabs-api-key';

export const A4F_SERVER_MANAGED_KEY = '__a4f_server_managed__';

export type ApiKeyType = 'a4f' | 'tavily' | 'elevenlabs';

export interface ApiKeyInfo {
  key: string | null;
  isRequired: boolean;
  name: string;
  description: string;
  url: string;
}

async function fetchA4FConfiguration(): Promise<boolean> {
  try {
    const response = await fetch('/api/a4f/status', {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as { configured?: boolean };
    return data.configured === true;
  } catch {
    return false;
  }
}

export function useApiKeys(): {
  apiKeys: Record<ApiKeyType, ApiKeyInfo>;
  setApiKey: (type: ApiKeyType, key: string | null) => void;
  isKeysLoaded: boolean;
} {
  const [tavilyKey, setTavilyKey] = useLocalStorage<string | null>(
    TAVILY_API_KEY_STORAGE_KEY,
    null,
  );
  const [elevenlabsKey, setElevenlabsKey] = useLocalStorage<string | null>(
    ELEVENLABS_API_KEY_STORAGE_KEY,
    null,
  );
  const [a4fConfigured, setA4fConfigured] = useState(false);
  const [isKeysLoaded, setIsKeysLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetchA4FConfiguration().then((configured) => {
      if (!mounted) return;
      setA4fConfigured(configured);
      setIsKeysLoaded(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const setApiKey = (type: ApiKeyType, key: string | null) => {
    if (type === 'a4f') {
      // A4F explicitly requires server-side secret storage. Never persist or
      // accept the secret in browser storage.
      void key;
      void fetchA4FConfiguration().then(setA4fConfigured);
      return;
    }

    const trimmedKey = key?.trim() || null;

    if (type === 'tavily') {
      if (trimmedKey === null) {
        localStorage.removeItem(TAVILY_API_KEY_STORAGE_KEY);
      }
      setTavilyKey(trimmedKey);
      return;
    }

    if (trimmedKey === null) {
      localStorage.removeItem(ELEVENLABS_API_KEY_STORAGE_KEY);
    }
    setElevenlabsKey(trimmedKey);
  };

  return {
    apiKeys: {
      a4f: {
        key: a4fConfigured ? A4F_SERVER_MANAGED_KEY : null,
        isRequired: true,
        name: 'A4F',
        description:
          'Configured on the server. The A4F API key is never exposed to browser code.',
        url: 'https://www.a4f.co/docs/authentication',
      },
      tavily: {
        key: tavilyKey,
        isRequired: false,
        name: 'Tavily API Key',
        description: 'Required for web search functionality',
        url: 'https://tavily.com',
      },
      elevenlabs: {
        key: elevenlabsKey,
        isRequired: false,
        name: 'ElevenLabs API Key',
        description: 'For premium Text-to-Speech voices',
        url: 'https://elevenlabs.io',
      },
    },
    setApiKey,
    isKeysLoaded,
  };
}

export function useApiKey(): [
  string | null,
  (key: string | null) => void,
  boolean,
] {
  const [configured, setConfigured] = useState(false);
  const [isKeyLoaded, setIsKeyLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetchA4FConfiguration().then((isConfigured) => {
      if (!mounted) return;
      setConfigured(isConfigured);
      setIsKeyLoaded(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const setServerManagedA4FKey = (_key: string | null) => {
    void fetchA4FConfiguration().then(setConfigured);
  };

  return [
    configured ? A4F_SERVER_MANAGED_KEY : null,
    setServerManagedA4FKey,
    isKeyLoaded,
  ];
}
