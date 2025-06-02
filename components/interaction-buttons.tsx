// components/interaction-buttons.tsx
import React, { useState, useEffect } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface InteractionButtonsProps {
  messageId: string;
  content: string;
}

export const InteractionButtons: React.FC<InteractionButtonsProps> = ({ messageId, content }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  // Load like/dislike state from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLikeState = localStorage.getItem(`message-liked-${messageId}`);
      const savedDislikeState = localStorage.getItem(`message-disliked-${messageId}`);
      
      if (savedLikeState === 'true') setIsLiked(true);
      if (savedDislikeState === 'true') setIsDisliked(true);
    }
  }, [messageId]);

  // Handle copy functionality
  const handleCopy = async () => {
    if (!navigator.clipboard) {
      toast.error("Clipboard API not available in this browser.");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error("Failed to copy text.");
    }
  };

  // Handle like button click
  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // If liking, remove dislike
    if (newLikedState && isDisliked) {
      setIsDisliked(false);
      localStorage.removeItem(`message-disliked-${messageId}`);
    }
    
    // Save to localStorage
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
    
    // If disliking, remove like
    if (newDislikedState && isLiked) {
      setIsLiked(false);
      localStorage.removeItem(`message-liked-${messageId}`);
    }
    
    // Save to localStorage
    if (newDislikedState) {
      localStorage.setItem(`message-disliked-${messageId}`, 'true');
    } else {
      localStorage.removeItem(`message-disliked-${messageId}`);
    }
  };

  // Handle speaker button click
  const handleSpeaker = () => {
    toast.info("Text-to-speech feature will be available soon!");
  };

  return (
    <div className="flex gap-2 justify-end mt-2 mb-1">
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

      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSpeaker}
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Text to speech"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </motion.div>

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
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </motion.div>
    </div>
  );
};
