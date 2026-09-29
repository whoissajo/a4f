import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useApiKey, useApiKeys } from '@/hooks/use-api-keys';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { fallbackModels } from '@/app/page-config/model-fallbacks';
import {
  ModelUIData,
  mapApiModelToUIData,
  ApiModelListResponse,
  SearchGroupId,
  SearchGroup,
} from '@/lib/utils';

const A4F_PROXY_BASE_URL = '/api/a4f';

type ModelPlan = 'free' | 'pro';
type A4FModelType = 'chat/completion' | 'images/generations';

async function fetchModelPage(
  plan: ModelPlan,
  type: A4FModelType,
): Promise<ModelUIData[]> {
  const params = new URLSearchParams({
    plan,
    type,
  });

  params.set('context_window', '');
  params.set('logo', '');
  params.set('description', '');
  params.set('features', '');

  const response = await fetch(
    `${A4F_PROXY_BASE_URL}/models?${params.toString()}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(
      `Failed to fetch ${plan} ${type} models: ${response.status} ${response.statusText}. ${errorText}`,
    );
  }

  const data: ApiModelListResponse = await response.json();

  return (data.data || [])
    .filter((model) => Boolean(model.id))
    .map((model) => mapApiModelToUIData(model, plan, type));
}

/**
 * Manages A4F server configuration, account information, model fetching,
 * and plan state. A4F secrets never reach the browser.
 */
export function useApiManagement(
  initialSelectedModelValue: string,
  onModelSelectionChange: (newModelValue: string) => void,
) {
  const [apiKey, setApiKey, isKeyLoaded] = useApiKey();
  const { apiKeys, setApiKey: setApiKeyByType, isKeysLoaded } = useApiKeys();

  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelUIData[]>(fallbackModels);

  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [showSimpleApiKeyInput, setShowSimpleApiKeyInput] = useState(false);

  const [currentPlan, setCurrentPlan] = useLocalStorage<ModelPlan>(
    'scira-selected-plan',
    'free',
  );
  const [modelFetchingStatus, setModelFetchingStatus] = useState<
    'ready' | 'processing' | 'error'
  >('ready');
  const [modelFetchingError, setModelFetchingError] = useState<string | null>(null);

  const isTavilyKeyAvailable = useCallback(
    () => Boolean(apiKeys.tavily.key),
    [apiKeys.tavily.key],
  );

  const fetchAccountInfo = useCallback(async () => {
    if (!apiKey) {
      setAccountInfo(null);
      setIsAccountLoading(false);
      return;
    }

    setIsAccountLoading(true);

    try {
      const response = await fetch(`${A4F_PROXY_BASE_URL}/usage`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => `HTTP ${response.status}`);
        throw new Error(
          `Failed to fetch account information: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data = await response.json();
      setAccountInfo(data);

      const plan = String(data?.account_information?.plan || '').toLowerCase();
      setCurrentPlan(plan === 'pro' ? 'pro' : 'free');
    } catch (error) {
      console.error('Error fetching A4F account info:', error);
      setAccountInfo(null);
    } finally {
      setIsAccountLoading(false);
    }
  }, [apiKey, setCurrentPlan]);

  const handleGroupSelection = useCallback(
    (
      group: SearchGroup,
      _selectedGroup: SearchGroupId,
      setSelectedGroup: (group: SearchGroupId) => void,
    ) => {
      if (group.id === 'web' && !isTavilyKeyAvailable()) {
        toast.error('Tavily API key required for web search', {
          description: 'Add your Tavily API key in the API Keys settings.',
          action: {
            label: 'Add Key',
            onClick: () => setIsApiKeyDialogOpen(true),
          },
        });
        return false;
      }

      setSelectedGroup(group.id);
      return true;
    },
    [isTavilyKeyAvailable],
  );

  useEffect(() => {
    if (apiKey && isKeyLoaded) {
      fetchAccountInfo();
      setShowSimpleApiKeyInput(false);
    } else if (!apiKey && isKeyLoaded) {
      setAccountInfo(null);
      setIsAccountLoading(false);
      setShowSimpleApiKeyInput(true);
    }
  }, [apiKey, isKeyLoaded, fetchAccountInfo]);

  useEffect(() => {
    if (!apiKey || !isKeyLoaded) {
      if (isKeyLoaded) {
        const planFallbacks = fallbackModels.filter(
          (model) => model.modelType === currentPlan,
        );
        const modelsToSet = planFallbacks.length > 0 ? planFallbacks : fallbackModels;
        setAvailableModels(modelsToSet);
        if (modelsToSet[0]) {
          onModelSelectionChange(modelsToSet[0].value);
        }
      }
      return;
    }

    let cancelled = false;

    const fetchModels = async () => {
      setModelFetchingStatus('processing');
      setModelFetchingError(null);

      try {
        const pages = await Promise.allSettled([
          fetchModelPage('free', 'chat/completion'),
          fetchModelPage('pro', 'chat/completion'),
          fetchModelPage('free', 'images/generations'),
          fetchModelPage('pro', 'images/generations'),
        ]);

        const successfulPages = pages
          .filter(
            (result): result is PromiseFulfilledResult<ModelUIData[]> =>
              result.status === 'fulfilled',
          )
          .flatMap((result) => result.value);

        if (!successfulPages.length) {
          throw new Error('A4F returned no models for the configured account.');
        }

        const uniqueModels = successfulPages.filter(
          (model, index, all) =>
            index === all.findIndex((candidate) => candidate.value === model.value),
        );

        if (cancelled) return;

        setAvailableModels(uniqueModels);

        if (
          !uniqueModels.some((model) => model.value === initialSelectedModelValue) &&
          uniqueModels[0]
        ) {
          onModelSelectionChange(uniqueModels[0].value);
        }
      } catch (error: any) {
        if (cancelled) return;

        console.error('Error fetching A4F models:', error);
        const message = error instanceof Error ? error.message : String(error);
        setModelFetchingError(message);
        setModelFetchingStatus('error');

        const planFallbacks = fallbackModels.filter(
          (model) => model.modelType === currentPlan,
        );
        const modelsToSet = planFallbacks.length > 0 ? planFallbacks : fallbackModels;
        setAvailableModels(modelsToSet);
        if (modelsToSet[0]) {
          onModelSelectionChange(modelsToSet[0].value);
        }
        toast.error(`Could not load A4F models: ${message}`);
        return;
      }

      if (!cancelled) {
        setModelFetchingStatus('ready');
      }
    };

    void fetchModels();

    return () => {
      cancelled = true;
    };
  }, [apiKey, isKeyLoaded, currentPlan, initialSelectedModelValue, onModelSelectionChange]);

  return {
    apiKey,
    setApiKey,
    isKeyLoaded,
    apiKeys,
    setApiKeyByType,
    isKeysLoaded,
    accountInfo,
    isAccountLoading,
    fetchAccountInfo,
    availableModels,
    isApiKeyDialogOpen,
    setIsApiKeyDialogOpen,
    isAccountDialogOpen,
    setIsAccountDialogOpen,
    showSimpleApiKeyInput,
    setShowSimpleApiKeyInput,
    currentPlan,
    setCurrentPlan,
    modelFetchingStatus,
    modelFetchingError,
    isTavilyKeyAvailable,
    handleGroupSelection,
  };
}
