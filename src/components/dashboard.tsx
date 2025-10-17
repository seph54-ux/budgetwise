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
import { collection, doc, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initialBudgets } from '@/lib/data';

export function Dashboard() {
  const { state: sidebarState } = useSidebar();
  const { user } = useUser();
  const firestore = useFirestore();

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
            // 1. Get all existing budget documents
            const existingBudgetsSnapshot = await getDocs(budgetsColRef);

            // 2. Delete each existing document in the batch
            existingBudgetsSnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // 3. Add each new budget document in the batch
            newBudgets.forEach((budget) => {
                const newDocRef = doc(budgetsColRef, budget.id); // Use the existing ID
                batch.set(newDocRef, {
                  category: budget.category,
                  amount: budget.amount,
                });
            });

            // 4. Commit the batch
            await batch.commit();

        } catch (error) {
            console.error("Error updating budgets: ", error);
            // Optionally, handle the error with a toast notification
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
    // This is a simple way to handle it. A more complex app might update or create a specific income doc.
    addDocumentNonBlocking(transactionsQuery, incomeTransaction);
  };

  const handleNewBudget = () => {
    // This should probably be a more sophisticated reset logic
    // For now, we'll just re-set the budgets to the initial ones
    if (user) {
        setBudgets(initialBudgets);
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

  // Render a loading state while fetching data
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
