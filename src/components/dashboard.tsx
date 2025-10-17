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
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { ResetConfirmationDialog } from './reset-confirmation-dialog';

export function Dashboard() {
  const { state: sidebarState } = useSidebar();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const transactionsQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'transactions') : null,
  [firestore, user]);
  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const budgetsQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'budgets') : null,
  [firestore, user]);
  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    if (!transactionsQuery) return;
    const newTransaction = {
      ...transaction,
      date: new Date().toISOString(),
    };
    addDocumentNonBlocking(transactionsQuery, newTransaction);
  };
  
    const setBudgets = async (newBudgets: Budget[]) => {
        if (!user || !firestore) return;

        const budgetsColRef = collection(firestore, 'users', user.uid, 'budgets');
        const batch = writeBatch(firestore);

        try {
            const existingBudgetsSnapshot = await getDocs(budgetsColRef);
            existingBudgetsSnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            newBudgets.forEach((budget) => {
                const docRef = doc(budgetsColRef, budget.id);
                batch.set(docRef, {
                  category: budget.category,
                  amount: budget.amount,
                  id: budget.id 
                });
            });

            await batch.commit();

        } catch (error) {
            console.error("Error updating budgets: ", error);
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update budget goals.',
            });
        }
    };


  const handleSetIncome = (income: number) => {
    if (!transactionsQuery) return;
    const incomeTransaction = {
        name: 'Monthly Salary',
        amount: income,
        type: 'income' as 'income' | 'expense',
        category: 'salary',
        date: new Date(new Date().setDate(1)).toISOString(),
    };
    addDocumentNonBlocking(transactionsQuery, incomeTransaction);
  };

  const handleResetBudget = async () => {
    if (!user || !firestore) return;
    
    const batch = writeBatch(firestore);
    
    try {
      // 1. Delete all existing transactions
      const transQuery = collection(firestore, 'users', user.uid, 'transactions');
      const transSnapshot = await getDocs(transQuery);
      transSnapshot.forEach(doc => batch.delete(doc.ref));

      // 2. Delete all existing budgets
      const budgetsQuery = collection(firestore, 'users', user.uid, 'budgets');
      const budgetsSnapshot = await getDocs(budgetsQuery);
      budgetsSnapshot.forEach(doc => batch.delete(doc.ref));

      // 3. Commit the batch
      await batch.commit();
      
      toast({
        title: 'Budget Reset',
        description: 'Your transactions and budgets have been cleared.',
      });

    } catch (error) {
      console.error('Error resetting budget:', error);
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: 'There was a problem clearing your budget. Please try again.',
      });
    }
  };
  
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

  if (transactionsLoading || budgetsLoading) {
     return (
       <div className="flex flex-col flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
            <div className="flex items-center space-x-2">
                <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
                <div className="h-8 w-36 bg-muted rounded-md animate-pulse" />
            </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-28 bg-muted rounded-md animate-pulse" />
            <div className="h-28 bg-muted rounded-md animate-pulse" />
            <div className="h-28 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="h-80 col-span-12 lg:col-span-4 bg-muted rounded-md animate-pulse" />
            <div className="h-80 col-span-12 lg:col-span-3 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="h-96 bg-muted rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
      <div className="flex items-center gap-2">
          <SidebarTrigger
            className={cn(
              'data-[state=expanded]:hidden md:hidden',
              sidebarState === 'collapsed' && 'block'
            )}
          />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
        </div>
        <div className="flex items-center space-x-2">
          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <ResetConfirmationDialog onConfirm={handleResetBudget}>
                <Button variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Start New Budget
                </Button>
            </ResetConfirmationDialog>
            <AiSuggestionsDialog
              income={totalIncome}
              expenses={(transactions ?? []).filter(t => t.type === 'expense')}
              budgets={budgets ?? []}
            />
            <SetIncomeDialog currentIncome={totalIncome} onSetIncome={handleSetIncome} />
            <ManageBudgetDialog budgets={budgets ?? []} onSetBudgets={setBudgets} />
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
                <ManageBudgetDialog budgets={budgets ?? []} onSetBudgets={setBudgets}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Budget
                    </DropdownMenuItem>
                </ManageBudgetDialog>
                 <AiSuggestionsDialog
                    income={totalIncome}
                    expenses={(transactions ?? []).filter(t => t.type === 'expense')}
                    budgets={budgets ?? []}
                    >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Suggestions
                    </DropdownMenuItem>
                </AiSuggestionsDialog>
                <DropdownMenuSeparator />
                 <ResetConfirmationDialog onConfirm={handleResetBudget}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Start New Budget
                    </DropdownMenuItem>
                 </ResetConfirmationDialog>
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
          <BudgetGoals transactions={transactions ?? []} budgets={budgets ?? []} />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <SpendingChart transactions={transactions ?? []} />
        </div>
      </div>
      <RecentTransactions transactions={transactions ?? []} />
    </div>
  );
}

    