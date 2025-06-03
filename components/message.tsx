
// components/message.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MarkdownRenderer } from '@/components/markdown';
import { TextFadeAnimation } from '@/components/text-fade-animation'; 
import { User, Bot, Clock, AlertTriangle, AlertOctagon, ExternalLink } from 'lucide-react';
import { cn, SimpleMessage, ModelUIData } from '@/lib/utils'; 
import { useUserAvatar } from '@/hooks/use-user-avatar';
import { Button } from '@/components/ui/button';
import { InteractionButtons } from '@/components/interaction-buttons';
import { ErrorMessage } from '@/components/error-message';
import { ThinkingCardDisplay } from '@/components/thinking-card';

interface MessageProps {
    message: SimpleMessage;
    index: number;
    models?: ModelUIData[]; 
    userAvatarUrl?: string | null; 
    onRetry?: (assistantMessageIdToRetry: string) => void; // Added onRetry
}


export const Message: React.FC<MessageProps> = ({ message, index, models = [], userAvatarUrl = null, onRetry }) => {
    const isUser = message.role === 'user';
    const isStreaming = message.role === 'assistant' && message.isStreaming;
    const isErrorMessage = !isUser && message.isError === true;
    const actualErrorType = message.errorType || 'generic';
    
    
    const handleUpgradeClick = () => {
        window.open('https://a4f.co/pricing', '_blank');
    };

    const renderAiLogo = (modelId?: string) => {
        
        const model = modelId ? models.find((model) => model.value === modelId) : undefined;
        
        if (model?.logoUrl) {
            
            const logoUrl = model.logoUrl;
            
            return (
                <div className="relative w-5 h-5 flex items-center justify-center">
                    
                    <Image
                        src={logoUrl}
                        alt={model.label || 'AI'}
                        width={20}
                        height={20}
                        className="dark:hidden"
                        unoptimized
                    />
                    
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
                isUser ? "flex justify-end" : "flex justify-start" 
            )}
        >
            <div className={cn(
                "flex items-start gap-2 sm:gap-3 w-full",
                isUser ? "justify-end" : "justify-start"
            )}>
                
                {!isUser && (
                    <div className={cn(
                        "flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center self-start border border-neutral-200 dark:border-neutral-800",
                        (message.thinkingContent || message.isThinkingInProgress) ? "mt-4" : 
                        isErrorMessage ? "mt-3" : "mt-1"
                    )}>
                        {renderAiLogo(message.modelId)}
                    </div>
                )}

                
                <div className={cn(
                    "flex flex-col", 
                    "max-w-[85%] sm:max-w-[75%] md:max-w-[70%]" 
                    
                )}>
                    
                    {isUser ? (
                        <div className="text-base font-medium break-words whitespace-pre-wrap text-neutral-900 dark:text-neutral-100"> 
                            <MarkdownRenderer content={message.content} />
                        </div>
                    ) : isErrorMessage ? (
                        <ErrorMessage 
                            type={actualErrorType}
                            message={message.content}
                            details={message.errorDetails}
                        />
                    
                    ) : isStreaming && !message.content && !message.thinkingContent ? (
                        
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
                        
                        <>
                            
                            {(message.thinkingContent || message.isThinkingInProgress) && (
                                <ThinkingCardDisplay 
                                    thinkContent={message.thinkingContent || ''} 
                                    isThinkingInProgress={!!message.isThinkingInProgress}
                                />
                            )}

                            
                            {isStreaming ? (
                                <TextFadeAnimation 
                                    content={message.content} 
                                    isStreaming={isStreaming}
                                />
                            ) : (
                                <MarkdownRenderer content={message.content} />
                            )}
                            
                            
                            {!isStreaming && message.content && (
                                <InteractionButtons 
                                    messageId={message.id} 
                                    content={message.content} 
                                    onRetry={onRetry} // Pass onRetry
                                    isError={message.isError} // Pass isError
                                />
                            )}
                        </>
                    )}
                </div>

                 
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

                 
            </div>
        </motion.div>
    );
};
