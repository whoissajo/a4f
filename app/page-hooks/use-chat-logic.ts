
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
    resetChatState: coreResetChatState,
    fileInputRef, inputRef, systemPromptInputRef,
  } = useChatCoreState();

  const [chatHistory, setChatHistory] = useLocalStorage<ChatHistoryEntry[]>(CHAT_HISTORY_KEY, []);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const saveOrUpdateCurrentChatInHistory = useCallback((messagesForHistory: SimpleMessage[]) => {
    if (messagesForHistory.length === 0) return;

    const cleanMessagesForHistory = messagesForHistory.filter(msg =>
        !(msg.role === 'assistant' && msg.isStreaming && !msg.content && !msg.thinkingContent)
    );

    if (cleanMessagesForHistory.length === 0) return;

    let entryToSave: ChatHistoryEntry;
    let newHistory = [...chatHistory];

    if (currentChatId) { // Update existing chat
      const existingEntryIndex = newHistory.findIndex(chat => chat.id === currentChatId);
      if (existingEntryIndex !== -1) {
        const existingEntry = newHistory[existingEntryIndex];
        entryToSave = {
          ...existingEntry,
          messages: cleanMessagesForHistory,
          timestamp: Date.now(),
          selectedModel,
          selectedGroup,
          systemPrompt,
          attachments,
        };
        newHistory.splice(existingEntryIndex, 1); // Remove old entry
        newHistory.unshift(entryToSave); // Add updated entry to the top
      } else {
        // Fallback: treat as new if ID not found (should ideally not happen if currentChatId is set)
        const newId = `chat-${Date.now()}`;
        setCurrentChatId(newId);
        const firstUserMessage = cleanMessagesForHistory.find(m => m.role === 'user');
        const title = firstUserMessage?.content.substring(0, 50) || "Untitled Chat";
        entryToSave = {
          id: newId, title, timestamp: Date.now(), messages: cleanMessagesForHistory,
          selectedModel, selectedGroup, systemPrompt, attachments,
        };
        newHistory.unshift(entryToSave);
      }
    } else { // New chat
      const newId = `chat-${Date.now()}`;
      setCurrentChatId(newId);
      const firstUserMessage = cleanMessagesForHistory.find(m => m.role === 'user');
      const title = firstUserMessage?.content.substring(0, 50) || "Untitled Chat";
      entryToSave = {
        id: newId, title, timestamp: Date.now(), messages: cleanMessagesForHistory,
        selectedModel, selectedGroup, systemPrompt, attachments,
      };
      newHistory.unshift(entryToSave);
    }

    // Ensure history does not exceed max length
    if (newHistory.length > MAX_HISTORY_LENGTH) {
      newHistory = newHistory.slice(0, MAX_HISTORY_LENGTH);
    }
    setChatHistory(newHistory);

  }, [currentChatId, chatHistory, selectedModel, selectedGroup, systemPrompt, attachments, setChatHistory, setCurrentChatId]);


  const loadChatFromHistory = useCallback((chatId: string) => {
    const chatToLoad = chatHistory.find(chat => chat.id === chatId);
    if (chatToLoad) {
      setMessages(chatToLoad.messages);
      setSelectedModel(chatToLoad.selectedModel);
      setSelectedGroup(chatToLoad.selectedGroup);
      setSystemPrompt(chatToLoad.systemPrompt);
      setAttachments(chatToLoad.attachments || []);
      setCurrentChatId(chatToLoad.id);
      setHasSubmitted(true);
      setInput('');
      toast.info(`Loaded chat: "${chatToLoad.title}"`);
    }
  }, [chatHistory, setMessages, setSelectedModel, setSelectedGroup, setSystemPrompt, setAttachments, setCurrentChatId, setHasSubmitted, setInput]);

  const deleteChatFromHistory = useCallback((chatId: string) => {
    setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
        setCurrentChatId(null);
        coreResetChatState(); // Also clear the UI if deleting the active chat
        toast.info("Active chat removed from history. New chat started.");
    } else {
        toast.info("Chat removed from history");
    }
  }, [setChatHistory, currentChatId, setCurrentChatId, coreResetChatState]);


  const handleNewChatSession = useCallback(() => {
    setCurrentChatId(null);
    coreResetChatState();
    toast.info("New chat session started");
  }, [coreResetChatState, setCurrentChatId]);

  const clearAllChatHistory = useCallback(() => {
    setChatHistory(() => []); // Use functional update to ensure new reference
    setCurrentChatId(null);
    coreResetChatState();
    toast.success("All chat history cleared!");
  }, [setChatHistory, setCurrentChatId, coreResetChatState]);


  const {
    handleSend: streamHandlerSend,
    handleStopStreaming,
    handleRetry,
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
    onMessagesUpdatedForHistory: saveOrUpdateCurrentChatInHistory,
  });

  const handleSend = useCallback(async (messageContent: string) => {
    await streamHandlerSend(messageContent);
  }, [streamHandlerSend]);


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

  const lastError = chatLastError || modelFetchingError;
  const errorType = chatErrorType || (modelFetchingStatus === 'error' ? 'generic' : 'generic');
  const errorDetails = chatErrorDetails || null;


  return {
    apiKey, setApiKey, isKeyLoaded,
    apiKeys, setApiKeyByType, isKeysLoaded,
    availableModels,
    selectedModel, setSelectedModel,
    messages, setMessages,
    input, setInput,
    attachments, setAttachments,
    systemPrompt, setSystemPrompt,
    isSystemPromptVisible, setIsSystemPromptVisible,
    status: overallStatus,
    handleSend,
    handleStopStreaming, handleRetry, fetchAccountInfo,
    resetChatState: handleNewChatSession,
    selectedGroup, setSelectedGroup,
    hasSubmitted, setHasSubmitted,
    isApiKeyDialogOpen, setIsApiKeyDialogOpen,
    showSimpleApiKeyInput, setShowSimpleApiKeyInput,
    isAccountDialogOpen, setIsAccountDialogOpen,
    accountInfo,
    isAccountLoading,
    currentPlan, setCurrentPlan,
    fileInputRef, inputRef, systemPromptInputRef,
    isStreamCancelledByUser,
    lastError,
    errorType,
    errorDetails,
    isTavilyKeyAvailable,
    handleGroupSelection,
    chatHistory,
    loadChatFromHistory,
    deleteChatFromHistory,
    clearAllChatHistory, // Expose the new function
  };
}

