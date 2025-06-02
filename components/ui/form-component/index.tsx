import React, { useState, useRef, useCallback, useEffect, ReactNode, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../button';
import { Textarea } from '../textarea';
import useWindowSize from '../../../hooks/use-window-size';
import { X, StopCircle, Upload, Bot as DefaultBotIcon } from 'lucide-react';
import SystemPromptInput from '../../system-prompt-input';
import SystemPromptIcon from '../system-prompt-icon';
import { cn, SearchGroupId, SimpleMessage, Attachment, ModelUIData, SearchGroup } from '@/lib/utils'; // Path updated to alias

import { MAX_IMAGES, MAX_INPUT_CHARS } from './constants';
import { ArrowUpIcon, PaperclipIcon } from './icons';
import { UploadingAttachment } from './types';
import { hasVisionSupport } from './model-select/utils'; // Path corrected
import { AttachmentPreview } from './attachments';
import { ModelSwitcher } from './model-select';
import { GroupSelector } from './group-select';
import { SwitchNotification } from './notifications';


interface FormComponentProps {
    input: string;
    setInput: (input: string) => void;
    attachments: Array<Attachment>;
    setAttachments: React.Dispatch<React.SetStateAction<Array<Attachment>>>;
    handleSend: (content: string) => void;
    handleStopStreaming: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    inputRef: React.RefObject<HTMLTextAreaElement>;
    systemPromptInputRef?: React.RefObject<HTMLTextAreaElement>;
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    selectedGroup: SearchGroupId;
    setSelectedGroup: React.Dispatch<React.SetStateAction<SearchGroupId>>;
    messages: Array<SimpleMessage>;
    status: 'ready' | 'processing' | 'error';
    setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
    systemPrompt: string;
    setSystemPrompt: (prompt: string) => void;
    isSystemPromptVisible: boolean;
    setIsSystemPromptVisible: (visible: boolean) => void;
    models: ModelUIData[];
    currentPlan: 'free' | 'pro';
    onPlanChange: (plan: 'free' | 'pro') => void;
}

const FormComponent: React.FC<FormComponentProps> = ({
    input,
    setInput,
    attachments,
    setAttachments,
    handleSend,
    handleStopStreaming,
    fileInputRef,
    inputRef,
    systemPromptInputRef,
    selectedModel,
    setSelectedModel,
    selectedGroup,
    setSelectedGroup,
    messages,
    status,
    setHasSubmitted,
    systemPrompt,
    setSystemPrompt,
    isSystemPromptVisible,
    setIsSystemPromptVisible,
    models,
    currentPlan,
    onPlanChange,
}) => {
    const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
    const isMounted = useRef(true);
    const isCompositionActive = useRef(false);
    const { width } = useWindowSize();
    const [isFocused, setIsFocused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isGroupSelectorExpanded, setIsGroupSelectorExpanded] = useState(false);
    const [switchNotification, setSwitchNotification] = useState<{
        show: boolean;
        icon: React.ReactNode;
        title: string;
        description: string;
        notificationType?: 'model' | 'group';
        visibilityTimeout?: NodeJS.Timeout;
        modelColor?: string;
    }>({ show: false, icon: null, title: '', description: '', notificationType: 'model', modelColor: 'default', visibilityTimeout: undefined });

    // Add state for image mode
    const [isImageMode, setIsImageMode] = useState(selectedGroup === 'image');
    useEffect(() => { setIsImageMode(selectedGroup === 'image'); }, [selectedGroup]);

    const isMobile = width ? width < 768 : false;

    const showSwitchNotification = useCallback((title: string, description: string, iconNode?: React.ReactNode, color?: string, type: 'model' | 'group' = 'model') => {
        if (switchNotification.visibilityTimeout) { clearTimeout(switchNotification.visibilityTimeout); }
        const newNotification = {
            show: true,
            icon: iconNode || null,
            title,
            description,
            notificationType: type,
            modelColor: type === 'model' ? (color || 'gray') : undefined,
            visibilityTimeout: undefined
        };
        setSwitchNotification(newNotification);
        const timeout = setTimeout(() => { setSwitchNotification(prev => ({ ...prev, show: false })); }, 3000);
        setSwitchNotification(prev => ({ ...prev, visibilityTimeout: timeout }));
    }, [switchNotification.visibilityTimeout]);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (switchNotification.visibilityTimeout) { clearTimeout(switchNotification.visibilityTimeout); }
        };
    }, [switchNotification.visibilityTimeout]);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => { const newValue = event.target.value; if (newValue.length <= MAX_INPUT_CHARS) { setInput(newValue); } else { toast.error(`Input limited to ${MAX_INPUT_CHARS} characters.`); setInput(newValue.slice(0, MAX_INPUT_CHARS)); } };
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleGroupSelect = useCallback((group: SearchGroup) => {
        setSelectedGroup(group.id);
        inputRef.current?.focus();
        const GroupIcon = group.icon;
        showSwitchNotification(group.name, group.description, <GroupIcon className="size-4" />, undefined, 'group');
    }, [setSelectedGroup, inputRef, showSwitchNotification]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const currentModelSupportsVision = hasVisionSupport(selectedModel, models);
        if (!currentModelSupportsVision && files.length > 0) {
            toast.warning(`Model '${models.find(m => m.value === selectedModel)?.label || selectedModel}' does not have vision capabilities. Please switch to a model with vision support to use attachments.`);
            event.target.value = '';
            return;
        }
        if (attachments.length + files.length > MAX_IMAGES) {
            toast.error(`You can attach a maximum of ${MAX_IMAGES} images.`);
            event.target.value = '';
            return;
        }
        if (files.length > 0) {
            toast.info("Attachment added (frontend only).");
            const newAttachments = files.map(file => ({ name: file.name, contentType: file.type, url: URL.createObjectURL(file), size: file.size, }));
            setAttachments(prev => [...prev, ...newAttachments]);
        }
        event.target.value = '';
    }, [attachments.length, setAttachments, selectedModel, models]);

    const removeAttachment = (index: number) => { const attachmentToRemove = attachments[index]; if (attachmentToRemove.url?.startsWith('blob:')) { URL.revokeObjectURL(attachmentToRemove.url); } setAttachments(prev => prev.filter((_, i) => i !== index)); };
    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (hasVisionSupport(selectedModel, models)) setIsDragging(true); }, [selectedModel, models]);
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
    const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (!hasVisionSupport(selectedModel, models)) { toast.warning(`Current model does not have vision capabilities. Cannot drop attachments.`); return; } const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/')); if (files.length > 0 && attachments.length + files.length <= MAX_IMAGES) { toast.info("Attachment drop simulated (frontend only)."); const newAttachments = files.map(file => ({ name: file.name, contentType: file.type, url: URL.createObjectURL(file), size: file.size })); setAttachments(prev => [...prev, ...newAttachments]); } else if (files.length === 0) { toast.error("Only image files can be dropped."); } else { toast.error(`Max ${MAX_IMAGES} images allowed.`); } }, [attachments.length, setAttachments, selectedModel, models]);
    const handlePaste = useCallback((e: React.ClipboardEvent) => { if (!hasVisionSupport(selectedModel, models)) return; const items = Array.from(e.clipboardData.items); const imageItems = items.filter(item => item.type.startsWith('image/')); if (imageItems.length > 0) { e.preventDefault(); if (attachments.length + imageItems.length <= MAX_IMAGES) { toast.info("Image paste simulated (frontend only)."); const files = imageItems.map(item => item.getAsFile()).filter(Boolean) as File[]; const newAttachments = files.map(file => ({ name: file.name || `Pasted Image ${Date.now()}`, contentType: file.type, url: URL.createObjectURL(file), size: file.size })); setAttachments(prev => [...prev, ...newAttachments]); } else { toast.error(`Max ${MAX_IMAGES} images allowed.`); } } }, [attachments.length, setAttachments, selectedModel, models]);

    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click();
    }, [fileInputRef]);

    const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (status === 'processing') { toast.error("Please wait for the response."); return; }
        if (input.trim() || attachments.length > 0) {
            if (attachments.length > 0 && !hasVisionSupport(selectedModel, models)) {
                toast.error(`Model '${models.find(m => m.value === selectedModel)?.label || selectedModel}' does not have vision capabilities. Remove attachments or switch to a model with vision support.`);
                return;
            }
            if (!messages || messages.length === 0) setHasSubmitted(true);

            if (isSystemPromptVisible) {
                setIsSystemPromptVisible(false);
            }

            handleSend(input.trim());
        } else {
            toast.error("Please enter a message.");
        }
    }, [input, attachments, handleSend, status, setHasSubmitted, messages, selectedModel, models, isSystemPromptVisible, setIsSystemPromptVisible]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === "Enter" && !event.shiftKey && !isCompositionActive.current) { event.preventDefault(); if (status === 'processing') { toast.error("Please wait..."); } else { onSubmit({ preventDefault: () => { }, stopPropagation: () => { } } as React.FormEvent<HTMLFormElement>); } } };

    const handleModelSelect = useCallback((model: ModelUIData) => {
        const IconElement = model.logoUrl
            ? <img src={model.logoUrl} alt={model.label} className={cn("size-4 rounded-sm object-contain", model.logoUrl.endsWith('.svg') && "themeable-svg-logo")} />
            : (model.icon ? <model.icon className="size-4" /> : <DefaultBotIcon className="size-4" />);

        const notificationTitle = model.label;
        const notificationDescription = model.owner ? `Provider: ${model.apiProvider} (via ${model.owner})` : `Provider: ${model.apiProvider}`;

        showSwitchNotification(
            notificationTitle,
            notificationDescription,
            IconElement,
            model.color,
            'model'
        );
        if ((!model.features || !model.features.includes('vision')) && attachments.length > 0) {
            toast.warning(`Model ${model.label} does not have vision capabilities. Attachments will be ignored if you send now.`, { duration: 5000 });
        }
    }, [showSwitchNotification, attachments.length]);

    const isProcessing = status === 'processing';
    const hasInteracted = messages && messages.length > 0;
    const currentModelSupportsVision = hasVisionSupport(selectedModel, models);

    const AttachButtonElement = (
        <Button
            type="button"
            className={cn(
                "rounded-full p-1.5 h-8 w-8 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600",
                !currentModelSupportsVision && "opacity-50"
            )}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                if (!currentModelSupportsVision) {
                    toast.warning("Current model does not have vision capabilities. Consider switching to a model with vision support to attach images.");
                } else if (attachments.length >= MAX_IMAGES) {
                    toast.error(`You can attach a maximum of ${MAX_IMAGES} images.`);
                } else {
                    triggerFileInput();
                }
            }}
            variant="outline"
            disabled={isProcessing}
            aria-label={currentModelSupportsVision ? "Attach image" : "Attach image (model does not have vision capabilities)"}
            title={currentModelSupportsVision ? "Attach image" : "Current model does not have vision capabilities. Click for more info."}
        >
            <PaperclipIcon size={14} />
        </Button>
    );

    const SendButtonElement = (
        <Button
            type="submit"
            className="rounded-full p-1.5 h-8 w-8"
            disabled={isProcessing || (input.trim().length === 0 && attachments.length === 0) || uploadQueue.length > 0}
            aria-label={isImageMode ? "Generate image" : "Send message"}
        >
            <ArrowUpIcon size={14} />
        </Button>
    );

    return (
        <div className="flex flex-col w-full">
            <form onSubmit={onSubmit} className="w-full">
                <div
                    className={cn(
                        "relative w-full flex flex-col gap-1 rounded-lg transition-all duration-300 font-sans!",
                        hasInteracted ? "z-50" : "",
                        isDragging && currentModelSupportsVision && "ring-1 ring-neutral-300 dark:ring-neutral-700",
                        attachments.length > 0 || uploadQueue.length > 0
                            ? "bg-gray-100/70 dark:bg-neutral-800/80 p-1"
                            : "bg-transparent"
                    )}
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} >
                    <AnimatePresence> {isDragging && currentModelSupportsVision && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 backdrop-blur-[2px] bg-background/80 dark:bg-neutral-900/80 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center z-50 m-2 pointer-events-none"> <div className="flex items-center gap-4 px-6 py-8"> <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 shadow-xs"> <Upload className="h-6 w-6 text-neutral-600 dark:text-neutral-400" /> </div> <div className="space-y-1 text-center"> <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Drop images here</p> <p className="text-xs text-neutral-500 dark:text-neutral-500">Max {MAX_IMAGES} images</p> </div> </div> </motion.div>)} </AnimatePresence>
                    <input type="file" className="hidden" ref={fileInputRef} multiple onChange={handleFileChange} accept="image/*" tabIndex={-1} />
                    {(attachments.length > 0 || uploadQueue.length > 0) && (<div className="flex flex-row gap-2 overflow-x-auto py-2 max-h-28 z-10 px-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent"> {attachments.map((attachment, index) => (<AttachmentPreview key={attachment.url || `local-${index}`} attachment={attachment} onRemove={() => removeAttachment(index)} isUploading={false} />))} {uploadQueue.map((filename) => (<AttachmentPreview key={filename} attachment={{ name: filename } as UploadingAttachment} onRemove={() => { }} isUploading={true} />))} </div>)}

                    <div className="relative">
                        <SwitchNotification icon={switchNotification.icon} title={switchNotification.title} description={switchNotification.description} isVisible={switchNotification.show} modelColor={switchNotification.modelColor} notificationType={switchNotification.notificationType} />

                        <SystemPromptInput
                            systemPrompt={systemPrompt}
                            onSystemPromptChange={setSystemPrompt}
                            isVisible={isSystemPromptVisible}
                            isProcessing={status === 'processing'}
                            inputRef={systemPromptInputRef}
                        />

                        <div className="relative rounded-lg bg-neutral-100 dark:bg-neutral-900">
                            <Textarea ref={inputRef} placeholder={hasInteracted ? "Ask a new question..." : "Ask anything..."} value={input} onChange={handleInput} disabled={isProcessing} onFocus={handleFocus} onBlur={handleBlur} className={cn("w-full rounded-lg resize-none md:text-base!", "text-base leading-relaxed", "bg-neutral-100 dark:bg-neutral-900", "border border-neutral-200! dark:border-neutral-700!", "focus:border-neutral-300! dark:!focus:!border-neutral-500", isFocused ? "border-neutral-300! dark:border-neutral-500!" : "", "text-neutral-900 dark:text-neutral-100", "focus:ring-0!", "px-4 py-4 pb-16", "touch-manipulation", "whatsize")} rows={1} autoFocus={!isMobile && !hasInteracted} onCompositionStart={() => isCompositionActive.current = true} onCompositionEnd={() => isCompositionActive.current = false} onKeyDown={handleKeyDown} onPaste={handlePaste} />

                            <div className={cn(
                                "absolute bottom-0 inset-x-0 flex justify-between items-center p-2 rounded-b-lg",
                                "bg-neutral-100 dark:bg-neutral-900",
                                "border-t-0 border-x border-b border-neutral-200! dark:border-neutral-700!",
                                isFocused ? "border-neutral-300! dark:border-neutral-500!" : ""
                            )}>
                                <div className={cn("flex items-center gap-2", isMobile && "overflow-hidden")} >
                                    <GroupSelector selectedGroup={selectedGroup} onGroupSelect={handleGroupSelect} status={status} onExpandChange={setIsGroupSelectorExpanded} />
                                    <div className={cn("transition-all duration-300", (isMobile && isGroupSelectorExpanded) ? "opacity-0 invisible w-0" : "opacity-100 visible w-auto")}>
                                        <ModelSwitcher
                                            selectedModel={selectedModel}
                                            setSelectedModel={setSelectedModel}
                                            models={models}
                                            isProcessing={isProcessing}
                                            attachments={attachments}
                                            // messages={messages} // Prop removed
                                            onModelSelect={handleModelSelect}
                                            currentPlan={currentPlan}
                                            onPlanChange={onPlanChange}
                                            isMobile={isMobile}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2" >
                                    <Button
                                        type="button"
                                        className={cn(
                                            "rounded-full p-1.5 h-8 w-8 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600",
                                            isSystemPromptVisible && "bg-neutral-200 dark:bg-neutral-600"
                                        )}
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                            e.preventDefault();
                                            setIsSystemPromptVisible(!isSystemPromptVisible);
                                            if (!isSystemPromptVisible && systemPromptInputRef?.current) {
                                                setTimeout(() => systemPromptInputRef.current?.focus(), 300);
                                            }
                                        }}
                                        variant="outline"
                                        disabled={isProcessing}
                                        aria-label="Toggle System Prompt"
                                        title="System Prompt"
                                    >
                                        <SystemPromptIcon size={14} />
                                    </Button>
                                    {/* Hide attach button in image mode */}
                                    {!isImageMode && AttachButtonElement}
                                    {isProcessing ? (
                                        <Button
                                            type="button"
                                            className="rounded-full p-1.5 h-8 w-8 bg-red-50 dark:bg-red-800 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-700 border border-red-200 dark:border-red-700"
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                e.preventDefault();
                                                if (handleStopStreaming) handleStopStreaming();
                                            }}
                                            variant="outline"
                                            aria-label="Stop generating"
                                            title="Stop generating"
                                        >
                                            <StopCircle size={14} />
                                        </Button>
                                    ) : SendButtonElement}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FormComponent;