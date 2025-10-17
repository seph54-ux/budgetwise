'use client';

import * as React from 'react';
import { initialTransactions } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { RecentTransactions } from '@/components/recent-transactions';
import { AddTransactionSheet } from '@/components/add-transaction-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';


export default function TransactionsPage() {
    const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);

    const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: (transactions.length + 1).toString(),
          date: new Date().toISOString(),
        };
        setTransactions((prev) => [newTransaction, ...prev]);
    };
    
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Transactions</h2>
                <AddTransactionSheet onAddTransaction={addTransaction}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Transaction
                    </Button>
                </AddTransactionSheet>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>
                        A complete history of your income and expenses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Using RecentTransactions component to display all for now */}
                    <RecentTransactions transactions={transactions} />
                </CardContent>
            </Card>
        </div>
    );
}
