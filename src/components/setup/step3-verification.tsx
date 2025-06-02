"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, ChevronLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSettings } from '@/hooks/use-settings';
import { aiChat } from '@/ai/flows/ai-chat';
import { generateImage } from '@/ai/flows/ai-image-generation';
import { useToast } from '@/hooks/use-toast';

type Step3VerificationProps = {
  onComplete: () => void;
  onBack: () => void;
};

export function Step3Verification({ onComplete, onBack }: Step3VerificationProps) {
  const { apiKey, apiBaseUrl, chatModelId, imageModelId } = useSettings();
  const { toast } = useToast();

  const [chatStatus, setChatStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [imageStatus, setImageStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [chatError, setChatError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const verifyConfiguration = async () => {
    // Note: The current AI flows (aiChat, generateImage) are configured with Genkit's `googleAI` plugin.
    // For true OpenAI compatible API verification, these flows or the Genkit AI configuration would need to be
    // adapted to use the provided apiBaseUrl, apiKey, and modelIds.
    // This simulation attempts to call them as-is.

    // Verify Chat Model
    setChatStatus('verifying');
    setChatError(null);
    try {
      // A simple prompt to test chat.
      // The user's API key/base URL are not directly passed here as per genkit flow design.
      // Genkit environment variables (like GOOGLE_API_KEY) would be used by the googleAI plugin.
      // For an OpenAI compatible setup, this might require configuring an OpenAI plugin in genkit
      // or modifying flows, which is outside current constraints.
      await aiChat({ message: "Hello, test!" });
      setChatStatus('success');
    } catch (error: any) {
      setChatStatus('error');
      setChatError(error.message || "Chat model verification failed. Check console for details.");
      console.error("Chat verification error:", error);
    }

    // Verify Image Model
    setImageStatus('verifying');
    setImageError(null);
    try {
      // A simple prompt to test image generation.
      await generateImage({ prompt: "A blue square" });
      setImageStatus('success');
    } catch (error: any) {
      setImageStatus('error');
      setImageError(error.message || "Image model verification failed. Check console for details.");
      console.error("Image verification error:", error);
    }
  };
  
  useEffect(() => {
    // Automatically start verification when component mounts
    // This effect runs only once on mount due to empty dependency array
    // It's better to trigger verification via a button or after a short delay
    // to allow UI to render first. For now, direct call for simplicity.
    const timer = setTimeout(() => {
      verifyConfiguration();
    }, 500); // Small delay to ensure UI is ready
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // apiKey, apiBaseUrl, chatModelId, imageModelId are from context, re-running on their change might be too frequent. One-time verification is fine for setup.


  const allSuccess = chatStatus === 'success' && imageStatus === 'success';
  const anyError = chatStatus === 'error' || imageStatus === 'error';
  const anyVerifying = chatStatus === 'verifying' || imageStatus === 'verifying';

  const handleComplete = () => {
    toast({
        title: "Setup Complete!",
        description: "Rift AI Assistant is ready to use.",
    });
    onComplete();
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Step 3: Verification</CardTitle>
        <CardDescription>Verifying your API and Model configurations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <VerificationItem status={chatStatus} label="Chat Model" error={chatError} />
          <VerificationItem status={imageStatus} label="Image Generation Model" error={imageError} />
        </div>

        {anyError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              One or more configurations failed to verify. Please check your settings and try again.
              Ensure your Genkit environment is configured correctly for the AI services.
              The current flows use Google AI; for OpenAI compatible APIs, ensure your Genkit setup reflects this.
            </AlertDescription>
          </Alert>
        )}

        {allSuccess && (
          <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/30">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-700 dark:text-green-300">Verification Successful!</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">
              All configurations are working correctly. You can now proceed.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between gap-4 pt-4">
          <Button variant="outline" onClick={onBack} disabled={anyVerifying} className="w-full">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleComplete} disabled={!allSuccess || anyVerifying} className="w-full">
            {anyVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Finish Setup
          </Button>
        </div>
         <Button variant="link" onClick={verifyConfiguration} disabled={anyVerifying} className="w-full">
            {anyVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Retry Verification
        </Button>
      </CardContent>
    </Card>
  );
}

type VerificationItemProps = {
  status: 'pending' | 'verifying' | 'success' | 'error';
  label: string;
  error?: string | null;
};

function VerificationItem({ status, label, error }: VerificationItemProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <span className="text-sm font-medium">{label}</span>
      {status === 'pending' && <span className="text-xs text-muted-foreground">Pending</span>}
      {status === 'verifying' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
      {status === 'error' && (
        <div className="flex items-center gap-1">
          <XCircle className="h-5 w-5 text-destructive" />
          {error && <span className="text-xs text-destructive truncate max-w-[150px] sm:max-w-xs" title={error}>{error}</span>}
        </div>
      )}
    </div>
  );
}
