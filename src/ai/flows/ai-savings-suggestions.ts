'use server';

/**
 * @fileOverview AI-powered savings optimization suggestions flow.
 *
 * This file exports:
 * - `getSavingsSuggestions` - A function to get AI-driven savings suggestions.
 * - `SavingsSuggestionsInput` - The input type for the getSavingsSuggestions function.
 * - `SavingsSuggestionsOutput` - The output type for the getSavingsSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SavingsGoalSchema = z.object({
    name: z.string(),
    targetAmount: z.number(),
    currentAmount: z.number(),
});

const SavingsSuggestionsInputSchema = z.object({
  savingsGoals: z.array(SavingsGoalSchema).describe("The user's current savings goals."),
});
export type SavingsSuggestionsInput = z.infer<typeof SavingsSuggestionsInputSchema>;

const SavingsSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('An AI-powered savings technique or encouragement.')
  ).describe('An array of AI-powered savings suggestions.'),
});
export type SavingsSuggestionsOutput = z.infer<typeof SavingsSuggestionsOutputSchema>;

export async function getSavingsSuggestions(input: SavingsSuggestionsInput): Promise<SavingsSuggestionsOutput> {
  return savingsSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'savingsSuggestionsPrompt',
  input: { schema: SavingsSuggestionsInputSchema },
  output: { schema: SavingsSuggestionsOutputSchema },
  prompt: `You are a friendly and encouraging financial advisor for users in the Philippines. All currency values are in Philippine Pesos (PHP). Your goal is to provide personalized savings techniques and motivation. Use a casual, modern "Tag-Lish" (Tagalog-English) style.

  Analyze the user's savings goals.

  {{#if savingsGoals}}
  Here are their current goals:
  {{#each savingsGoals}}
  - Goal: "{{this.name}}", Progress: {{this.currentAmount}} / {{this.targetAmount}}
  {{/each}}

  Based on these goals, provide 2-3 specific, actionable, and creative savings tips that are relevant to a Filipino lifestyle. For example, mention things like "ipon challenges", digital banks like Maya or GoTyme, or "sinking funds" for specific goals. Be encouraging and positive.
  {{else}}
  The user has no savings goals yet. Provide 2-3 encouraging and gentle sentences to motivate them to start saving. For example, "Kahit maliit, ang mahalaga ay makapagsimula ka!" or "Setting a small goal is a great first step." Explain why saving is important in a simple, relatable way.
  {{/if}}

  Format your response as a JSON object matching the following schema:
  ${JSON.stringify(SavingsSuggestionsOutputSchema.describe(''))}
  `,
});

const savingsSuggestionsFlow = ai.defineFlow(
  {
    name: 'savingsSuggestionsFlow',
    inputSchema: SavingsSuggestionsInputSchema,
    outputSchema: SavingsSuggestionsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
