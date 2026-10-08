'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from './ui/button';
import { Sparkles, Bot } from 'lucide-react';
import {
  getBudgetSuggestions,
  type BudgetSuggestionsInput,
  type BudgetSuggestionsOutput,
} from '@/ai/flows/ai-budget-suggestions';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Budget, Transaction } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AiSuggestionsDialogProps {
  income: number;
  expenses: Transaction[];
  budgets: Budget[];
  children?: React.ReactNode;
}

export function AiSuggestionsDialog({
  income,
  expenses,
  budgets,
  children
}: AiSuggestionsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<BudgetSuggestionsOutput | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSuggestions(null);

    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const budgetGoals = budgets.reduce((acc, budget) => {
        acc[budget.category] = budget.amount;
        return acc;
    }, {} as Record<string, number>)

    const input: BudgetSuggestionsInput = {
      income,
      expenses: expensesByCategory,
      budgetGoals: budgetGoals,
    };

    try {
      const result = await getBudgetSuggestions(input);
      setSuggestions(result);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to get AI suggestions: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      handleFetchSuggestions();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };
  
  const trigger = children ? (
    <DialogTrigger asChild>{children}</DialogTrigger>
  ) : (
    <DialogTrigger asChild>
      <Button variant="outline" className="neu-btn gap-2">
        <Sparkles className="size-4 text-primary" />
        <span>AI Suggestions</span>
      </Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent className="sm:max-w-lg neu-card">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl neu-pressed-sm flex items-center justify-center text-primary shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-headline">AI Budget Insights</DialogTitle>
              <DialogDescription>
                Smart, personalized tips to optimize cashflow and reduce overhead.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-3 max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {loading && (
            <div className="space-y-3">
              <div className="h-20 neu-pressed-sm rounded-2xl animate-pulse" />
              <div className="h-20 neu-pressed-sm rounded-2xl animate-pulse" />
            </div>
          )}
          {error && (
            <div className="p-4 rounded-2xl neu-pressed-sm text-destructive text-sm flex items-start gap-3">
              <Bot className="size-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Notice</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI suggestions are temporarily unavailable. Ensure your GEMINI_API_KEY is configured.
                </p>
              </div>
            </div>
          )}
          {suggestions && suggestions.suggestions.length > 0 && (
            <div className="space-y-3">
              {suggestions.suggestions.map((item, index) => (
                <div key={index} className="p-4 rounded-2xl neu-pressed-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{item.category}</span>
                    {item.potentialSavings && (
                      <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 neu-card-sm px-2.5 py-1 rounded-lg">
                        Save ~{formatCurrency(item.potentialSavings)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.suggestion}</p>
                </div>
              ))}
            </div>
          )}
          {suggestions && suggestions.suggestions.length === 0 && !loading && !error && (
            <div className="p-6 rounded-2xl neu-pressed-sm text-center space-y-1.5">
              <Bot className="size-8 text-primary mx-auto" />
              <p className="font-bold text-sm text-foreground">Budget in Prime Shape!</p>
              <p className="text-xs text-muted-foreground">
                Your spending across all active categories is currently well within healthy ranges.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
