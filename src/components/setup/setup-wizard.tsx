"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/hooks/use-settings';
import { Step1ApiDetails } from './step1-api-details';
import { Step2ModelIds } from './step2-model-ids';
import { Step3Verification } from './step3-verification';
import Logo from '@/components/core/logo';
import type { Settings } from '@/lib/types';

type FormData = Pick<Settings, 'apiBaseUrl' | 'apiKey' | 'chatModelId' | 'imageModelId'>;

export function SetupWizard() {
  const router = useRouter();
  const { updateSettings, isSetupComplete, ...currentSettings } = useSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    apiBaseUrl: currentSettings.apiBaseUrl || '',
    apiKey: currentSettings.apiKey || '',
    chatModelId: currentSettings.chatModelId || '',
    imageModelId: currentSettings.imageModelId || '',
  });

  useEffect(() => {
    if (isSetupComplete) {
      router.replace('/'); // Redirect if already set up
    }
  }, [isSetupComplete, router]);
  
  useEffect(() => { // Populate formData if settings change (e.g. on initial load)
    setFormData(prev => ({
      ...prev,
      apiBaseUrl: currentSettings.apiBaseUrl || '',
      apiKey: currentSettings.apiKey || '',
      chatModelId: currentSettings.chatModelId || '',
      imageModelId: currentSettings.imageModelId || '',
    }));
  }, [currentSettings.apiBaseUrl, currentSettings.apiKey, currentSettings.chatModelId, currentSettings.imageModelId]);


  const handleStep1Next = (data: Pick<Settings, 'apiBaseUrl' | 'apiKey'>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Next = (data: Pick<Settings, 'chatModelId' | 'imageModelId'>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Save to context before verification step
    updateSettings({ ...formData, ...data });
    setCurrentStep(3);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };
  
  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  const handleCompleteSetup = () => {
    updateSettings({ ...formData, isSetupComplete: true });
    router.replace('/');
  };

  if (isSetupComplete) {
    return null; // Or a loading indicator while redirecting
  }
  
  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      
      <div className="w-full max-w-lg mb-6">
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
            <div style={{ width: `${progressPercentage}%`}} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500 ease-out"></div>
          </div>
        </div>
      </div>

      {currentStep === 1 && (
        <Step1ApiDetails
          defaultValues={{ apiBaseUrl: formData.apiBaseUrl, apiKey: formData.apiKey }}
          onNext={handleStep1Next}
        />
      )}
      {currentStep === 2 && (
        <Step2ModelIds
          defaultValues={{ chatModelId: formData.chatModelId, imageModelId: formData.imageModelId }}
          onNext={handleStep2Next}
          onBack={handleStep2Back}
        />
      )}
      {currentStep === 3 && (
        <Step3Verification
          onComplete={handleCompleteSetup}
          onBack={handleStep3Back}
        />
      )}
    </div>
  );
}
