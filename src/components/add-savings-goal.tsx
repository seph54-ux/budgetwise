'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useToast } from '@/hooks/use-toast';
import type { SavingsGoal } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.coerce.number().positive('Target amount must be a positive number'),
  source: z.enum(['bank', 'digital-wallet', 'cash', 'other'], {
    required_error: 'Please select a savings source.',
  }),
});

interface AddSavingsGoalDialogProps {
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'userId'>) => void;
  children: React.ReactNode;
}

export function AddSavingsGoalDialog({ onAddGoal, children }: AddSavingsGoalDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddGoal(values);
    toast({
      title: 'Savings Goal Created',
      description: `Added "${values.name}" target.`,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md neu-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-headline">Create Savings Goal</DialogTitle>
          <DialogDescription>
            Designate a target fund for milestones, emergencies, or purchases.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Emergency Cushion, Japan Trip" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Target Amount (₱)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="50000.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Storage Channel</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Where are you saving?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank">High-Yield / Bank Account</SelectItem>
                      <SelectItem value="digital-wallet">Digital Wallet (GCash/Maya)</SelectItem>
                      <SelectItem value="cash">Physical Cash Vault</SelectItem>
                      <SelectItem value="other">Other Investment / Fund</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="neu-btn">
                Cancel
              </Button>
              <Button type="submit" className="neu-primary-btn">
                Create Goal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
