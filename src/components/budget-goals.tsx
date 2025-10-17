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
    }).format(amount);
  };

  if (!budgets || budgets.length === 0) {
      return (
          <Card className="h-full">
              <CardHeader>
                <CardTitle>Budget Goals</CardTitle>
                <CardDescription>
                You haven't set any budget goals yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-muted-foreground">Click on "Manage Budget" to create your first budget goal.</p>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Budget Goals</CardTitle>
        <CardDescription>
          Your monthly spending goals for each category.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget) => {
          const spent = categorySpending[budget.category] || 0;
          const isOverBudget = spent > budget.amount;
          const progress = isOverBudget ? 100 : (spent / budget.amount) * 100;
          const categoryDetails = getCategoryDetails(budget.category);
          const Icon = categoryDetails?.icon;

          return (
            <div key={budget.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  <span className="font-medium">{categoryDetails?.name}</span>
                </div>
                <span className={cn(
                  "text-sm text-muted-foreground",
                  isOverBudget && "text-destructive font-semibold"
                )}>
                  {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                </span>
              </div>
              <Progress value={progress} indicatorClassName={cn(isOverBudget && "bg-destructive")} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
