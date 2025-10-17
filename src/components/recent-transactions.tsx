'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { categories } from '@/lib/data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { MoreHorizontal, Trash2 } from 'lucide-react';

type RecentTransactionsProps = {
  transactions: Transaction[];
  showAll?: boolean;
  onDeleteTransaction?: (transactionId: string) => void;
};

export function RecentTransactions({ transactions, showAll = false, onDeleteTransaction }: RecentTransactionsProps) {
  const getCategoryDetails = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };
  
  const sortedTransactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const transactionsToShow = showAll ? sortedTransactions : sortedTransactions.slice(0, 10);
  const cardTitle = showAll ? 'All Transactions' : 'Recent Transactions';
  const cardDescription = showAll
    ? 'A complete history of your income and expenses.'
    : 'Your 10 most recent transactions.';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>
          {cardDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {onDeleteTransaction && <TableHead className="w-[40px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsToShow.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={onDeleteTransaction ? 5 : 4} className="text-center text-muted-foreground">
                        No transactions yet. Add one to get started!
                    </TableCell>
                </TableRow>
              ) : (
                transactionsToShow.map((transaction) => {
                  const category = getCategoryDetails(transaction.category);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="font-medium">{transaction.name}</div>
                        <div className="text-sm text-muted-foreground sm:hidden">
                          {category?.name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {category && (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: category.color,
                              color: category.color,
                            }}
                          >
                            {category.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right',
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        )}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                       {onDeleteTransaction && (
                        <TableCell>
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the transaction "{transaction.name}". This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteTransaction(transaction.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
