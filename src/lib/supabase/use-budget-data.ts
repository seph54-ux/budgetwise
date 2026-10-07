'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Transaction, Budget, SavingsGoal, SavingsTransaction } from '@/lib/types';
import {
  getTransactions,
  addTransaction as dbAddTransaction,
  deleteTransaction as dbDeleteTransaction,
  getBudgets,
  saveBudgets,
  resetBudgetAndTransactions,
  getSavingsGoals,
  addSavingsGoal as dbAddSavingsGoal,
  deleteSavingsGoal as dbDeleteSavingsGoal,
  getSavingsTransactions,
  addSavingsContribution as dbAddSavingsContribution,
} from './db';
import { isSupabaseConfigured } from './client';
import { useSupabaseAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';

export function useBudgetWiseData() {
  const { user } = useSupabaseAuth();
  const userId = user?.id || 'demo-user';
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgetsState] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isConfigured = isSupabaseConfigured();

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txData, bData, sgData, stData] = await Promise.all([
        getTransactions(userId),
        getBudgets(userId),
        getSavingsGoals(userId),
        getSavingsTransactions(userId),
      ]);
      setTransactions(txData);
      setBudgetsState(bData);
      setSavingsGoals(sgData);
      setSavingsTransactions(stData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      toast({
        variant: 'destructive',
        title: 'Data Load Error',
        description: err.message || 'Could not fetch database records.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'date'>) => {
    try {
      const created = await dbAddTransaction(
        {
          ...tx,
          date: new Date().toISOString(),
        },
        userId
      );
      setTransactions((prev) => [created, ...prev]);
      toast({
        title: 'Transaction Added',
        description: `${tx.name} (${tx.type}) added successfully.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to add transaction.',
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await dbDeleteTransaction(id, userId);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast({
        title: 'Transaction Deleted',
        description: 'The transaction has been removed.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to delete transaction.',
      });
    }
  };

  const setBudgets = async (newBudgets: Budget[]) => {
    try {
      await saveBudgets(newBudgets, userId);
      setBudgetsState(newBudgets);
      toast({
        title: 'Budgets Updated',
        description: 'Your budget targets have been saved.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to update budgets.',
      });
    }
  };

  const setIncome = async (income: number) => {
    const incomeTransaction = {
      name: 'Monthly Salary',
      amount: income,
      type: 'income' as const,
      category: 'salary',
    };
    await addTransaction(incomeTransaction);
  };

  const resetBudget = async () => {
    try {
      await resetBudgetAndTransactions(userId);
      setTransactions([]);
      setBudgetsState([]);
      toast({
        title: 'Budget Reset',
        description: 'All transactions and budget targets have been cleared.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to reset budget.',
      });
    }
  };

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'userId'>) => {
    try {
      const created = await dbAddSavingsGoal(goal, userId);
      setSavingsGoals((prev) => [...prev, created]);
      toast({
        title: 'Goal Created',
        description: `New goal "${goal.name}" created!`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to create savings goal.',
      });
    }
  };

  const addContribution = async (goalId: string, amount: number) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    try {
      await dbAddSavingsContribution(goalId, amount, userId, goal.currentAmount);
      setSavingsGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
      );
      setSavingsTransactions((prev) => [
        {
          id: `st-${Date.now()}`,
          goalId,
          amount,
          date: new Date().toISOString(),
          userId,
        },
        ...prev,
      ]);
      toast({
        title: 'Contribution Added',
        description: `Added ₱${amount.toLocaleString()} towards "${goal.name}".`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to record contribution.',
      });
    }
  };

  const deleteSavingsGoal = async (goalId: string) => {
    try {
      await dbDeleteSavingsGoal(goalId, userId);
      setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
      setSavingsTransactions((prev) => prev.filter((t) => t.goalId !== goalId));
      toast({
        title: 'Goal Deleted',
        description: 'The savings goal and contributions have been removed.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to delete goal.',
      });
    }
  };

  return {
    transactions,
    budgets,
    savingsGoals,
    savingsTransactions,
    isLoading,
    isConfigured,
    refreshData: loadAllData,
    addTransaction,
    deleteTransaction,
    setBudgets,
    setIncome,
    resetBudget,
    addSavingsGoal,
    addContribution,
    deleteSavingsGoal,
  };
}
