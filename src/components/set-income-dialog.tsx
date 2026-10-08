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
import { Label } from './ui/label';
import { Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SetIncomeDialogProps {
  currentIncome: number;
  onSetIncome: (income: number) => void;
  children?: React.ReactNode;
}

export function SetIncomeDialog({ currentIncome, onSetIncome, children }: SetIncomeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [income, setIncome] = React.useState(currentIncome);
  const { toast } = useToast();

  React.useEffect(() => {
    setIncome(currentIncome);
  }, [currentIncome]);

  const handleSave = () => {
    if (income > 0) {
      onSetIncome(income);
      toast({
        title: 'Success',
        description: 'Your monthly income has been updated.',
      });
      setOpen(false);
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid Amount',
            description: 'Please enter a positive number for your income.',
        });
    }
  };
  
  const trigger = children ? (
    <DialogTrigger asChild>{children}</DialogTrigger>
  ) : (
    <DialogTrigger asChild>
      <Button variant="outline" className="neu-btn gap-2">
        <Wallet className="size-4" />
        <span>Set Income</span>
      </Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="sm:max-w-md neu-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-headline">Monthly Base Income</DialogTitle>
          <DialogDescription>
            Specify your predictable base salary or recurrent monthly earnings.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="income-amount" className="text-xs font-semibold">
            Monthly Inflow Amount (₱)
          </Label>
          <Input
            id="income-amount"
            type="number"
            step="0.01"
            placeholder="50000.00"
            value={income || ''}
            onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
            className="text-lg font-mono font-semibold"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-black/5 dark:border-white/5">
          <Button variant="outline" onClick={() => setOpen(false)} className="neu-btn">
            Cancel
          </Button>
          <Button onClick={handleSave} className="neu-primary-btn">
            Update Income
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
