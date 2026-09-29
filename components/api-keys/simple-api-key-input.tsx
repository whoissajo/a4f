// components/api-keys/simple-api-key-input.tsx
import React from 'react';
import { ExternalLink, Server } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SimpleApiKeyInputProps } from './types';

export const SimpleApiKeyInput: React.FC<SimpleApiKeyInputProps> = ({
  apiKey,
  isKeyLoaded,
  isOpen,
  onOpenChange,
}) => {
  if (!isKeyLoaded) return null;

  const isConfigured = Boolean(apiKey);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            A4F Server Configuration
          </DialogTitle>
          <DialogDescription>
            The A4F credential is intentionally kept on the server and is never stored in browser local storage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className={
            isConfigured
              ? "rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-300"
              : "rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
          }>
            {isConfigured
              ? 'A4F is configured for this deployment. You can start using the chat.'
              : 'A4F is not configured yet. Add A4F_API_KEY to the server environment and redeploy the application.'}
          </div>

          <a
            href="https://www.a4f.co/docs/authentication"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Read A4F authentication docs
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
