'use client';

import * as React from 'react';
import type { Transaction } from '@/lib/types';
import { RecentTransactions } from '@/components/recent-transactions';
import { AddTransactionSheet } from '@/components/add-transaction-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { state: sidebarState } = useSidebar();

    const transactionsQuery = useMemoFirebase(() => 
        user ? collection(firestore, 'users', user.uid, 'transactions') : null,
    [firestore, user]);

    const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

    const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
        if (!transactionsQuery || !user) return;
        const newTransaction: Omit<Transaction, 'id' | 'userId'> = {
          ...transaction,
          userId: user.uid,
          date: new Date().toISOString(),
        };
        addDocumentNonBlocking(transactionsQuery, newTransaction);
    };

    const handleDeleteTransaction = (transactionId: string) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, 'users', user.uid, 'transactions', transactionId);
        deleteDocumentNonBlocking(docRef);
        toast({
            title: 'Transaction Deleted',
            description: 'The transaction has been successfully removed.',
        });
    }

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
                 <div className="flex items-center gap-2">
                    <SidebarTrigger
                        className={cn(
                        'data-[state=expanded]:hidden md:hidden',
                        sidebarState === 'collapsed' && 'block'
                        )}
                    />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Transactions</h2>
                </div>
                <AddTransactionSheet onAddTransaction={addTransaction}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Transaction
                    </Button>
                </AddTransactionSheet>
            </div>
            <RecentTransactions transactions={transactions ?? []} showAll={true} onDeleteTransaction={handleDeleteTransaction} />
        </div>
    );
}
