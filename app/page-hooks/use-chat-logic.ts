
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { fallbackModels } from '@/app/page-config/model-fallbacks';
import { useApiManagement } from './chat-logic/useApiManagement';
import { useChatCoreState } from './chat-logic/useChatCoreState';
import { useChatStreamHandler } from './chat-logic/useChatStreamHandler';

/**
 * Main composer hook for chat page logic. Integrates API management,
 * core chat state, and stream handling functionalities.
 */
export function useChatLogic() {
  const [selectedModel, setSelectedModel] = useLocalStorage<string>(
      'scira-selected-model',
      fallbackModels.find(m => m.modelType === 'free')?.value || "system-provider/default-fallback-free"
  );

  const {
    apiKey, setApiKey, isKeyLoaded,
    apiKeys, setApiKeyByType, isKeysLoaded,
    accountInfo, isAccountLoading, fetchAccountInfo,
    availableModels,
    isApiKeyDialogOpen, setIsApiKeyDialogOpen,
    showSimpleApiKeyInput, setShowSimpleApiKeyInput,
    isAccountDialogOpen, setIsAccountDialogOpen,
    currentPlan, setCurrentPlan,
    modelFetchingStatus, modelFetchingError,
    isTavilyKeyAvailable, handleGroupSelection,
  } = useApiManagement(selectedModel, setSelectedModel);

  const {
    messages, setMessages,
    input, setInput,
    attachments, setAttachments,
    selectedGroup, setSelectedGroup,
    hasSubmitted, setHasSubmitted,
    systemPrompt, setSystemPrompt,
    isSystemPromptVisible, setIsSystemPromptVisible,
    resetChatState,
    fileInputRef, inputRef, systemPromptInputRef,
  } = useChatCoreState();

  const {
    handleSend, handleStopStreaming, handleRetry, // Added handleRetry
    chatStatus,
    isStreamCancelledByUser,
    lastError: chatLastError, 
    errorType: chatErrorType, 
    errorDetails: chatErrorDetails, 
  } = useChatStreamHandler({
    apiKey,
    selectedModelValue: selectedModel,
    availableModels,
    currentMessages: messages,
    currentAttachments: attachments,
    currentSelectedGroup: selectedGroup,
    currentSystemPrompt: systemPrompt,
    setMessages,
    setInput,
    setHasSubmitted,
  });

  // Derive overall status
  const [overallStatus, setOverallStatus] = useState<'ready' | 'processing' | 'error'>('ready');
  useEffect(() => {
    if (modelFetchingStatus === 'processing' || chatStatus === 'processing') {
      setOverallStatus('processing');
    } else if (modelFetchingStatus === 'error' || chatStatus === 'error') {
      setOverallStatus('error');
    } else {
      setOverallStatus('ready');
    }
  }, [modelFetchingStatus, chatStatus]);

  // Consolidate errors (prefer chat error if both exist)
  const lastError = chatLastError || modelFetchingError;
  const errorType = chatErrorType || (modelFetchingStatus === 'error' ? 'generic' : 'generic');
  const errorDetails = chatErrorDetails || null;


  return {
    // Original API key for backward compatibility
    apiKey, setApiKey, isKeyLoaded,
    
    // New multi-API key system
    apiKeys, setApiKeyByType, isKeysLoaded,
    
    // Models and selections
    availableModels,
    selectedModel, setSelectedModel,
    
    // Chat state
    messages, setMessages,
    input, setInput,
    attachments, setAttachments,
    systemPrompt, setSystemPrompt,
    isSystemPromptVisible, setIsSystemPromptVisible,
    status: overallStatus, 
    
    // Chat actions
    handleSend, handleStopStreaming, handleRetry, fetchAccountInfo, resetChatState, // Added handleRetry
    
    // Group selection
    selectedGroup, setSelectedGroup,
    
    // UI state
    hasSubmitted, setHasSubmitted,
    
    // Dialog states
    isApiKeyDialogOpen, setIsApiKeyDialogOpen,
    showSimpleApiKeyInput, setShowSimpleApiKeyInput,
    isAccountDialogOpen, setIsAccountDialogOpen,
    
    // Account info
    accountInfo,
    isAccountLoading,
    currentPlan, setCurrentPlan,
    
    // Refs
    fileInputRef, inputRef, systemPromptInputRef,
    
    // Stream and error handling
    isStreamCancelledByUser, 
    lastError, 
    errorType, 
    errorDetails, 
    
    // API key helpers
    isTavilyKeyAvailable,
    handleGroupSelection
  };
}
