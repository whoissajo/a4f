
// app/page-hooks/chat-logic/useChatStreamHandler.ts
import { useState, useCallback, useRef } from 'react';
import OpenAI from 'openai';
import { toast } from 'sonner';
import {
    API_BASE_URL,
    SimpleMessage,
    Attachment,
    ModelUIData,
    SearchGroupId
} from '@/lib/utils';
import { processStreamChunks } from './stream-handler-helpers/chunkProcessor';
import { handleStreamError } from './stream-handler-helpers/errorHandler';

interface UseChatStreamHandlerProps {
    apiKey: string | null;
    selectedModelValue: string;
    availableModels: ModelUIData[];
    currentMessages: SimpleMessage[];
    currentAttachments: Attachment[];
    currentSelectedGroup: SearchGroupId;
    currentSystemPrompt: string;
    setMessages: React.Dispatch<React.SetStateAction<SimpleMessage[]>>;
    setInput: (input: string) => void;
    setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Handles sending messages, streaming responses, and managing
 * errors related to chat completions.
 */
export function useChatStreamHandler({
    apiKey,
    selectedModelValue,
    availableModels,
    currentMessages,
    currentAttachments,
    currentSelectedGroup,
    currentSystemPrompt,
    setMessages,
    setInput,
    setHasSubmitted,
}: UseChatStreamHandlerProps) {
  const [chatStatus, setChatStatus] = useState<'ready' | 'processing' | 'error'>('ready');
  const internalIsStreamCancelledByUserRef = useRef(false);
  const [isStreamCancelledForParent, setIsStreamCancelledForParent] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<SimpleMessage['errorType']>('generic');
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const currentAssistantMessageId = useRef<string | null>(null);

  const handleStopStreaming = useCallback(() => {
    internalIsStreamCancelledByUserRef.current = true;
    setIsStreamCancelledForParent(true);
    toast.info("Stopping message generation...");
  }, [setIsStreamCancelledForParent]);

  const handleSend = useCallback(async (messageContent: string) => {
    if (!apiKey && currentSelectedGroup !== 'image') { // Image generation uses a hardcoded key for now
        toast.error("API Key is required.");
        setLastError("API Key is required.");
        setErrorType('generic'); 
        setChatStatus('error');
        return;
    }
    if (chatStatus === 'processing') {
        toast.warning("Please wait for the current response.");
        return;
    }

    // IMAGE MODE: If currentSelectedGroup is 'image', call image generation API
    if (currentSelectedGroup === 'image') {
      const prompt = messageContent.trim();
      if (!prompt) return;
      setChatStatus('processing');
      setLastError(null);
      setErrorType('generic');
      setErrorDetails(null);
      internalIsStreamCancelledByUserRef.current = false;
      setIsStreamCancelledForParent(false);

      const newUserMessage: SimpleMessage = {
        id: `user-${Date.now()}-${Math.random()}`,
        role: 'user',
        content: prompt,
        createdAt: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      const assistantMessageId = `assistant-${Date.now()}-${Math.random()}`;
      currentAssistantMessageId.current = assistantMessageId;
      const assistantPlaceholder: SimpleMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
        isStreaming: true,
        modelId: 'provider-2/flux.1-schnell', // Model used for image generation
        isError: false,
      };
      setMessages(prev => [...prev, assistantPlaceholder]);
      setInput('');
      if (currentMessages.length === 0) setHasSubmitted(true);
      try {
        const response = await fetch('https://api.a4f.co/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ddc-a4f-039cf79cd8b546518385959f60f4b358', // Updated API key
          },
          body: JSON.stringify({
            model: 'provider-2/flux.1-schnell',
            prompt,
          }),
        });

        if (!response.ok) {
          let errorBodyText = `Image API request failed with status ${response.status}`;
          try {
            const errorJson = await response.json();
            errorBodyText += `: ${errorJson.message || errorJson.detail || JSON.stringify(errorJson)}`;
          } catch (e) {
            try {
                const textError = await response.text();
                errorBodyText += `. Response: ${textError.substring(0, 200)}`; // Limit length of text response in error
            } catch (textE) {
                // Ignore if getting text also fails
            }
          }
          throw new Error(errorBodyText);
        }

        const data = await response.json();
        const imageUrl = data?.data?.[0]?.url; // Uses the 'url' field as requested
        
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: imageUrl ? `![Generated Image](${imageUrl})` : 'No image URL returned by API.',
                isStreaming: false,
                modelId: 'provider-2/flux.1-schnell',
              }
            : msg
        ));
      } catch (error: any) {
        console.error("Image generation API error:", error);
        const errorMessageToDisplay = error.message || 'Image generation failed due to an unknown error.';
        
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: errorMessageToDisplay,
                isStreaming: false,
                isError: true,
                errorType: 'generic',
              }
            : msg
        ));
        setLastError(errorMessageToDisplay);
        setErrorType('generic');
      } finally {
        setChatStatus('ready');
      }
      return;
    }

    // ... (rest of the chat completion logic for non-image groups)
    if (!apiKey) { // This check is now specifically for non-image groups
        toast.error("API Key is required for chat functions.");
        setLastError("API Key is required for chat functions.");
        setErrorType('generic');
        setChatStatus('error');
        return;
    }
    
    const modelData = availableModels.find(m => m.value === selectedModelValue);
    if (!modelData) {
        toast.error("Selected model is not available or models not loaded. Cannot send message.");
        setLastError("Selected model is not available or models not loaded.");
        setErrorType('generic');
        setChatStatus('error');
        return;
    }

    const contentToUse = messageContent.trim();
    if (!contentToUse && currentAttachments.length === 0) return;

    setChatStatus('processing');
    setLastError(null);
    setErrorType('generic');
    setErrorDetails(null);
    internalIsStreamCancelledByUserRef.current = false;
    setIsStreamCancelledForParent(false);

    const newUserMessage: SimpleMessage = {
        id: `user-${Date.now()}-${Math.random()}`,
        role: 'user',
        content: contentToUse,
        createdAt: new Date(),
    };

    const apiPayloadMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    
    if (currentSystemPrompt && currentSystemPrompt.trim()) {
        apiPayloadMessages.push({ 
            role: 'system', 
            content: currentSystemPrompt.trim() 
        });
    }
    
    [...currentMessages, newUserMessage]
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .forEach(msg => {
            const content = msg.content || '';
            
            if (msg.role === 'user') {
                apiPayloadMessages.push({
                    role: 'user',
                    content: content as string | OpenAI.Chat.Completions.ChatCompletionContentPart[]
                });
            } else {
                apiPayloadMessages.push({
                    role: 'assistant',
                    content: content as string
                });
            }
        });

    setMessages(prevMessages => [...prevMessages, newUserMessage]);

    const assistantMessageId = `assistant-${Date.now()}-${Math.random()}`;
    currentAssistantMessageId.current = assistantMessageId;
    const assistantPlaceholder: SimpleMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
        isStreaming: true,
        modelId: selectedModelValue,
        isError: false,
    };
    setMessages(prev => [...prev, assistantPlaceholder]);

    setInput('');
    if (currentMessages.length === 0) setHasSubmitted(true);


    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: API_BASE_URL,
        dangerouslyAllowBrowser: true,
    });

    try {
        const stream = await openai.chat.completions.create({
            model: selectedModelValue,
            messages: apiPayloadMessages,
            stream: true,
        } as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming);

        const {
          finalContent,
          finalThinkingContent,
          wasCancelled,
          isEmptyStream,
          thinkTagProcessed
        } = await processStreamChunks({
          stream,
          setMessages,
          currentAssistantMessageIdRef: currentAssistantMessageId,
          isStreamCancelledByUserRef: internalIsStreamCancelledByUserRef,
        });

        const finalMessageIdToUpdate = currentAssistantMessageId.current;
        if (finalMessageIdToUpdate) {
            let finalContentForDisplay = finalContent;
            let messageIsError = false;
            let messageErrorTypeValue: SimpleMessage['errorType'] = undefined;
            let messageErrorDetailsValue: any = null;

            if (wasCancelled) {
                finalContentForDisplay += "\n\n*(Message generation stopped by user)*";
            } else if (isEmptyStream) {
                finalContentForDisplay = "The streaming response closed without providing any content. We recommend switching to a different model from provider-4 or provider-5 as they tend to be more stable.";
                setLastError(finalContentForDisplay);
                setErrorType('empty-stream');
                messageIsError = true;
                messageErrorTypeValue = 'empty-stream';
            }

            setMessages(prev =>
                prev.map((msg: SimpleMessage) =>
                    msg.id === finalMessageIdToUpdate
                        ? {
                            ...msg,
                            content: finalContentForDisplay,
                            thinkingContent: finalThinkingContent || undefined,
                            isThinkingInProgress: false,
                            thinkingCompleted: thinkTagProcessed && (finalThinkingContent || "").length > 0,
                            isStreaming: false,
                            modelId: selectedModelValue,
                            isError: messageIsError,
                            errorType: messageErrorTypeValue,
                            errorDetails: messageErrorDetailsValue,
                            isInterrupted: wasCancelled,
                          }
                        : msg
                )
            );
        }
        currentAssistantMessageId.current = null;

    } catch (error: any) {
        handleStreamError({
            error,
            setMessages,
            currentAssistantMessageIdRef: currentAssistantMessageId,
            selectedModelValue,
            setLastError,
            setErrorType,
            setErrorDetails,
        });
        toast.error(lastError || 'An unexpected error occurred while processing your request.');
        currentAssistantMessageId.current = null;
    } finally {
        setChatStatus('ready');
    }
  }, [
      apiKey, 
      selectedModelValue, 
      availableModels, 
      currentMessages, 
      currentAttachments, 
      currentSelectedGroup, 
      currentSystemPrompt, 
      setMessages, 
      setInput, 
      setHasSubmitted, 
      setIsStreamCancelledForParent,
  ]);

  return {
    handleSend,
    handleStopStreaming,
    chatStatus,
    isStreamCancelledByUser: isStreamCancelledForParent,
    lastError,
    errorType,
    errorDetails,
    currentAssistantMessageId,
  };
}

