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
}

export function AiSuggestionsDialog({
  income,
  expenses,
  budgets,
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          AI Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Budget Suggestions</DialogTitle>
          <DialogDescription>
            Here are some AI-powered suggestions to help you optimize your
            budget.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <Bot className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Could not load suggestions. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          {suggestions && suggestions.suggestions.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              {suggestions.suggestions.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>{item.category}</AccordionTrigger>
                  <AccordionContent>
                    <p>{item.suggestion}</p>
                    {item.potentialSavings && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Potential Savings: <strong>{formatCurrency(item.potentialSavings)}</strong>
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
           {suggestions && suggestions.suggestions.length === 0 && (
             <Alert>
              <Bot className="h-4 w-4" />
              <AlertTitle>All Good!</AlertTitle>
              <AlertDescription>
                The AI couldn't find any specific suggestions right now. Your budget looks well-managed!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
