'use client';

import * as React from 'react';
import type { Transaction } from '@/lib/types';
import { RecentTransactions } from '@/components/recent-transactions';
import { AddTransactionSheet } from '@/components/add-transaction-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useBudgetWiseData } from '@/lib/supabase/use-budget-data';

export default function TransactionsPage() {
  const { state: sidebarState } = useSidebar();
  const {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction: handleDeleteTransaction,
  } = useBudgetWiseData();

  const totalInflow = React.useMemo(() => {
    return (transactions ?? [])
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalOutflow = React.useMemo(() => {
    return (transactions ?? [])
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="h-9 w-44 neu-pressed-sm rounded-xl animate-pulse" />
          <div className="h-9 w-36 neu-pressed-sm rounded-xl animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-20 neu-card rounded-2xl animate-pulse" />
          <div className="h-20 neu-card rounded-2xl animate-pulse" />
          <div className="h-20 neu-card rounded-2xl animate-pulse" />
        </div>
        <div className="h-96 neu-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger showWhen="closed" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-headline text-foreground">
              Transactions
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and record your financial activities
            </p>
          </div>
        </div>

        <AddTransactionSheet onAddTransaction={addTransaction}>
          <Button className="neu-primary-btn gap-2 shrink-0 self-start sm:self-auto">
            <PlusCircle className="size-4" />
            <span>Add Transaction</span>
          </Button>
        </AddTransactionSheet>
      </div>

      {/* Quick Cashflow Mini-Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="p-3.5 rounded-2xl neu-card-sm flex items-center gap-3">
          <div className="size-9 rounded-xl neu-pressed-sm flex items-center justify-center text-primary shrink-0">
            <Wallet className="size-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Logged Records</span>
            <p className="text-lg font-extrabold font-mono tabular-nums text-foreground">{transactions?.length || 0}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl neu-card-sm flex items-center gap-3">
          <div className="size-9 rounded-xl neu-pressed-sm flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ArrowUpRight className="size-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Inflows</span>
            <p className="text-lg font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalInflow)}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl neu-card-sm flex items-center gap-3">
          <div className="size-9 rounded-xl neu-pressed-sm flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <ArrowDownRight className="size-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Outflows</span>
            <p className="text-lg font-extrabold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              -{formatCurrency(totalOutflow)}
            </p>
          </div>
        </div>
      </div>

      {/* Full Ledger */}
      <RecentTransactions
        transactions={transactions ?? []}
        showAll={true}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </div>
  );
}
