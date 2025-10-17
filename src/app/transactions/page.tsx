'use client';

import * as React from 'react';
import type { Transaction } from '@/lib/types';
import { RecentTransactions } from '@/components/recent-transactions';
import { AddTransactionSheet } from '@/components/add-transaction-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';


export default function TransactionsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const transactionsQuery = useMemoFirebase(() => 
        user ? collection(firestore, 'users', user.uid, 'transactions') : null,
    [firestore, user]);

    const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

    const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
        if (!transactionsQuery) return;
        const newTransaction: Omit<Transaction, 'id'> = {
          ...transaction,
          date: new Date().toISOString(),
        };
        addDocumentNonBlocking(transactionsQuery, newTransaction);
    };

    if (isLoading) {
        return (
             <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <Skeleton className="h-96" />
            </div>
        )
    }
    
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
            <RecentTransactions transactions={transactions ?? []} showAll={true} />
        </div>
    );
}
