import type { Category, Transaction, Budget } from '@/lib/types';
import {
  UtensilsCrossed,
  Car,
  Ticket,
  Home,
  Zap,
  HeartPulse,
  ShoppingBag,
  Landmark,
  Sprout,
} from 'lucide-react';

export const categories: Category[] = [
  { id: 'food', name: 'Food', color: 'hsl(var(--chart-1))', icon: UtensilsCrossed },
  { id: 'transport', name: 'Transport', color: 'hsl(var(--chart-2))', icon: Car },
  { id: 'entertainment', name: 'Entertainment', color: 'hsl(var(--chart-3))', icon: Ticket },
  { id: 'housing', name: 'Housing', color: 'hsl(var(--chart-4))', icon: Home },
  { id: 'utilities', name: 'Utilities', color: 'hsl(var(--chart-5))', icon: Zap },
  { id: 'health', name: 'Health', color: 'hsl(340 75% 55%)', icon: HeartPulse },
  { id: 'shopping', name: 'Shopping', color: 'hsl(280 65% 60%)', icon: ShoppingBag },
  { id: 'salary', name: 'Salary', color: 'hsl(160 60% 45%)', icon: Landmark },
  { id: 'other', name: 'Other', color: 'hsl(0 0% 63.9%)', icon: Sprout },
];

export const initialTransactions: Transaction[] = [
  { id: '1', date: new Date(new Date().setDate(1)).toISOString(), name: 'Monthly Salary', amount: 5000, type: 'income', category: 'salary' },
  { id: '2', date: new Date(new Date().setDate(2)).toISOString(), name: 'Groceries', amount: 150.75, type: 'expense', category: 'food' },
  { id: '3', date: new Date(new Date().setDate(3)).toISOString(), name: 'Gasoline', amount: 45.5, type: 'expense', category: 'transport' },
  { id: '4', date: new Date(new Date().setDate(5)).toISOString(), name: 'Rent', amount: 1200, type: 'expense', category: 'housing' },
  { id: '5', date: new Date(new Date().setDate(7)).toISOString(), name: 'Movie Night', amount: 35, type: 'expense', category: 'entertainment' },
  { id: '6', date: new Date(new Date().setDate(10)).toISOString(), name: 'Electricity Bill', amount: 75, type: 'expense', category: 'utilities' },
  { id: '7', date: new Date(new Date().setDate(12)).toISOString(), name: 'Dinner Out', amount: 80.20, type: 'expense', category: 'food' },
  { id: '8', date: new Date(new Date().setDate(15)).toISOString(), name: 'Pharmacy', amount: 25, type: 'expense', category: 'health' },
  { id: '9', date: new Date(new Date().setDate(18)).toISOString(), name: 'New Clothes', amount: 120, type: 'expense', category: 'shopping' },
  { id: '10', date: new Date(new Date().setDate(20)).toISOString(), name: 'Public Transport Pass', amount: 55, type: 'expense', category: 'transport' },
];

export const initialBudgets: Budget[] = [
  { id: '1', category: 'food', amount: 500 },
  { id: '2', category: 'transport', amount: 150 },
  { id: '3', category: 'entertainment', amount: 200 },
  { id: '4', category: 'housing', amount: 1200 },
  { id: '5', category: 'utilities', amount: 150 },
  { id: '6', category: 'health', amount: 100 },
  { id: '7', category: 'shopping', amount: 250 },
  { id: '8', category: 'other', amount: 100 },
];
