import type { LucideIcon } from 'lucide-react';

export type Transaction = {
  id: string;
  date: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: LucideIcon;
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  source: 'bank' | 'digital-wallet' | 'cash' | 'other';
  userId: string;
};

export type SavingsTransaction = {
    id: string;
    goalId: string;
    amount: number;
    date: string;
    userId: string;
};
