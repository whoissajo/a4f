"use client";
import 'katex/dist/katex.min.css';
import '@/styles/custom-scrollbar.css';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound } from 'lucide-react';
import { ArrowDown } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { searchGroups } from '@/lib/utils';
import { GroupSelector } from '@/components/ui/form-component/group-select';
import { ApiKeyNotification } from '@/components/ui/form-component/notifications';

import { Button } from '@/components/ui/button';
import FormComponent from '@/components/ui/form-component';
import Messages from '@/components/messages';
import { ApiKeysDialog, SimpleApiKeyInput } from '@/components/api-keys';
import { AccountDialog } from '@/components/account-dialog';

import { useUserAvatar } from '@/hooks/use-user-avatar';
import { cn } from '@/lib/utils';

import { useChatLogic } from '@/app/page-hooks/use-chat-logic';
import { useScrollManagement } from '@/app/page-hooks/use-scroll-management';
import { PageNavbar } from '@/app/page-components/page-navbar';
import { DateTimeWidgets } from '@/app/page-components/date-time-widgets';


const HomeContent = () => {
    const {
        apiKey, setApiKey, isKeyLoaded,
        apiKeys, setApiKeyByType, isKeysLoaded,
        availableModels,
        selectedModel, setSelectedModel,
        messages,
        input, setInput,
        attachments, setAttachments,
        systemPrompt, setSystemPrompt,
        isSystemPromptVisible, setIsSystemPromptVisible,
        status,
        handleSend, handleStopStreaming, fetchAccountInfo, resetChatState,
        selectedGroup, setSelectedGroup,
        hasSubmitted, setHasSubmitted,
        isApiKeyDialogOpen, setIsApiKeyDialogOpen,
        showSimpleApiKeyInput, setShowSimpleApiKeyInput,
        isAccountDialogOpen, setIsAccountDialogOpen,
        accountInfo,
        isAccountLoading,
        currentPlan, setCurrentPlan,
        isTavilyKeyAvailable, handleGroupSelection,
        fileInputRef, inputRef, systemPromptInputRef
    } = useChatLogic();

    const [isStreamingState, setIsStreamingState] = useState(false);
    const [isGroupSelectorExpanded, setIsGroupSelectorExpanded] = useState(false);
    useEffect(() => {
      const streamingMessage = messages.find(msg => msg.isStreaming);
      setIsStreamingState(!!streamingMessage);
    }, [messages]);

    const { bottomRef, showScrollButton, scrollToBottom } = useScrollManagement(messages, isStreamingState);
    const userAvatarUrl = useUserAvatar(accountInfo);
    const { setTheme: setNextThemeHook } = useTheme();

    useEffect(() => {
      const handleThemeMessage = (event: MessageEvent) => {
        if (event.data.type === "THEME_CHANGE") {
          setNextThemeHook(event.data.theme);
        }
      };
      window.addEventListener("message", handleThemeMessage);
      return () => {
        window.removeEventListener("message", handleThemeMessage);
      };
    }, [setNextThemeHook]);

    const handleWidgetDateTimeClick = useCallback(() => {
      handleSend("What's the current date and time?");
    }, [handleSend]);
    
    const handleGroupSelect = useCallback((group: any) => {
      // This is just a UI notification handler, actual group selection is handled by handleGroupSelection
      // The implementation will be added if needed
    }, []);

    const showCenteredForm = messages.length === 0 && !hasSubmitted;
    const showChatInterface = isKeyLoaded && apiKey;

    return (
        <div className="flex flex-col font-sans items-center min-h-screen bg-background text-foreground transition-colors duration-500">
            <PageNavbar
                hasMessages={messages.length > 0 || hasSubmitted}
                onNewChat={resetChatState}
                onOpenAccountDialog={() => setIsAccountDialogOpen(true)}
                onOpenApiKeyDialog={() => setIsApiKeyDialogOpen(true)}
            />

            {/* Simple API key input for first-time users */}
            <SimpleApiKeyInput
                apiKey={apiKey}
                setApiKey={setApiKey}
                isKeyLoaded={isKeyLoaded}
                isOpen={showSimpleApiKeyInput}
                onOpenChange={setShowSimpleApiKeyInput}
            />
            
            {/* Advanced API keys management dialog */}
            <ApiKeysDialog
                apiKeys={apiKeys}
                setApiKey={setApiKeyByType}
                isKeysLoaded={isKeysLoaded}
                isOpen={isApiKeyDialogOpen}
                onOpenChange={setIsApiKeyDialogOpen}
                onSwitchToWebSearch={() => {
                    const webGroup = searchGroups.find(g => g.id === 'web');
                    if (webGroup) {
                        handleGroupSelection(webGroup, selectedGroup, setSelectedGroup);
                    }
                }}
            />

            <div className={cn(
                "w-full flex-1 flex flex-col items-center",
                "pt-20",
                showCenteredForm && showChatInterface ? "justify-center" : "pb-40"
            )}>
                <div className={cn(
                    "w-full max-w-[26rem] sm:max-w-2xl space-y-6 px-2 sm:px-0 mx-auto transition-all duration-300 flex-grow flex flex-col",
                    showCenteredForm && showChatInterface ? "justify-center -mt-16" : "justify-start"
                )}>
                    {!apiKey && isKeyLoaded && !isApiKeyDialogOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center flex flex-col items-center justify-center h-full -mt-20"
                        >
                            <KeyRound size={48} className="text-muted-foreground mb-4" />
                            <h1 className="text-xl sm:text-2xl mb-2 text-neutral-800 dark:text-neutral-100 font-semibold">API Key Required</h1>
                            <p className="text-sm text-muted-foreground mb-6">
                                Please set your API key via the <KeyRound className="inline h-4 w-4 align-text-bottom"/> settings menu to begin.
                            </p>
                            <Button onClick={() => setShowSimpleApiKeyInput(true)}>Set API Key</Button>
                        </motion.div>
                    )}

                    {showCenteredForm && showChatInterface && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            <h1 className="text-2xl sm:text-4xl mb-4 sm:mb-6 text-neutral-800 dark:text-neutral-100 font-syne">
                                What do you want to explore?
                            </h1>
                            <FormComponent
                                input={input}
                                setInput={setInput}
                                handleSend={handleSend}
                                handleStopStreaming={handleStopStreaming}
                                status={status}
                                selectedModel={selectedModel}
                                setSelectedModel={setSelectedModel}
                                models={availableModels}
                                attachments={attachments}
                                setAttachments={setAttachments}
                                fileInputRef={fileInputRef}
                                inputRef={inputRef}
                                systemPromptInputRef={systemPromptInputRef}
                                systemPrompt={systemPrompt}
                                setSystemPrompt={setSystemPrompt}
                                isSystemPromptVisible={isSystemPromptVisible}
                                setIsSystemPromptVisible={setIsSystemPromptVisible}
                                messages={messages}
                                selectedGroup={selectedGroup}
                                setSelectedGroup={(group) => {
                                    // Custom handler for group selection that checks API keys
                                    if (group === 'web' && !isTavilyKeyAvailable()) {
                                        // Briefly set to web to show a visual indication
                                        setSelectedGroup('web');
                                        
                                        // Show a toast notification
                                        toast.error('Tavily API key required for web search', {
                                            description: 'Please add your Tavily API key in settings',
                                            action: {
                                                label: 'Add Key',
                                                onClick: () => setIsApiKeyDialogOpen(true)
                                            },
                                            duration: 5000
                                        });
                                        
                                        // After a brief delay, switch back to chat
                                        setTimeout(() => {
                                            // Find all web toggle buttons and add a subtle shake animation
                                            const webButtons = document.querySelectorAll('button[data-group-id="web"]');
                                            webButtons.forEach(button => {
                                                button.animate(
                                                    [
                                                        { transform: 'translateX(0px)' },
                                                        { transform: 'translateX(3px)' },
                                                        { transform: 'translateX(-3px)' },
                                                        { transform: 'translateX(2px)' },
                                                        { transform: 'translateX(-2px)' },
                                                        { transform: 'translateX(1px)' },
                                                        { transform: 'translateX(0px)' }
                                                    ],
                                                    { duration: 400, easing: 'ease-in-out' }
                                                );
                                            });
                                            
                                            // Switch back to chat after the animation
                                            setTimeout(() => {
                                                setSelectedGroup('chat');
                                            }, 400);
                                        }, 100);
                                        
                                        return;
                                    }
                                    
                                    // If we have the necessary API key, proceed with the selection
                                    setSelectedGroup(group);
                                }}
                                setHasSubmitted={setHasSubmitted}
                                currentPlan={currentPlan}
                                onPlanChange={setCurrentPlan}
                            />
                            <DateTimeWidgets status={status} apiKey={apiKey} onDateTimeClick={handleWidgetDateTimeClick} />
                        </motion.div>
                    )}

                    {!showCenteredForm && showChatInterface && messages.length > 0 && (
                        <Messages messages={messages} models={availableModels} userAvatarUrl={userAvatarUrl} />
                    )}
                    {!showCenteredForm && showChatInterface && (
                        <div ref={bottomRef} data-testid="bottom-ref" className="h-20 flex-shrink-0" />
                    )}
                </div>
            </div>

            <AccountDialog
                isOpen={isAccountDialogOpen}
                onOpenChange={setIsAccountDialogOpen}
                accountInfo={accountInfo}
                isLoading={isAccountLoading}
                onRefresh={fetchAccountInfo}
            />
            
            {/* No external animation component needed */}

            <AnimatePresence>
                {!showCenteredForm && showChatInterface && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-4 left-0 right-0 w-full max-w-[26rem] sm:max-w-2xl mx-auto z-20 px-2 sm:px-0"
                    >
                        {showScrollButton && (
                            <div className="absolute -top-14 left-0 right-0 flex justify-center">
                                <motion.button
                                    onClick={scrollToBottom}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: [0.22, 1, 0.36, 1],
                                        type: "spring",
                                        stiffness: 120,
                                        damping: 14
                                    }}
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border dark:border-neutral-700 shadow-sm hover:shadow-md hover:bg-background/95 transition-all duration-300"
                                    aria-label="Scroll to bottom"
                                >
                                    <ArrowDown weight="bold" className="w-5 h-5 text-foreground" />
                                </motion.button>
                            </div>
                        )}
                        <FormComponent
                            input={input}
                            setInput={setInput}
                            handleSend={handleSend}
                            handleStopStreaming={handleStopStreaming}
                            status={status}
                            selectedModel={selectedModel}
                            setSelectedModel={setSelectedModel}
                            models={availableModels}
                            attachments={attachments}
                            setAttachments={setAttachments}
                            fileInputRef={fileInputRef}
                            inputRef={inputRef}
                            systemPromptInputRef={systemPromptInputRef}
                            systemPrompt={systemPrompt}
                            setSystemPrompt={setSystemPrompt}
                            isSystemPromptVisible={isSystemPromptVisible}
                            setIsSystemPromptVisible={setIsSystemPromptVisible}
                            messages={messages}
                            selectedGroup={selectedGroup}
                            setSelectedGroup={setSelectedGroup}
                            setHasSubmitted={setHasSubmitted}
                            currentPlan={currentPlan}
                            onPlanChange={setCurrentPlan}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Home = () => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-lg">Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
};

export default Home;