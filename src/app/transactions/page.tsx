'use client';

import * as React from 'react';
import { initialTransactions } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { RecentTransactions } from '@/components/recent-transactions';
import { AddTransactionSheet } from '@/components/add-transaction-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';


export default function TransactionsPage() {
    const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);

    const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
        };
        setTransactions((prev) => [newTransaction, ...prev]);
    };
    
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Transactions</h2>
                <AddTransactionSheet onAddTransaction={addTransaction}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Transaction
                    </Button>
                </AddTransactionSheet>
            </div>
            <RecentTransactions transactions={transactions} showAll={true} />
        </div>
    );
}
