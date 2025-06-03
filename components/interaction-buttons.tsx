
// components/interaction-buttons.tsx
import React, { useState, useEffect } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, Volume2, Download, VolumeX, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface InteractionButtonsProps {
  messageId: string;
  content: string;
  onRetry?: (assistantMessageId: string) => void; // New prop
  isError?: boolean; // To show retry for errors
}

export const InteractionButtons: React.FC<InteractionButtonsProps> = ({ messageId, content, onRetry, isError }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      // If it's an image, copy the URL, otherwise copy the text content
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

  // Handle like button click
  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    if (newLikedState && isDisliked) {
      setIsDisliked(false);
      localStorage.removeItem(`message-disliked-${messageId}`);
    }
    
    if (newLikedState) {
      localStorage.setItem(`message-liked-${messageId}`, 'true');
    } else {
      localStorage.removeItem(`message-liked-${messageId}`);
    }
  };

  // Handle dislike button click
  const handleDislike = () => {
    const newDislikedState = !isDisliked;
    setIsDisliked(newDislikedState);
    
    if (newDislikedState && isLiked) {
      setIsLiked(false);
      localStorage.removeItem(`message-liked-${messageId}`);
    }
    
    if (newDislikedState) {
      localStorage.setItem(`message-disliked-${messageId}`, 'true');
    } else {
      localStorage.removeItem(`message-disliked-${messageId}`);
    }
  };

  // Handle speaker button click
  const handleSpeaker = () => {
    if (imageUrl) {
      toast.info("Text-to-speech is not available for images.");
      return;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        // If the current message is the one being spoken, stop it.
        // Otherwise, stop the current speech and start the new one.
        if (isSpeaking) return; 
      }

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 1.5; // Set speech rate
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

  // Handle download button click
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
      // Remove query parameters from filename if any
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

  return (
    <div className="flex gap-2 justify-end mt-2 mb-1">
      {onRetry && (isError || content) && ( // Show retry if onRetry is provided and it's an error message or a completed content message
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
          className={`h-8 w-8 p-0 rounded-full transition-colors ${
            isLiked 
              ? 'bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900 dark:hover:text-green-300' 
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          aria-label="Like"
        >
          <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
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
          className={`h-8 w-8 p-0 rounded-full transition-colors ${
            isDisliked 
              ? 'bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300' 
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          aria-label="Dislike"
        >
          <ThumbsDown className={`h-4 w-4 ${isDisliked ? 'fill-current' : ''}`} />
        </Button>
      </motion.div>

      {!imageUrl && ( // Only show speaker button if it's not an image
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

      {imageUrl && ( // Only show download button if it's an image
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
