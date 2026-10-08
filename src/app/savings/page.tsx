'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Landmark, Wallet, Box, MoreHorizontal, History, Trash2, PiggyBank } from 'lucide-react';
import type { SavingsGoal } from '@/lib/types';
import { AddSavingsGoalDialog } from '@/components/add-savings-goal';
import { AddSavingsContributionDialog } from '@/components/add-savings-contribution';
import { SavingsHistorySheet } from '@/components/savings-history-sheet';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { AiSavingsSuggestionsDialog } from '@/components/ai-savings-suggestions-dialog';
import { useBudgetWiseData } from '@/lib/supabase/use-budget-data';

const sourceIcons: Record<string, React.ElementType> = {
  bank: Landmark,
  'digital-wallet': Wallet,
  cash: Box,
  other: Box,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function SavingsPage() {
  const { toast } = useToast();
  const [selectedGoalForHistory, setSelectedGoalForHistory] = React.useState<SavingsGoal | null>(null);
  const { state: sidebarState } = useSidebar();

  const {
    savingsGoals,
    savingsTransactions,
    isLoading,
    addSavingsGoal,
    addContribution,
    deleteSavingsGoal,
  } = useBudgetWiseData();

  const handleAddGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'userId'>) => {
    addSavingsGoal(goal);
  };

  const handleAddContribution = (contribution: { goalId: string; amount: number }) => {
    addContribution(contribution.goalId, contribution.amount);
  };

  const handleGoalHistory = (goal: SavingsGoal) => {
    setSelectedGoalForHistory(goal);
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteSavingsGoal(goalId);
  };

  const totalSaved = React.useMemo(() => {
    return (savingsGoals ?? []).reduce((acc, g) => acc + g.currentAmount, 0);
  }, [savingsGoals]);

  const totalTarget = React.useMemo(() => {
    return (savingsGoals ?? []).reduce((acc, g) => acc + g.targetAmount, 0);
  }, [savingsGoals]);

  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="h-9 w-44 neu-pressed-sm rounded-xl animate-pulse" />
          <div className="flex items-center space-x-2">
            <div className="h-9 w-32 neu-pressed-sm rounded-xl animate-pulse" />
            <div className="h-9 w-32 neu-pressed-sm rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 neu-card rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger showWhen="closed" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-headline text-foreground">
              Savings Goals
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Build emergency funds and save for milestones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <AiSavingsSuggestionsDialog savingsGoals={savingsGoals ?? []} />
          <AddSavingsGoalDialog onAddGoal={handleAddGoal}>
            <Button className="neu-primary-btn gap-2">
              <PlusCircle className="size-4" />
              <span>Add Goal</span>
            </Button>
          </AddSavingsGoalDialog>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      {savingsGoals && savingsGoals.length > 0 && (
        <div className="neu-card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl neu-pressed-sm flex items-center justify-center text-primary shrink-0">
                <PiggyBank className="size-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Combined Progress</span>
                <p className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-foreground">
                  {formatCurrency(totalSaved)}
                  <span className="text-sm font-normal text-muted-foreground ml-1.5">
                    of {formatCurrency(totalTarget)}
                  </span>
                </p>
              </div>
            </div>
            <div className="neu-pressed-sm px-3 py-1.5 rounded-xl text-center self-start sm:self-auto">
              <span className="text-xs font-bold text-primary">{overallProgress}% Achieved</span>
            </div>
          </div>
          <Progress value={overallProgress} />
        </div>
      )}

      {/* Goals Grid */}
      {savingsGoals && savingsGoals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savingsGoals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const SourceIcon = sourceIcons[goal.source] || Box;
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="neu-card p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl neu-pressed-sm flex items-center justify-center text-primary shrink-0">
                        <SourceIcon className="size-4.5" />
                      </div>
                      <span className="font-bold text-base text-foreground truncate">{goal.name}</span>
                    </div>

                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-lg neu-pressed-sm",
                      isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
                    )}>
                      {progress}%
                    </span>
                  </div>

                  <div className="my-3">
                    <div className="text-2xl font-extrabold font-mono tabular-nums text-foreground">
                      {formatCurrency(goal.currentAmount)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Target: {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>

                  <Progress
                    value={progress}
                    className="mb-4"
                    indicatorClassName={cn(isCompleted && "bg-gradient-to-r from-emerald-500 to-emerald-600")}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <AddSavingsContributionDialog goal={goal} onAddContribution={handleAddContribution}>
                    <Button size="sm" className="neu-primary-btn text-xs px-3">
                      Add Funds
                    </Button>
                  </AddSavingsContributionDialog>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleGoalHistory(goal)}
                      className="size-8 rounded-lg neu-btn"
                      title="View Contribution History"
                    >
                      <History className="size-3.5 text-muted-foreground" />
                    </Button>

                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg neu-btn">
                            <MoreHorizontal className="size-3.5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="neu-card p-1">
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer rounded-lg text-xs">
                              <Trash2 className="size-3.5" />
                              <span>Delete Goal</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <AlertDialogContent className="neu-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this savings goal?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{goal.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="neu-btn">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="neu-danger-btn"
                          >
                            Delete Goal
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="neu-card p-10 text-center space-y-3">
          <div className="size-14 rounded-2xl neu-pressed-sm flex items-center justify-center text-primary mx-auto">
            <PiggyBank className="size-7" />
          </div>
          <h2 className="text-lg font-bold font-headline text-foreground">No Savings Goals Yet</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Start saving for an emergency cushion, vacation, or big purchase. Set your target amount and track your contributions over time.
          </p>
          <div className="pt-2">
            <AddSavingsGoalDialog onAddGoal={handleAddGoal}>
              <Button className="neu-primary-btn gap-2">
                <PlusCircle className="size-4" />
                <span>Create Your First Goal</span>
              </Button>
            </AddSavingsGoalDialog>
          </div>
        </div>
      )}

      {/* History Sheet */}
      {selectedGoalForHistory && (
        <SavingsHistorySheet
          goal={selectedGoalForHistory}
          transactions={savingsTransactions ? savingsTransactions[selectedGoalForHistory.id] ?? [] : []}
          open={!!selectedGoalForHistory}
          onOpenChange={(isOpen) => !isOpen && setSelectedGoalForHistory(null)}
        />
      )}
    </div>
  );
}
