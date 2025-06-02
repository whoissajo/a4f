// components/message.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MarkdownRenderer } from '@/components/markdown';
import { TextFadeAnimation } from '@/components/text-fade-animation'; // Import the new fade animation component
import { User, Bot, Clock, AlertTriangle, AlertOctagon, ExternalLink } from 'lucide-react';
import { cn, SimpleMessage, ModelUIData } from '@/lib/utils'; // Use types from utils
import { useUserAvatar } from '@/hooks/use-user-avatar';
import { Button } from '@/components/ui/button';
import { InteractionButtons } from '@/components/interaction-buttons';
import { ErrorMessage } from '@/components/error-message';
import { ThinkingCardDisplay } from '@/components/thinking-card';

interface MessageProps {
    message: SimpleMessage;
    index: number;
    models?: ModelUIData[]; // Available models for logo display
    userAvatarUrl?: string | null; // User's avatar URL
}

// Removed detectErrorType function as we now use explicit error properties

export const Message: React.FC<MessageProps> = ({ message, index, models = [], userAvatarUrl = null }) => {
    const isUser = message.role === 'user';
    const isStreaming = message.role === 'assistant' && message.isStreaming;
    const isErrorMessage = !isUser && message.isError === true;
    const actualErrorType = message.errorType || 'generic';
    
    // Helper function to handle the upgrade button click
    const handleUpgradeClick = () => {
        window.open('https://a4f.co/pricing', '_blank');
    };

    const renderAiLogo = (modelId?: string) => {
        // Find model by its value (which is the model ID)
        const model = modelId ? models.find((model) => model.value === modelId) : undefined;
        
        if (model?.logoUrl) {
            // For logo URLs, check if we should use a separate dark mode specific image
            // This is a common approach where some logos have dark/light variants
            const logoUrl = model.logoUrl;
            
            return (
                <div className="relative w-5 h-5 flex items-center justify-center">
                    {/* Light mode version - only shown in light mode */}
                    <Image
                        src={logoUrl}
                        alt={model.label || 'AI'}
                        width={20}
                        height={20}
                        className="dark:hidden"
                        unoptimized
                    />
                    {/* Dark mode version - only shown in dark mode */}
                    <Image
                        src={logoUrl}
                        alt={model.label || 'AI'}
                        width={20}
                        height={20}
                        className="hidden dark:block dark:invert"
                        unoptimized
                    />
                </div>
            );
        }
        // Default fallback to the generic Bot icon
        // Bot icon already has proper contrast with text-neutral classes
        return <Bot className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />;
    };

    return (
        <motion.div
            key={`${message.role}-${message.id}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: isUser ? 0 : 0.1 }}
            className={cn(
                "px-0 mb-4 sm:mb-5",
                isUser ? "flex justify-end" : "flex justify-start" // Align outer container
            )}
        >
            <div className={cn(
                "flex items-start gap-2 sm:gap-3 w-full",
                isUser ? "justify-end" : "justify-start"
            )}>
                {/* Assistant Icon (Left) */}
                {!isUser && (
                    <div className={cn(
                        "flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center self-start border border-neutral-200 dark:border-neutral-800",
                        (message.thinkingContent || message.isThinkingInProgress) ? "mt-4" : 
                        isErrorMessage ? "mt-3" : "mt-1"
                    )}>
                        {renderAiLogo(message.modelId)}
                    </div>
                )}

                {/* Message Content Container (No Bubble Styling) */}
                <div className={cn(
                    "flex flex-col", // Stack content
                    "max-w-[85%] sm:max-w-[75%] md:max-w-[70%]" // Limit width
                    // REMOVED: Bubble background, padding, and border-radius classes
                )}>
                    {/* Removed the inner div with bubble styling */}
                    {isUser ? (
                        <div className="text-base font-medium break-words whitespace-pre-wrap text-neutral-900 dark:text-neutral-100"> {/* Ensure text color is set */}
                            <MarkdownRenderer content={message.content} />
                        </div>
                    ) : isErrorMessage ? (
                        <ErrorMessage 
                            type={actualErrorType}
                            message={message.content}
                            details={message.errorDetails}
                        />
                    
                    ) : isStreaming && !message.content && !message.thinkingContent ? (
                        // Thinking Animation - ONLY displayed when there's no content yet
                        <div className="py-2">
                            <div className="flex items-center space-x-2">
                                <motion.div 
                                    className="thinking-animation flex items-center space-x-1"
                                    initial={{ opacity: 0.7 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                                >
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={`dot-${i}`}
                                            className="h-2 w-2 bg-neutral-800 dark:bg-neutral-200 rounded-full"
                                            initial={{ y: 0 }}
                                            animate={{ 
                                                y: [0, -10, 0],
                                                scale: [1, 1.2, 1]
                                            }}
                                            transition={{
                                                duration: 1.2,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    ))}
                                </motion.div>
                                <motion.div
                                    className="thinking-animation-text text-sm text-neutral-600 dark:text-neutral-400 ml-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.span
                                        initial={{ opacity: 0.5 }}
                                        animate={{ 
                                            opacity: [0.5, 1, 0.5],
                                            scale: [1, 1.02, 1]
                                        }}
                                        transition={{ 
                                            duration: 2, 
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        Thinking
                                    </motion.span>
                                </motion.div>
                            </div>
                            
                            <motion.div 
                                className="thinking-bar mt-2 h-[2px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent dark:via-neutral-200 rounded-full"
                                initial={{ width: "0%", opacity: 0.7 }}
                                animate={{ 
                                    width: ["0%", "30%", "70%", "100%", "70%", "30%", "0%"],
                                    opacity: [0.5, 0.8, 1, 0.8, 0.5]
                                }}
                                transition={{ 
                                    duration: 3.5, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                    ) : (
                        // Use TextFadeAnimation for streaming, otherwise use the regular MarkdownRenderer
                        <>
                            {/* Thinking Card - Display before the main content */}
                            {(message.thinkingContent || message.isThinkingInProgress) && (
                                <ThinkingCardDisplay 
                                    thinkContent={message.thinkingContent || ''} 
                                    isThinkingInProgress={!!message.isThinkingInProgress}
                                />
                            )}

                            {/* Main Content */}
                            {isStreaming ? (
                                <TextFadeAnimation 
                                    content={message.content} 
                                    isStreaming={isStreaming}
                                />
                            ) : (
                                <MarkdownRenderer content={message.content} />
                            )}
                            
                            {/* Interaction Buttons - Only for assistant messages and when not streaming */}
                            {!isStreaming && message.content && (
                                <InteractionButtons messageId={message.id} content={message.content} />
                            )}
                        </>
                    )}
                </div>

                 {/* User Icon (Right) */}
                {isUser && (
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center self-start mt-4 border border-neutral-300 dark:border-neutral-700 overflow-hidden">
                        {userAvatarUrl ? (
                            <Image
                                src={userAvatarUrl}
                                alt="User"
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <User className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        )}
                    </div>
                )}

                 {/* Removed the old copy button that was positioned to the left */}
            </div>
        </motion.div>
    );
};