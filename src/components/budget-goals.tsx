'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Transaction, Budget } from '@/lib/types';
import { categories } from '@/lib/data';
import { cn } from '@/lib/utils';

type BudgetGoalsProps = {
  transactions: Transaction[];
  budgets: Budget[];
};

export function BudgetGoals({ transactions, budgets }: BudgetGoalsProps) {
  const categorySpending = React.useMemo(() => {
    const spending: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });
    return spending;
  }, [transactions]);

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

  if (!budgets || budgets.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-headline font-bold">Budget Targets</CardTitle>
          <CardDescription>
            You haven't set any budget goals yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="neu-pressed-sm rounded-xl p-6 text-center text-sm text-muted-foreground">
            Click on "Manage Budget" above to create your category limits.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-headline font-bold">Budget Targets</CardTitle>
            <CardDescription>Monthly spending limits by category</CardDescription>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg neu-pressed-sm text-primary">
            {budgets.length} Active
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {budgets.map((budget) => {
          const spent = categorySpending[budget.category] || 0;
          const isOverBudget = spent > budget.amount;
          const progress = isOverBudget ? 100 : (spent / budget.amount) * 100;
          const categoryDetails = getCategoryDetails(budget.category);
          const Icon = categoryDetails?.icon;

          return (
            <div key={budget.id} className="p-3 rounded-xl neu-pressed-sm space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg neu-card-sm flex items-center justify-center text-primary shrink-0">
                    {Icon && <Icon className="size-3.5" />}
                  </div>
                  <span className="font-semibold text-foreground text-xs sm:text-sm">{categoryDetails?.name}</span>
                </div>
                <div className={cn(
                  "font-mono tabular-nums text-xs font-semibold",
                  isOverBudget ? "text-destructive font-bold" : "text-muted-foreground"
                )}>
                  <span>{formatCurrency(spent)}</span>
                  <span className="opacity-60"> / </span>
                  <span>{formatCurrency(budget.amount)}</span>
                </div>
              </div>
              <Progress
                value={progress}
                indicatorClassName={cn(isOverBudget && "bg-gradient-to-r from-destructive to-rose-600")}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
