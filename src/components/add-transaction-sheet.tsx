'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { categories } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'Name or merchant is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.date(),
  type: z.enum(['income', 'expense']),
});

type AddTransactionSheetProps = {
  children: React.ReactNode;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
};

export function AddTransactionSheet({
  children,
  onAddTransaction,
}: AddTransactionSheetProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      amount: 0,
      category: '',
      date: new Date(),
      type: 'expense',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTransaction({
      ...values,
      date: values.date.toISOString(),
    });
    toast({
      title: 'Transaction Logged',
      description: `Added "${values.name}" successfully.`,
    });
    form.reset();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-md w-full p-6">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-xl font-bold font-headline">Add Transaction</SheetTitle>
          <SheetDescription>
            Record a new cash inflow or outflow on your ledger.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Transaction Type Segmented Control */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold">Transaction Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 p-1 rounded-xl neu-pressed-sm gap-1">
                      <button
                        type="button"
                        onClick={() => field.onChange('expense')}
                        className={cn(
                          "py-2 text-xs font-bold rounded-lg transition-all",
                          field.value === 'expense'
                            ? "neu-card-sm text-rose-600 dark:text-rose-400 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange('income')}
                        className={cn(
                          "py-2 text-xs font-bold rounded-lg transition-all",
                          field.value === 'income'
                            ? "neu-card-sm text-emerald-600 dark:text-emerald-400 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Income
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Description / Merchant</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Grocery Mart, Coffee, Salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Amount (₱)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-semibold">Transaction Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3.5 text-left font-normal h-11 neu-btn rounded-xl',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4 gap-2 sm:gap-0">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="neu-btn">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" className="neu-primary-btn">
                Add Transaction
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
