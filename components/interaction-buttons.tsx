
// components/interaction-buttons.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, Volume2, Download, VolumeX, RotateCcw, Zap, Gauge } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SimpleMessage, cn } from '@/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SpeedInsightsPopoverContent } from '@/components/speed-insights-popover'; // New import
import { useMediaQuery } from '@/hooks/use-media-query';

interface InteractionButtonsProps {
  message: SimpleMessage; // Changed from messageId and content to full message object
  onRetry?: (assistantMessageId: string) => void;
}

export const InteractionButtons: React.FC<InteractionButtonsProps> = ({ message, onRetry }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { id: messageId, content, isError, promptTokens } = message;

  const imageUrlRegex = /!\[.*?\]\((.*?)\)/;
  const imageMatch = content.match(imageUrlRegex);
  const imageUrl = imageMatch ? imageMatch[1] : null;

  // Load like/dislike state from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLikeState = localStorage.getItem(`message-liked-${messageId}`);
      const savedDislikeState = localStorage.getItem(`message-disliked-${messageId}`);
      
      if (savedLikeState === 'true') setIsLiked(true);
      if (savedDislikeState === 'true') setIsDisliked(true);
    }
  }, [messageId]);

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle copy functionality
  const handleCopy = async () => {
    if (!navigator.clipboard) {
      toast.error("Clipboard API not available in this browser.");
      return;
    }
    
    try {
      const textToCopy = imageUrl || content;
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast.success(imageUrl ? "Image URL copied to clipboard" : "Copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error(imageUrl ? "Failed to copy image URL." : "Failed to copy text.");
    }
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    if (newLikedState && isDisliked) {
      setIsDisliked(false);
      localStorage.removeItem(`message-disliked-${messageId}`);
    }
    localStorage.setItem(`message-liked-${messageId}`, newLikedState ? 'true' : 'false');
  };

  const handleDislike = () => {
    const newDislikedState = !isDisliked;
    setIsDisliked(newDislikedState);
    if (newDislikedState && isLiked) {
      setIsLiked(false);
      localStorage.removeItem(`message-liked-${messageId}`);
    }
    localStorage.setItem(`message-disliked-${messageId}`, newDislikedState ? 'true' : 'false');
  };

  const handleSpeaker = () => {
    if (imageUrl) {
      toast.info("Text-to-speech is not available for images.");
      return;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        if (isSpeaking) return; 
      }

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 1.5; 
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        toast.error("Text-to-speech error. Your browser might not support it or it's disabled.");
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech is not supported by your browser.");
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = localUrl;
      
      let filename = decodeURIComponent(imageUrl.substring(imageUrl.lastIndexOf('/') + 1));
      filename = filename.split('?')[0];

      if (!filename || !filename.includes('.')) {
        const extension = blob.type.split('/')[1] || 'png';
        filename = `image-${messageId}.${extension}`;
      }
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(localUrl);
      toast.success("Image download started");
    } catch (err: any) {
      console.error('Failed to download image:', err);
      toast.error(`Failed to download image: ${err.message}`);
    }
  };

  const insightsButton = (
    <motion.div
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
        aria-label="Speed Insights"
        title="Speed Insights"
      >
        <Zap className="h-4 w-4 text-orange-500" />
      </Button>
    </motion.div>
  );

  return (
    <div className="flex gap-1 sm:gap-2 justify-end mt-2 mb-1">
      {/* Speed Insights Button */}
      {typeof promptTokens !== 'undefined' && (
        isDesktop ? (
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>{insightsButton}</HoverCardTrigger>
            <HoverCardContent side="top" align="end" className="w-auto p-0 border-none shadow-none bg-transparent">
              <SpeedInsightsPopoverContent message={message} />
            </HoverCardContent>
          </HoverCard>
        ) : (
          <Popover>
            <PopoverTrigger asChild>{insightsButton}</PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-auto p-0 border-none shadow-none bg-transparent">
               <SpeedInsightsPopoverContent message={message} />
            </PopoverContent>
          </Popover>
        )
      )}

      {onRetry && (isError || content) && (
        <motion.div
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onRetry(messageId)}
                className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Retry"
                title="Retry"
            >
                <RotateCcw className="h-4 w-4" />
            </Button>
        </motion.div>
      )}
      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn("h-8 w-8 p-0 rounded-full transition-colors", 
            isLiked 
              ? 'bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900 dark:hover:text-green-300' 
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
          aria-label="Like"
        >
          <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />
        </Button>
      </motion.div>

      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDislike}
          className={cn("h-8 w-8 p-0 rounded-full transition-colors",
            isDisliked 
              ? 'bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300' 
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
          aria-label="Dislike"
        >
          <ThumbsDown className={cn("h-4 w-4", isDisliked && "fill-current")} />
        </Button>
      </motion.div>

      {!imageUrl && (
        <motion.div
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSpeaker}
            className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label={isSpeaking ? "Stop speech" : "Text to speech"}
          >
            {isSpeaking ? <VolumeX className="h-4 w-4 text-red-500" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </motion.div>
      )}

      {imageUrl && ( 
        <motion.div
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Download image"
          >
            <Download className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Copy to clipboard"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </motion.div>
    </div>
  );
};
