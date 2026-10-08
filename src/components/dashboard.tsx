'use client';

import * as React from 'react';
import type { Transaction, Budget } from '@/lib/types';
import { SummaryCards } from './summary-cards';
import { BudgetGoals } from './budget-goals';
import { SpendingChart } from './spending-chart';
import { RecentTransactions } from './recent-transactions';
import { Button } from './ui/button';
import { PlusCircle, RotateCcw, MoreHorizontal, Settings, Wallet, Sparkles } from 'lucide-react';
import { AddTransactionSheet } from './add-transaction-sheet';
import { AiSuggestionsDialog } from './ai-suggestions-dialog';
import { SetIncomeDialog } from './set-income-dialog';
import { ManageBudgetDialog } from './manage-budget-dialog';
import { ResetConfirmationDialog } from './reset-confirmation-dialog';
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useBudgetWiseData } from '@/lib/supabase/use-budget-data';

export function Dashboard() {
  const { state: sidebarState } = useSidebar();
  const {
    transactions,
    budgets,
    isLoading,
    addTransaction,
    deleteTransaction: handleDeleteTransaction,
    setBudgets,
    setIncome: handleSetIncome,
    resetBudget: handleResetBudget,
  } = useBudgetWiseData();

  const totalIncome = React.useMemo(() => {
    return (transactions ?? [])
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalExpenses = React.useMemo(() => {
    return (transactions ?? [])
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const balance = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="h-9 w-44 neu-pressed-sm rounded-xl animate-pulse" />
          <div className="flex items-center space-x-2">
            <div className="h-9 w-28 neu-pressed-sm rounded-xl animate-pulse" />
            <div className="h-9 w-36 neu-pressed-sm rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 neu-card rounded-2xl animate-pulse" />
          <div className="h-32 neu-card rounded-2xl animate-pulse" />
          <div className="h-32 neu-card rounded-2xl animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="h-80 col-span-12 lg:col-span-4 neu-card rounded-2xl animate-pulse" />
          <div className="h-80 col-span-12 lg:col-span-3 neu-card rounded-2xl animate-pulse" />
        </div>
        <div className="h-96 neu-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      {/* Top Header & Tactile Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger showWhen="closed" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-headline text-foreground">
              Financial Overview
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live ledger summary and budget tracking
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Desktop Button Set */}
          <div className="hidden lg:flex items-center gap-2">
            <ResetConfirmationDialog onConfirm={handleResetBudget}>
              <Button variant="outline" size="sm" className="gap-2 neu-btn">
                <RotateCcw className="size-3.5" />
                <span>Reset Ledger</span>
              </Button>
            </ResetConfirmationDialog>

            <AiSuggestionsDialog
              income={totalIncome}
              expenses={(transactions ?? []).filter((t) => t.type === 'expense')}
              budgets={budgets ?? []}
            />

            <SetIncomeDialog currentIncome={totalIncome} onSetIncome={handleSetIncome} />

            <ManageBudgetDialog budgets={budgets ?? []} onSetBudgets={setBudgets} />

            <AddTransactionSheet onAddTransaction={addTransaction}>
              <Button size="sm" className="gap-2 neu-primary-btn">
                <PlusCircle className="size-4" />
                <span>Add Transaction</span>
              </Button>
            </AddTransactionSheet>
          </div>

          {/* Medium Screen & Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <AddTransactionSheet onAddTransaction={addTransaction}>
              <Button size="sm" className="gap-2 neu-primary-btn">
                <PlusCircle className="size-4" />
                <span>Add</span>
              </Button>
            </AddTransactionSheet>

            <SetIncomeDialog currentIncome={totalIncome} onSetIncome={handleSetIncome} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-9 rounded-xl neu-btn">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="neu-card p-1.5 w-48">
                <ManageBudgetDialog budgets={budgets ?? []} onSetBudgets={setBudgets}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer rounded-lg">
                    <Settings className="size-4 text-muted-foreground" />
                    <span>Manage Budget</span>
                  </DropdownMenuItem>
                </ManageBudgetDialog>

                <AiSuggestionsDialog
                  income={totalIncome}
                  expenses={(transactions ?? []).filter((t) => t.type === 'expense')}
                  budgets={budgets ?? []}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer rounded-lg">
                    <Sparkles className="size-4 text-primary" />
                    <span>AI Suggestions</span>
                  </DropdownMenuItem>
                </AiSuggestionsDialog>

                <DropdownMenuSeparator className="my-1 border-black/5 dark:border-white/5" />

                <ResetConfirmationDialog onConfirm={handleResetBudget}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer text-destructive focus:text-destructive rounded-lg">
                    <RotateCcw className="size-4" />
                    <span>Reset Ledger</span>
                  </DropdownMenuItem>
                </ResetConfirmationDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <SummaryCards income={totalIncome} expenses={totalExpenses} balance={balance} />

      {/* Main Charts & Targets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-12 lg:col-span-4">
          <SpendingChart transactions={transactions ?? []} />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <BudgetGoals transactions={transactions ?? []} budgets={budgets ?? []} />
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <RecentTransactions
        transactions={transactions ?? []}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </div>
  );
}
