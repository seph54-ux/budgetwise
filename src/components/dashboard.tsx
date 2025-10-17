'use client';

import * as React from 'react';
import { initialTransactions, initialBudgets, categories } from '@/lib/data';
import type { Transaction, Budget } from '@/lib/types';
import { SummaryCards } from './summary-cards';
import { BudgetGoals } from './budget-goals';
import { SpendingChart } from './spending-chart';
import { RecentTransactions } from './recent-transactions';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { AddTransactionSheet } from './add-transaction-sheet';
import { AiSuggestionsDialog } from './ai-suggestions-dialog';

export function Dashboard() {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);
  const [budgets, setBudgets] = React.useState<Budget[]>(initialBudgets);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: (transactions.length + 1).toString(),
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };
  
  const totalIncome = React.useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalExpenses = React.useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <AiSuggestionsDialog
            income={totalIncome}
            expenses={transactions.filter(t => t.type === 'expense')}
            budgets={budgets}
          />
          <AddTransactionSheet onAddTransaction={addTransaction}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </AddTransactionSheet>
        </div>
      </div>
      <SummaryCards
        income={totalIncome}
        expenses={totalExpenses}
        balance={balance}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-12 lg:col-span-4">
          <BudgetGoals transactions={transactions} budgets={budgets} />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <SpendingChart transactions={transactions} />
        </div>
      </div>
      <RecentTransactions transactions={transactions} />
    </div>
  );
}
