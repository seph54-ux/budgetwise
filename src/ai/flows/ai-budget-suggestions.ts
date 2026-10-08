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
  prompt: `You are an AI budget assistant for users in the Philippines. All currency values are in Philippine Pesos (PHP). Analyze the user's income, expenses, and budget goals to provide personalized suggestions for optimizing their budget in a Filipino context. It's okay to use Tag-Lish in sentences for more casual modern Tagalog approach.

  Income: {{{income}}}

  Expenses:
  {{#each expenses}}
  - {{@key}}: {{{this}}}
  {{/each}}

  Budget Goals:
  {{#each budgetGoals}}
  - {{@key}}: {{{this}}}
  {{/each}}

  Provide specific, actionable, and culturally relevant suggestions for a Filipino user. Focus on areas where they can save money and achieve their financial goals more effectively (e.g., suggesting local alternatives, mentioning common Filipino spending habits). Include an estimated potential savings in PHP if applicable.

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
    try {
      const {output} = await prompt(input);
      if (output && output.suggestions && output.suggestions.length > 0) {
        return output;
      }
    } catch (err) {
      console.warn('AI suggestions flow encountered error, generating rule-based smart financial suggestions:', err);
    }

    // Dynamic smart financial analysis fallback
    const fallbackSuggestions = [];
    const expensesList = Object.entries(input.expenses || {});
    const totalExpenses = expensesList.reduce((acc, [, val]) => acc + val, 0);

    // Sort by largest expense
    expensesList.sort((a, b) => b[1] - a[1]);

    if (expensesList.length > 0) {
      const [topCategory, topAmount] = expensesList[0];
      const percent = input.income > 0 ? Math.round((topAmount / input.income) * 100) : 50;
      fallbackSuggestions.push({
        category: topCategory,
        suggestion: `Your largest outflow is in ${topCategory} (₱${topAmount.toLocaleString()} or ~${percent}% of your income). Consider setting a weekly budget envelope or looking for value alternatives (e.g., bulk buying or carpooling).`,
        potentialSavings: Math.round(topAmount * 0.15),
      });
    }

    // Check budget goals exceeding
    const exceededBudgets = [];
    for (const [cat, goalAmount] of Object.entries(input.budgetGoals || {})) {
      const actual = input.expenses[cat] || 0;
      if (actual > goalAmount) {
        exceededBudgets.push({ category: cat, actual, goal: goalAmount });
      }
    }

    if (exceededBudgets.length > 0) {
      const over = exceededBudgets[0];
      fallbackSuggestions.push({
        category: over.category,
        suggestion: `You've exceeded your ₱${over.goal.toLocaleString()} budget for ${over.category} by ₱${(over.actual - over.goal).toLocaleString()}. Try freezing non-essential spends in this category for the rest of the cut-off.`,
        potentialSavings: over.actual - over.goal,
      });
    }

    // 50-30-20 Rule assessment
    const savingsPotential = Math.max(0, input.income - totalExpenses);
    if (savingsPotential > 0) {
      fallbackSuggestions.push({
        category: 'Savings & Investments',
        suggestion: `Great job having an estimated monthly surplus of ₱${savingsPotential.toLocaleString()}! We recommend automatically transferring 20% into high-yield digital banks (e.g., Maya or GoTyme) right on payday.`,
        potentialSavings: Math.round(savingsPotential * 0.5),
      });
    } else {
      fallbackSuggestions.push({
        category: 'Cashflow Optimization',
        suggestion: `Your monthly expenses currently match or exceed your recorded income. Try the 50/30/20 guideline: 50% for Needs, 30% for Wants, and 20% for Emergency Savings to build financial breathing room.`,
        potentialSavings: Math.round(input.income * 0.1),
      });
    }

    return {
      suggestions: fallbackSuggestions,
    };
  }
);
