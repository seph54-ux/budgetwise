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
}

export function SetIncomeDialog({ currentIncome, onSetIncome }: SetIncomeDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wallet className="mr-2 h-4 w-4" />
          Set Income
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Your Monthly Income</DialogTitle>
          <DialogDescription>
            This will be used as the primary income source for your budget.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="income-amount" className="text-right">
              Amount
            </Label>
            <Input
              id="income-amount"
              type="number"
              value={income || ''}
              onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
