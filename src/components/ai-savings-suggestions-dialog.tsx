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
      <Button variant="outline" className="neu-btn gap-2">
        <Sparkles className="size-4 text-primary" />
        <span>AI Suggestions</span>
      </Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent className="sm:max-w-md neu-card">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl neu-pressed-sm flex items-center justify-center text-primary shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-headline">AI Savings Insights</DialogTitle>
              <DialogDescription>
                Smart tips & habit suggestions to accelerate your milestones.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-3 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {loading && (
            <div className="space-y-3">
              <div className="h-16 neu-pressed-sm rounded-2xl animate-pulse" />
              <div className="h-16 neu-pressed-sm rounded-2xl animate-pulse" />
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
            <div className="space-y-2.5">
              {suggestions.suggestions.map((item, index) => (
                <div key={index} className="p-3.5 rounded-xl neu-pressed-sm text-sm text-foreground flex items-start gap-3">
                  <div className="size-6 rounded-lg neu-card-sm flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="leading-relaxed text-xs sm:text-sm text-foreground/90">{item}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
