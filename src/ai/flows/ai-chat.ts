'use server';

/**
 * @fileOverview This file defines the AI chat flow for the Rift AI Assistant Chrome extension.
 *
 * - aiChat - A function that allows users to chat with an AI assistant.
 * - AiChatInput - The input type for the aiChat function.
 * - AiChatOutput - The return type for the aiChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiChatInputSchema = z.object({
  message: z.string().describe('The user message to send to the AI assistant.'),
});

export type AiChatInput = z.infer<typeof AiChatInputSchema>;

const AiChatOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user message.'),
});

export type AiChatOutput = z.infer<typeof AiChatOutputSchema>;

export async function aiChat(input: AiChatInput): Promise<AiChatOutput> {
  return aiChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatPrompt',
  input: {schema: AiChatInputSchema},
  output: {schema: AiChatOutputSchema},
  prompt: `You are a helpful AI assistant. Respond to the following user message:

User Message: {{{message}}}

Response: `,
});

const aiChatFlow = ai.defineFlow(
  {
    name: 'aiChatFlow',
    inputSchema: AiChatInputSchema,
    outputSchema: AiChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
