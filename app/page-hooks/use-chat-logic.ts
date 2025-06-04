
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { fallbackModels } from '@/app/page-config/model-fallbacks';
import { useApiManagement } from './chat-logic/useApiManagement';
import { useChatCoreState } from './chat-logic/useChatCoreState';
import { useChatStreamHandler } from './chat-logic/useChatStreamHandler';
import type { SimpleMessage, Attachment, SearchGroupId, ChatHistoryEntry } from '@/lib/utils';
import { toast } from 'sonner';

const MAX_HISTORY_LENGTH = 10;
const CHAT_HISTORY_KEY = 'a4f-chat-history';

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
    resetChatState: coreResetChatState, // Renamed to avoid conflict
    fileInputRef, inputRef, systemPromptInputRef,
  } = useChatCoreState();

  const [chatHistory, setChatHistory] = useLocalStorage<ChatHistoryEntry[]>(CHAT_HISTORY_KEY, []);

  const saveChatToHistory = useCallback(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === 'assistant' && messages[0].isError)) {
      return; // Don't save empty or error-only chats
    }

    const firstUserMessage = messages.find(m => m.role === 'user');
    const title = firstUserMessage?.content.substring(0, 50) || "Untitled Chat";
    const newEntry: ChatHistoryEntry = {
      id: `chat-${Date.now()}`,
      title,
      timestamp: Date.now(),
      messages,
      selectedModel,
      selectedGroup,
      systemPrompt,
      attachments, // Save attachments as well
    };

    setChatHistory(prevHistory => {
      const updatedHistory = [newEntry, ...prevHistory];
      if (updatedHistory.length > MAX_HISTORY_LENGTH) {
        return updatedHistory.slice(0, MAX_HISTORY_LENGTH);
      }
      return updatedHistory;
    });
    toast.success("Chat saved to history");
  }, [messages, selectedModel, selectedGroup, systemPrompt, attachments, setChatHistory]);

  const loadChatFromHistory = useCallback((chatId: string) => {
    const chatToLoad = chatHistory.find(chat => chat.id === chatId);
    if (chatToLoad) {
      setMessages(chatToLoad.messages);
      setSelectedModel(chatToLoad.selectedModel);
      setSelectedGroup(chatToLoad.selectedGroup);
      setSystemPrompt(chatToLoad.systemPrompt);
      setAttachments(chatToLoad.attachments || []);
      setHasSubmitted(true);
      setInput(''); // Clear current input
      toast.info(`Loaded chat: "${chatToLoad.title}"`);
    }
  }, [chatHistory, setMessages, setSelectedModel, setSelectedGroup, setSystemPrompt, setAttachments, setHasSubmitted, setInput]);

  const deleteChatFromHistory = useCallback((chatId: string) => {
    setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));
    toast.info("Chat removed from history");
  }, [setChatHistory]);


  const handleNewChatSession = useCallback(() => {
    if (messages.length > 0) { // Only save if there are actual messages
      saveChatToHistory();
    }
    coreResetChatState(); // Call the original reset state function
  }, [messages, saveChatToHistory, coreResetChatState]);


  const {
    handleSend, handleStopStreaming, handleRetry,
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
    handleSend, handleStopStreaming, handleRetry, fetchAccountInfo, 
    resetChatState: handleNewChatSession, // Renamed to handleNewChatSession for clarity

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
    handleGroupSelection,

    // Chat History
    chatHistory,
    loadChatFromHistory,
    deleteChatFromHistory,
  };
}
