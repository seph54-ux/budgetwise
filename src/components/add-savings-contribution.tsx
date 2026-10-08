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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useToast } from '@/hooks/use-toast';
import type { SavingsGoal } from '@/lib/types';

const formSchema = z.object({
  amount: z.coerce.number().positive('Contribution amount must be positive'),
});

interface AddSavingsContributionDialogProps {
  goal: SavingsGoal;
  onAddContribution: (contribution: { goalId: string; amount: number }) => void;
  children: React.ReactNode;
}

export function AddSavingsContributionDialog({ goal, onAddContribution, children }: AddSavingsContributionDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddContribution({
      goalId: goal.id,
      amount: values.amount,
    });
    toast({
      title: 'Contribution Added',
      description: `Allocated funds toward "${goal.name}".`,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md neu-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-headline">Add Funds to "{goal.name}"</DialogTitle>
          <DialogDescription>
            Specify how much you are allocating to this goal today.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-3">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Contribution Amount (₱)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="neu-btn">
                Cancel
              </Button>
              <Button type="submit" className="neu-primary-btn">
                Add Contribution
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
