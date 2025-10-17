'use server';

/**
 * @fileOverview AI-powered budget optimization suggestions flow.
 *
 * This file exports:
 * - `getBudgetSuggestions` - A function to get AI-driven budget optimization suggestions.
 * - `BudgetSuggestionsInput` - The input type for the getBudgetSuggestions function.
 * - `BudgetSuggestionsOutput` - The output type for the getBudgetSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BudgetSuggestionsInputSchema = z.object({
  income: z.number().describe('The user monthly income.'),
  expenses: z.record(z.string(), z.number()).describe('A map of expense categories and their amounts.'),
  budgetGoals: z.record(z.string(), z.number()).describe('A map of budget categories and their goals.'),
});
export type BudgetSuggestionsInput = z.infer<typeof BudgetSuggestionsInputSchema>;

const BudgetSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      category: z.string().describe('The expense category the suggestion applies to.'),
      suggestion: z.string().describe('The AI-powered budget optimization suggestion.'),
      potentialSavings: z.number().optional().describe('The estimated potential savings from the suggestion.'),
    })
  ).describe('An array of AI-powered budget optimization suggestions.'),
});
export type BudgetSuggestionsOutput = z.infer<typeof BudgetSuggestionsOutputSchema>;

export async function getBudgetSuggestions(input: BudgetSuggestionsInput): Promise<BudgetSuggestionsOutput> {
  return budgetSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'budgetSuggestionsPrompt',
  input: {schema: BudgetSuggestionsInputSchema},
  output: {schema: BudgetSuggestionsOutputSchema},
  prompt: `You are an AI budget assistant that analyzes a user's income, expenses, and budget goals to provide personalized suggestions for optimizing their budget.

  Income: {{{income}}}

  Expenses:
  {{#each expenses}}
  - {{@key}}: {{{this}}}
  {{/each}}

  Budget Goals:
  {{#each budgetGoals}}
  - {{@key}}: {{{this}}}
  {{/each}}

  Provide specific and actionable suggestions, focusing on areas where the user can save money and achieve their financial goals more effectively. Include an estimated potential savings if applicable.

  Format your response as a JSON object matching the following schema:
  ${JSON.stringify(BudgetSuggestionsOutputSchema.describe(''))}
  `,
});

const budgetSuggestionsFlow = ai.defineFlow(
  {
    name: 'budgetSuggestionsFlow',
    inputSchema: BudgetSuggestionsInputSchema,
    outputSchema: BudgetSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
