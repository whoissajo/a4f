// hooks/use-api-keys.tsx
import { useLocalStorage } from './use-local-storage';
import { useState, useEffect } from 'react';

// Storage keys for different API keys
export const A4F_API_KEY_STORAGE_KEY = 'a4f-api-key';
export const TAVILY_API_KEY_STORAGE_KEY = 'tavily-api-key';

// API key types
export type ApiKeyType = 'a4f' | 'tavily';

// API key interface
export interface ApiKeyInfo {
  key: string | null;
  isRequired: boolean;
  name: string;
  description: string;
  url: string;
}

// Hook to manage multiple API keys
export function useApiKeys(): {
  apiKeys: Record<ApiKeyType, ApiKeyInfo>;
  setApiKey: (type: ApiKeyType, key: string | null) => void;
  isKeysLoaded: boolean;
} {
  // Initialize API keys with default values
  const [a4fKey, setA4fKey] = useLocalStorage<string | null>(A4F_API_KEY_STORAGE_KEY, null);
  const [tavilyKey, setTavilyKey] = useLocalStorage<string | null>(TAVILY_API_KEY_STORAGE_KEY, null);
  const [isKeysLoaded, setIsKeysLoaded] = useState(false);

  // API key information
  const [apiKeys, setApiKeys] = useState<Record<ApiKeyType, ApiKeyInfo>>({
    a4f: {
      key: null,
      isRequired: true,
      name: 'A4F API Key',
      description: 'Required to chat on the playground',
      url: 'https://a4f.co/api-keys'
    },
    tavily: {
      key: null,
      isRequired: false,
      name: 'Tavily API Key',
      description: 'Required for web search functionality',
      url: 'https://tavily.com'
    }
  });

  // Update API keys after hydration
  useEffect(() => {
    if (isKeysLoaded) return;
    
    setApiKeys(prev => ({
      ...prev,
      a4f: { ...prev.a4f, key: a4fKey },
      tavily: { ...prev.tavily, key: tavilyKey }
    }));
    
    setIsKeysLoaded(true);
  }, [a4fKey, tavilyKey, isKeysLoaded]);

  // Function to set an API key
  const setApiKey = (type: ApiKeyType, key: string | null) => {
    // If key is null or empty, ensure it's properly removed
    const trimmedKey = key ? key.trim() : null;
    const valueToStore = trimmedKey === '' ? null : trimmedKey;
    
    // Update the specific API key in local storage
    if (type === 'a4f') {
      // Completely remove from localStorage if null
      if (valueToStore === null) {
        localStorage.removeItem(A4F_API_KEY_STORAGE_KEY);
      }
      setA4fKey(valueToStore);
    } else if (type === 'tavily') {
      // Completely remove from localStorage if null
      if (valueToStore === null) {
        localStorage.removeItem(TAVILY_API_KEY_STORAGE_KEY);
      }
      setTavilyKey(valueToStore);
    }
    
    // Update the state
    setApiKeys(prev => ({
      ...prev,
      [type]: { ...prev[type], key: valueToStore }
    }));
  };

  return { apiKeys, setApiKey, isKeysLoaded };
}

// Backward compatibility hook for existing code
export function useApiKey(): [string | null, (key: string | null) => void, boolean] {
  const [storedKey, setStoredKey] = useLocalStorage<string | null>(A4F_API_KEY_STORAGE_KEY, null);
  const [isKeyLoaded, setIsKeyLoaded] = useState(false);

  useEffect(() => {
    // This effect runs after hydration and signals that the key has been read from localStorage
    setIsKeyLoaded(true);
  }, []);

  const setApiKey = (key: string | null) => {
    setStoredKey(key ? key.trim() : null);
  };

  // Return the key, the setter, and the loading status
  // Return null for the key until it's loaded to prevent hydration mismatch
  return [isKeyLoaded ? storedKey : null, setApiKey, isKeyLoaded];
}
