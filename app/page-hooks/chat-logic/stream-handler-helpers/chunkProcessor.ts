// app/page-hooks/chat-logic/stream-handler-helpers/chunkProcessor.ts
import OpenAI from 'openai';
import { SimpleMessage } from '@/lib/utils';
import React from 'react';

type SetMessagesType = React.Dispatch<React.SetStateAction<SimpleMessage[]>>;

export interface ProcessStreamChunksParams {
  stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
  setMessages: SetMessagesType;
  currentAssistantMessageIdRef: React.MutableRefObject<string | null>;
  isStreamCancelledByUserRef: React.MutableRefObject<boolean>;
}

export interface ProcessStreamChunksResult {
  finalContent: string;
  finalThinkingContent: string;
  wasCancelled: boolean;
  isEmptyStream: boolean;
  thinkTagProcessed: boolean;
}

/**
 * Processes the stream of chat completion chunks, updating messages with content and thinking state.
 */
export async function processStreamChunks({
  stream,
  setMessages,
  currentAssistantMessageIdRef,
  isStreamCancelledByUserRef,
}: ProcessStreamChunksParams): Promise<ProcessStreamChunksResult> {
  let accumulatedMainContent = "";
  let accumulatedThinkContent = "";
  let inThinkBlock = false;
  let thinkTagProcessedThisStream = false;
  let contentReceived = false;

  for await (const chunk of stream) {
    if (isStreamCancelledByUserRef.current) {
      break;
    }

    const currentChunkDelta = chunk.choices[0]?.delta?.content || "";
    if (currentChunkDelta) {
      contentReceived = true;
      let tempBufferForChunkProcessing = currentChunkDelta;

      while (tempBufferForChunkProcessing.length > 0) {
        if (!inThinkBlock) {
          const thinkTagIndex = tempBufferForChunkProcessing.indexOf('<think>');
          if (thinkTagIndex !== -1) {
            const beforeThinkTag = tempBufferForChunkProcessing.substring(0, thinkTagIndex);
            if (beforeThinkTag) {
              accumulatedMainContent += beforeThinkTag;
            }
            inThinkBlock = true;
            thinkTagProcessedThisStream = true;
            tempBufferForChunkProcessing = tempBufferForChunkProcessing.substring(thinkTagIndex + '<think>'.length);
          } else {
            accumulatedMainContent += tempBufferForChunkProcessing;
            tempBufferForChunkProcessing = '';
          }
        } else {
          const endThinkTagIndex = tempBufferForChunkProcessing.indexOf('</think>');
          if (endThinkTagIndex !== -1) {
            const beforeEndThinkTag = tempBufferForChunkProcessing.substring(0, endThinkTagIndex);
            if (beforeEndThinkTag) {
              accumulatedThinkContent += beforeEndThinkTag;
            }
            inThinkBlock = false;
            tempBufferForChunkProcessing = tempBufferForChunkProcessing.substring(endThinkTagIndex + '</think>'.length);
          } else {
            accumulatedThinkContent += tempBufferForChunkProcessing;
            tempBufferForChunkProcessing = '';
          }
        }
      }

      setMessages(prevMessages => {
        const messageIdToUpdate = currentAssistantMessageIdRef.current;
        return prevMessages.map((msg: SimpleMessage) => {
          if (msg.id === messageIdToUpdate) {
            return {
              ...msg,
              content: accumulatedMainContent,
              thinkingContent: accumulatedThinkContent || undefined,
              isThinkingInProgress: inThinkBlock,
              thinkingCompleted: thinkTagProcessedThisStream && !inThinkBlock && accumulatedThinkContent.length > 0,
              isStreaming: true,
            };
          }
          return msg;
        });
      });
    }
  }

  return {
    finalContent: accumulatedMainContent,
    finalThinkingContent: accumulatedThinkContent,
    wasCancelled: isStreamCancelledByUserRef.current,
    isEmptyStream: !contentReceived && !isStreamCancelledByUserRef.current,
    thinkTagProcessed: thinkTagProcessedThisStream,
  };
}