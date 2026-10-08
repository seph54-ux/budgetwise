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
    try {
      const { output } = await prompt(input);
      if (output && output.suggestions && output.suggestions.length > 0) {
        return output;
      }
    } catch (err) {
      console.warn('Savings AI flow encountered error, generating personalized financial savings tips:', err);
    }

    const fallbackTips = [];
    const goals = input.savingsGoals || [];

    if (goals.length > 0) {
      // Find lowest progress goal
      const progressGoals = goals.map(g => ({
        ...g,
        percent: g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0,
      })).sort((a, b) => a.percent - b.percent);

      const lowest = progressGoals[0];
      const highest = progressGoals[progressGoals.length - 1];

      fallbackTips.push(
        `For "${lowest.name}" (${lowest.percent}% funded), try the 52-week ipon challenge or save your loose change daily. Little habits compound quickly into massive milestones!`
      );

      if (highest.percent >= 50) {
        fallbackTips.push(
          `You're already ${highest.percent}% toward "${highest.name}"! Keeping these funds in high-interest digital savings accounts like Maya (3.5%-14% p.a.) or GoTyme (4% p.a.) helps defeat inflation.`
        );
      } else {
        fallbackTips.push(
          `Automate your savings: Set an auto-debit rule on your payroll day so you save first before you spend (Pay Yourself First rule).`
        );
      }

      fallbackTips.push(
        `Consider creating a "Sinking Fund" by dividing your target date with the remaining amount, giving you an exact daily or weekly manageable target.`
      );
    } else {
      fallbackTips.push(
        `Kahit maliit, ang pinakamahalaga ay makapagsimula! Start with a beginner Emergency Fund of ₱10,000 to cover unexpected medical or home emergencies.`
      );
      fallbackTips.push(
        `Use the 72-hour rule for non-essential purchases: if you still want it after 3 days, then assess if you have spare funds.`
      );
      fallbackTips.push(
        `Open a separate savings wallet or stash distinct from your daily spending cash to prevent accidental impulse buying.`
      );
    }

    return {
      suggestions: fallbackTips,
    };
  }
);
