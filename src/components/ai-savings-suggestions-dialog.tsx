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
import { Button } from './ui/button';
import { Sparkles, Bot } from 'lucide-react';
import {
  getSavingsSuggestions,
  type SavingsSuggestionsInput,
  type SavingsSuggestionsOutput,
} from '@/ai/flows/ai-savings-suggestions';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { SavingsGoal } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AiSavingsSuggestionsDialogProps {
  savingsGoals: SavingsGoal[];
  children?: React.ReactNode;
}

export function AiSavingsSuggestionsDialog({
  savingsGoals,
  children,
}: AiSavingsSuggestionsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<SavingsSuggestionsOutput | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSuggestions(null);

    const input: SavingsSuggestionsInput = {
      savingsGoals: savingsGoals.map(g => ({
        name: g.name,
        currentAmount: g.currentAmount,
        targetAmount: g.targetAmount,
      })),
    };

    try {
      const result = await getSavingsSuggestions(input);
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

  const trigger = children ? (
    <DialogTrigger asChild>{children}</DialogTrigger>
  ) : (
    <DialogTrigger asChild>
      <Button variant="outline">
        <Sparkles className="mr-2 h-4 w-4" />
        AI Suggestions
      </Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Savings Suggestions</DialogTitle>
          <DialogDescription>
            Here are some AI-powered tips to help you reach your savings goals.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
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
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              {suggestions.suggestions.map((item, index) => (
                <li key={index} className="pl-2">{item}</li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
