import { supabase, isSupabaseConfigured } from './client';
import type { Transaction, Budget, SavingsGoal, SavingsTransaction } from '@/lib/types';

// In-memory / localStorage fallback stores for local exploration before Supabase is connected
const getLocalData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(`budgetwise_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`budgetwise_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// ==================== TRANSACTIONS ====================

export async function getTransactions(userId: string): Promise<Transaction[]> {
  if (!isSupabaseConfigured()) {
    return getLocalData<Transaction[]>(`transactions_${userId}`, [
      {
        id: 'mock-tx-1',
        name: 'Monthly Salary',
        amount: 50000,
        type: 'income',
        category: 'salary',
        date: new Date().toISOString(),
      },
      {
        id: 'mock-tx-2',
        name: 'Grocery Shopping',
        amount: 3500,
        type: 'expense',
        category: 'Food',
        date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'mock-tx-3',
        name: 'Electricity Bill',
        amount: 2200,
        type: 'expense',
        category: 'Utilities',
        date: new Date(Date.now() - 172800000).toISOString(),
      },
    ]);
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Supabase getTransactions error:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    date: row.date,
  }));
}

export async function addTransaction(
  transaction: Omit<Transaction, 'id'>,
  userId: string
): Promise<Transaction> {
  if (!isSupabaseConfigured()) {
    const local = getLocalData<Transaction[]>(`transactions_${userId}`, []);
    const newTx: Transaction = {
      ...transaction,
      id: `local-tx-${Date.now()}`,
    };
    const updated = [newTx, ...local];
    setLocalData(`transactions_${userId}`, updated);
    return newTx;
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: userId,
        name: transaction.name,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date || new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Supabase addTransaction error:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    amount: Number(data.amount),
    type: data.type,
    category: data.category,
    date: data.date,
  };
}

export async function deleteTransaction(id: string, userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const local = getLocalData<Transaction[]>(`transactions_${userId}`, []);
    const updated = local.filter((t) => t.id !== id);
    setLocalData(`transactions_${userId}`, updated);
    return;
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase deleteTransaction error:', error);
    throw error;
  }
}

// ==================== BUDGETS ====================

export async function getBudgets(userId: string): Promise<Budget[]> {
  if (!isSupabaseConfigured()) {
    return getLocalData<Budget[]>(`budgets_${userId}`, [
      { id: 'b-1', category: 'Food', amount: 10000 },
      { id: 'b-2', category: 'Transport', amount: 4000 },
      { id: 'b-3', category: 'Utilities', amount: 5000 },
      { id: 'b-4', category: 'Entertainment', amount: 3000 },
    ]);
  }

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase getBudgets error:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    category: row.category,
    amount: Number(row.amount),
  }));
}

export async function saveBudgets(budgets: Budget[], userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    setLocalData(`budgets_${userId}`, budgets);
    return;
  }

  // Delete existing and insert new
  await supabase.from('budgets').delete().eq('user_id', userId);

  if (budgets.length > 0) {
    const rows = budgets.map((b) => ({
      id: b.id,
      user_id: userId,
      category: b.category,
      amount: b.amount,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('budgets').insert(rows);
    if (error) {
      console.error('Supabase saveBudgets error:', error);
      throw error;
    }
  }
}

export async function resetBudgetAndTransactions(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    setLocalData(`transactions_${userId}`, []);
    setLocalData(`budgets_${userId}`, []);
    return;
  }

  await Promise.all([
    supabase.from('transactions').delete().eq('user_id', userId),
    supabase.from('budgets').delete().eq('user_id', userId),
  ]);
}

// ==================== SAVINGS GOALS ====================

export async function getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  if (!isSupabaseConfigured()) {
    return getLocalData<SavingsGoal[]>(`savingsGoals_${userId}`, [
      {
        id: 'goal-1',
        name: 'Emergency Fund',
        targetAmount: 50000,
        currentAmount: 18500,
        source: 'bank',
        userId,
      },
      {
        id: 'goal-2',
        name: 'New Laptop',
        targetAmount: 45000,
        currentAmount: 12000,
        source: 'digital-wallet',
        userId,
      },
    ]);
  }

  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase getSavingsGoals error:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount || 0),
    source: row.source,
    userId: row.user_id,
  }));
}

export async function addSavingsGoal(
  goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'userId'>,
  userId: string
): Promise<SavingsGoal> {
  if (!isSupabaseConfigured()) {
    const current = getLocalData<SavingsGoal[]>(`savingsGoals_${userId}`, []);
    const newGoal: SavingsGoal = {
      ...goal,
      id: `local-goal-${Date.now()}`,
      currentAmount: 0,
      userId,
    };
    setLocalData(`savingsGoals_${userId}`, [...current, newGoal]);
    return newGoal;
  }

  const { data, error } = await supabase
    .from('savings_goals')
    .insert([
      {
        user_id: userId,
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: 0,
        source: goal.source,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Supabase addSavingsGoal error:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    targetAmount: Number(data.target_amount),
    currentAmount: Number(data.current_amount || 0),
    source: data.source,
    userId: data.user_id,
  };
}

export async function deleteSavingsGoal(goalId: string, userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const goals = getLocalData<SavingsGoal[]>(`savingsGoals_${userId}`, []);
    setLocalData(
      `savingsGoals_${userId}`,
      goals.filter((g) => g.id !== goalId)
    );
    const txs = getLocalData<SavingsTransaction[]>(`savingsTxs_${userId}`, []);
    setLocalData(
      `savingsTxs_${userId}`,
      txs.filter((t) => t.goalId !== goalId)
    );
    return;
  }

  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase deleteSavingsGoal error:', error);
    throw error;
  }
}

// ==================== SAVINGS TRANSACTIONS ====================

export async function getSavingsTransactions(userId: string): Promise<SavingsTransaction[]> {
  if (!isSupabaseConfigured()) {
    return getLocalData<SavingsTransaction[]>(`savingsTxs_${userId}`, [
      {
        id: 'st-1',
        goalId: 'goal-1',
        amount: 5000,
        date: new Date(Date.now() - 604800000).toISOString(),
        userId,
      },
    ]);
  }

  const { data, error } = await supabase
    .from('savings_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Supabase getSavingsTransactions error:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    goalId: row.goal_id,
    amount: Number(row.amount),
    date: row.date,
    userId: row.user_id,
  }));
}

export async function addSavingsContribution(
  goalId: string,
  amount: number,
  userId: string,
  currentAmount: number
): Promise<void> {
  const newTotal = currentAmount + amount;

  if (!isSupabaseConfigured()) {
    // Update goal
    const goals = getLocalData<SavingsGoal[]>(`savingsGoals_${userId}`, []);
    const updatedGoals = goals.map((g) =>
      g.id === goalId ? { ...g, currentAmount: newTotal } : g
    );
    setLocalData(`savingsGoals_${userId}`, updatedGoals);

    // Add transaction
    const txs = getLocalData<SavingsTransaction[]>(`savingsTxs_${userId}`, []);
    const newTx: SavingsTransaction = {
      id: `local-st-${Date.now()}`,
      goalId,
      amount,
      date: new Date().toISOString(),
      userId,
    };
    setLocalData(`savingsTxs_${userId}`, [newTx, ...txs]);
    return;
  }

  // Insert transaction
  const { error: txError } = await supabase.from('savings_transactions').insert([
    {
      user_id: userId,
      goal_id: goalId,
      amount,
      date: new Date().toISOString(),
    },
  ]);

  if (txError) {
    console.error('Supabase addSavingsContribution error:', txError);
    throw txError;
  }

  // Update goal current amount
  const { error: goalError } = await supabase
    .from('savings_goals')
    .update({ current_amount: newTotal })
    .eq('id', goalId)
    .eq('user_id', userId);

  if (goalError) {
    console.error('Supabase updateSavingsGoal error:', goalError);
    throw goalError;
  }
}
