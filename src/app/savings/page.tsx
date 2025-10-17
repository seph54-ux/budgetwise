'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Landmark, Wallet, Box, MoreHorizontal, History, Trash2 } from 'lucide-react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, writeBatch, doc, getDocs, query, where } from 'firebase/firestore';
import type { SavingsGoal, SavingsTransaction } from '@/lib/types';
import { AddSavingsGoalDialog } from '@/components/add-savings-goal';
import { AddSavingsContributionDialog } from '@/components/add-savings-contribution';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';
import { SavingsHistorySheet } from '@/components/savings-history-sheet';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const sourceIcons: Record<string, React.ElementType> = {
    bank: Landmark,
    'digital-wallet': Wallet,
    cash: Box,
    other: Box,
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
};

export default function SavingsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [selectedGoalForHistory, setSelectedGoalForHistory] = React.useState<SavingsGoal | null>(null);

    const goalsQuery = useMemoFirebase(() =>
        user ? collection(firestore, 'users', user.uid, 'savingsGoals') : null, [firestore, user]
    );
    const { data: savingsGoals, isLoading: goalsLoading } = useCollection<SavingsGoal>(goalsQuery);

    const transactionsQuery = useMemoFirebase(() =>
        user ? collection(firestore, 'users', user.uid, 'savingsTransactions') : null, [firestore, user]
    );
    const { data: savingsTransactions, isLoading: transactionsLoading } = useCollection<SavingsTransaction>(transactionsQuery);

    const handleAddGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'userId'>) => {
        if (!goalsQuery || !user) return;
        const newGoal = {
            ...goal,
            currentAmount: 0,
            userId: user.uid,
        };
        addDocumentNonBlocking(goalsQuery, newGoal);
    };

    const handleAddContribution = async (contribution: { goalId: string; amount: number }) => {
        if (!transactionsQuery || !user) return;
        const newTransaction: Omit<SavingsTransaction, 'id'> = {
            ...contribution,
            date: new Date().toISOString(),
            userId: user.uid,
        };
        addDocumentNonBlocking(transactionsQuery, newTransaction);
        
        const goalRef = doc(firestore, 'users', user.uid, 'savingsGoals', contribution.goalId);
        const goal = savingsGoals?.find(g => g.id === contribution.goalId);
        if (goal) {
            const newAmount = goal.currentAmount + contribution.amount;
            const batch = writeBatch(firestore);
            batch.update(goalRef, { currentAmount: newAmount });
            batch.commit().catch(async (serverError) => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: goalRef.path,
                        operation: 'update',
                        requestResourceData: { currentAmount: newAmount },
                    })
                );
            });
        }
    };
    
    const handleGoalHistory = (goal: SavingsGoal) => {
        setSelectedGoalForHistory(goal);
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!user || !firestore) return;
    
        const batch = writeBatch(firestore);
    
        const goalRef = doc(firestore, 'users', user.uid, 'savingsGoals', goalId);
        batch.delete(goalRef);
    
        const transactionsColRef = collection(firestore, 'users', user.uid, 'savingsTransactions');
        const q = query(transactionsColRef, where('goalId', '==', goalId));
        
        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            batch.commit()
                .then(() => {
                     toast({
                        title: 'Goal Deleted',
                        description: 'The savings goal and all its contributions have been removed.',
                    });
                })
                .catch(async (serverError) => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: `users/${user.uid}/savingsGoals and related transactions`,
                        operation: 'delete',
                    }));
                });

        } catch (error) {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${user.uid}/savingsTransactions`,
                operation: 'list', // The getDocs failed
            }));
        }
    };

    if (goalsLoading || transactionsLoading) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                 <div className="flex items-center justify-between space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-8 w-3/4" />
                            </CardContent>
                             <CardFooter>
                                <Skeleton className="h-10 w-28" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Savings Goals</h2>
                <AddSavingsGoalDialog onAddGoal={handleAddGoal}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Goal
                    </Button>
                </AddSavingsGoalDialog>
            </div>
            
            {savingsGoals && savingsGoals.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {savingsGoals.map((goal) => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100;
                        const SourceIcon = sourceIcons[goal.source] || Box;
                        return (
                            <Card key={goal.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-medium">{goal.name}</CardTitle>
                                    <SourceIcon className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(goal.currentAmount)}</div>
                                    <p className="text-xs text-muted-foreground">
                                        saved of {formatCurrency(goal.targetAmount)}
                                    </p>
                                    <Progress value={progress} className="mt-4" />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <AddSavingsContributionDialog goal={goal} onAddContribution={handleAddContribution}>
                                        <Button size="sm">Add Funds</Button>
                                    </AddSavingsContributionDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleGoalHistory(goal)}>
                                                <History className="mr-2 h-4 w-4" />
                                                History
                                            </DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the "{goal.name}" goal and all of its contributions. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)} className="bg-destructive hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>No Savings Goals Yet</CardTitle>
                        <CardDescription>Click "Add Goal" to start tracking your savings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Create goals for things like a new car, a vacation, or an emergency fund.
                        </p>
                    </CardContent>
                </Card>
            )}

            {selectedGoalForHistory && (
                <SavingsHistorySheet
                    goal={selectedGoalForHistory}
                    transactions={savingsTransactions?.filter(t => t.goalId === selectedGoalForHistory.id) ?? []}
                    open={!!selectedGoalForHistory}
                    onOpenChange={(open) => !open && setSelectedGoalForHistory(null)}
                />
            )}
        </div>
    );
}
