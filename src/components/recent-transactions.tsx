'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import type { Transaction } from '@/lib/types';
import { categories } from '@/lib/data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { MoreHorizontal, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type RecentTransactionsProps = {
  transactions: Transaction[];
  showAll?: boolean;
  onDeleteTransaction?: (transactionId: string) => void;
};

export function RecentTransactions({
  transactions,
  showAll = false,
  onDeleteTransaction,
}: RecentTransactionsProps) {
  const [filterType, setFilterType] = React.useState<'all' | 'income' | 'expense'>('all');

  const getCategoryDetails = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions]);

  const filteredTransactions = React.useMemo(() => {
    if (filterType === 'all') return sortedTransactions;
    return sortedTransactions.filter((t) => t.type === filterType);
  }, [sortedTransactions, filterType]);

  const transactionsToShow = showAll
    ? filteredTransactions
    : filteredTransactions.slice(0, 8);

  const cardTitle = showAll ? 'All Transactions' : 'Recent Transactions';
  const cardDescription = showAll
    ? 'Complete chronological history of your cashflow.'
    : 'Latest financial activities on your ledger.';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-headline font-bold">{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </div>

          {/* Segmented Filter Control */}
          <div className="inline-flex p-1 rounded-xl neu-pressed-sm self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                filterType === 'all'
                  ? "neu-card-sm text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                filterType === 'income'
                  ? "neu-card-sm text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                filterType === 'expense'
                  ? "neu-card-sm text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Expenses
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {transactionsToShow.length === 0 ? (
          <div className="neu-pressed-sm rounded-2xl p-10 text-center space-y-2">
            <p className="font-semibold text-sm text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground">
              {filterType === 'all'
                ? 'Add your first transaction above to get started.'
                : `No ${filterType} records match the current filter.`}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-xl neu-pressed-sm p-1">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-black/5 dark:border-white/5 hover:bg-transparent">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Transaction</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amount</TableHead>
                    {onDeleteTransaction && <TableHead className="w-[48px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsToShow.map((transaction) => {
                    const category = getCategoryDetails(transaction.category);
                    const Icon = category?.icon;
                    const isIncome = transaction.type === 'income';

                    return (
                      <TableRow
                        key={transaction.id}
                        className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "size-8.5 rounded-lg neu-card-sm flex items-center justify-center shrink-0",
                              isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
                            )}>
                              {Icon ? <Icon className="size-4" /> : isIncome ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                            </div>
                            <span className="font-medium text-foreground">{transaction.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-muted-foreground font-medium">
                          {category?.name || 'Other'}
                        </TableCell>
                        <TableCell className="py-3 text-xs font-mono text-muted-foreground">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className={cn(
                          "py-3 text-right font-mono tabular-nums font-semibold text-sm",
                          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </TableCell>
                        {onDeleteTransaction && (
                          <TableCell className="py-3 text-right">
                            <AlertDialog>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-8 rounded-lg neu-btn">
                                    <MoreHorizontal className="size-4 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="neu-card p-1">
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer rounded-lg">
                                      <Trash2 className="size-3.5" />
                                      <span>Delete Record</span>
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <AlertDialogContent className="neu-card">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove "{transaction.name}" ({formatCurrency(transaction.amount)}) from your budget calculation.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="neu-btn">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDeleteTransaction(transaction.id)}
                                    className="neu-danger-btn"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List View */}
            <div className="sm:hidden space-y-2.5">
              {transactionsToShow.map((transaction) => {
                const category = getCategoryDetails(transaction.category);
                const Icon = category?.icon;
                const isIncome = transaction.type === 'income';

                return (
                  <div
                    key={transaction.id}
                    className="p-3.5 rounded-xl neu-pressed-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "size-9 rounded-xl neu-card-sm flex items-center justify-center shrink-0",
                        isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
                      )}>
                        {Icon ? <Icon className="size-4" /> : isIncome ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate text-foreground">{transaction.name}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <span>{category?.name || 'Other'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{format(new Date(transaction.date), 'MMM d')}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn(
                        "font-mono tabular-nums font-bold text-sm",
                        isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>

                      {onDeleteTransaction && (
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-7 rounded-lg neu-btn">
                                <MoreHorizontal className="size-3.5 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="neu-card p-1">
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer text-xs">
                                  <Trash2 className="size-3.5" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <AlertDialogContent className="neu-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove "{transaction.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="neu-btn">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteTransaction(transaction.id)}
                                className="neu-danger-btn"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
