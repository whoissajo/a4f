// components/api-keys/api-keys-dialog.tsx
import React, { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeyType } from '@/hooks/use-api-keys';
import { ApiKeysDialogProps } from './types';
import { ApiKeyTab } from './api-key-tab';

const tabLabels: Record<ApiKeyType, string> = {
  a4f: 'A4F',
  tavily: 'Tavily',
  elevenlabs: 'ElevenLabs',
};

export const ApiKeysDialog: React.FC<ApiKeysDialogProps> = ({
  apiKeys,
  setApiKey,
  isKeysLoaded,
  isOpen,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState<ApiKeyType>('a4f');
  const [tempKeys, setTempKeys] = useState<Record<ApiKeyType, string>>({
    a4f: '',
    tavily: '',
    elevenlabs: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setTempKeys({
        a4f: '',
        tavily: '',
        elevenlabs: '',
      });
    }
  }, [isOpen]);

  const handleTempKeyChange = (keyType: ApiKeyType, value: string) => {
    setTempKeys((current) => ({
      ...current,
      [keyType]: value,
    }));
  };

  const handleSave = (keyType: ApiKeyType) => {
    const value = tempKeys[keyType].trim();
    if (!value) return;

    setApiKey(keyType, value);
    setTempKeys((current) => ({ ...current, [keyType]: '' }));

    toast.success(`${tabLabels[keyType]} API key saved`);
  };

  const handleRemove = (keyType: ApiKeyType) => {
    setApiKey(keyType, null);
    setTempKeys((current) => ({ ...current, [keyType]: '' }));

    if (keyType === 'tavily') {
      toast.info('Tavily API key removed. Web search is now disabled.');
    } else if (keyType === 'elevenlabs') {
      toast.info('ElevenLabs API key removed.');
    }
  };

  if (!isKeysLoaded) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            API Keys
          </DialogTitle>
          <DialogDescription>
            A4F is configured on the server; optional browser integrations remain user-managed.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ApiKeyType)}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="a4f">A4F</TabsTrigger>
            <TabsTrigger value="tavily">Tavily</TabsTrigger>
            <TabsTrigger value="elevenlabs">ElevenLabs</TabsTrigger>
          </TabsList>

          {(Object.keys(tabLabels) as ApiKeyType[]).map((keyType) => (
            <TabsContent key={keyType} value={keyType} className="mt-4">
              <ApiKeyTab
                keyType={keyType}
                keyInfo={apiKeys[keyType]}
                tempKey={tempKeys[keyType]}
                onTempKeyChange={(value) => handleTempKeyChange(keyType, value)}
                onSave={handleSave}
                onRemove={handleRemove}
              />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
