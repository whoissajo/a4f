import { ModelUIData } from '@/lib/utils';
import { Bot } from 'lucide-react';

export const baseFallbackModels: ModelUIData[] = [
  {
    value: "system-provider/default-fallback-free",
    label: "Fallback Model (Free)",
    baseModel: "Fallback Model",
    apiProvider: "system-provider",
    owner: "System",
    icon: Bot,
    logoUrl: undefined,
    description: "Default free chat model if A4F is unavailable.",
    modelType: 'free',
    contextLength: 2000,
    features: [],
    color: 'green',
    apiType: 'chat/completion',
  },
  {
    value: "system-provider/default-fallback-pro",
    label: "Fallback Model (Pro)",
    baseModel: "Fallback Model",
    apiProvider: "system-provider",
    owner: "System",
    icon: Bot,
    logoUrl: undefined,
    description: "Default pro chat model if A4F is unavailable.",
    modelType: 'pro',
    contextLength: 4000,
    features: ["vision"],
    color: 'purple',
    apiType: 'chat/completion',
  },
];

export const fallbackModels: ModelUIData[] = baseFallbackModels;
