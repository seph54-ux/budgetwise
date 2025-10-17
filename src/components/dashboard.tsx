'use client';

import * as React from 'react';
import { initialTransactions, initialBudgets } from '@/lib/data';
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
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

export function Dashboard() {
  const { state: sidebarState } = useSidebar();
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);
  const [budgets, setBudgets] = React.useState<Budget[]>(initialBudgets);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleSetIncome = (income: number) => {
    const incomeTransaction: Transaction = {
        id: '1',
        name: 'Monthly Salary',
        amount: income,
        type: 'income',
        category: 'salary',
        date: new Date(new Date().setDate(1)).toISOString(),
    };
    setTransactions(prev => [
        incomeTransaction,
        ...prev.filter(t => t.type !== 'income')
    ]);
  };

  const handleNewBudget = () => {
    setTransactions([]);
    setBudgets(initialBudgets);
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
      <div className="flex items-center gap-2">
          <SidebarTrigger
            className={cn(
              'data-[state=expanded]:hidden md:hidden', // only show on mobile when collapsed
              sidebarState === 'collapsed' && 'block'
            )}
          />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
        </div>
        <div className="flex items-center space-x-2">
          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="outline" onClick={handleNewBudget}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Start New Budget
            </Button>
            <AiSuggestionsDialog
              income={totalIncome}
              expenses={transactions.filter(t => t.type === 'expense')}
              budgets={budgets}
            />
            <SetIncomeDialog currentIncome={totalIncome} onSetIncome={handleSetIncome} />
            <ManageBudgetDialog budgets={budgets} onSetBudgets={setBudgets} />
            <AddTransactionSheet onAddTransaction={addTransaction}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </AddTransactionSheet>
          </div>
          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AddTransactionSheet onAddTransaction={addTransaction}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Transaction
                  </DropdownMenuItem>
                </AddTransactionSheet>
                 <SetIncomeDialog currentIncome={totalIncome} onSetIncome={handleSetIncome}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Wallet className="mr-2 h-4 w-4" />
                        Set Income
                    </DropdownMenuItem>
                </SetIncomeDialog>
                <ManageBudgetDialog budgets={budgets} onSetBudgets={setBudgets}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Budget
                    </DropdownMenuItem>
                </ManageBudgetDialog>
                 <AiSuggestionsDialog
                    income={totalIncome}
                    expenses={transactions.filter(t => t.type === 'expense')}
                    budgets={budgets}
                    >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Suggestions
                    </DropdownMenuItem>
                </AiSuggestionsDialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleNewBudget}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start New Budget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
