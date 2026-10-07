'use client';

import * as React from 'react';
import type { Transaction } from '@/lib/types';
import { RecentTransactions } from '@/components/recent-transactions';
import { AddTransactionSheet } from '@/components/add-transaction-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useBudgetWiseData } from '@/lib/supabase/use-budget-data';

export default function TransactionsPage() {
    const { state: sidebarState } = useSidebar();
    const {
        transactions,
        isLoading,
        addTransaction,
        deleteTransaction: handleDeleteTransaction,
    } = useBudgetWiseData();

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
                        'data-[state=expanded]:hidden',
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
