'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import type { SavingsGoal, SavingsTransaction } from '@/lib/types';

interface SavingsHistorySheetProps {
  goal: SavingsGoal;
  transactions: SavingsTransaction[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SavingsHistorySheet({ goal, transactions, open, onOpenChange }: SavingsHistorySheetProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-6">
        <SheetHeader className="pb-3">
          <SheetTitle className="text-xl font-bold font-headline">History: {goal.name}</SheetTitle>
          <SheetDescription>
            Chronological log of deposits toward this savings goal.
          </SheetDescription>
        </SheetHeader>
        <div className="rounded-xl neu-pressed-sm p-1 mt-4">
          <ScrollArea className="h-[calc(100vh-12rem)] w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-black/5 dark:border-white/5 hover:bg-transparent">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.length > 0 ? (
                  sortedTransactions.map((tx) => (
                    <TableRow key={tx.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02]">
                      <TableCell className="py-3 text-xs font-mono text-muted-foreground">
                        {format(new Date(tx.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="py-3 text-right font-mono tabular-nums font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-xs text-muted-foreground">
                      No contributions made yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
