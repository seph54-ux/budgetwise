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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, PlusCircle, Settings } from 'lucide-react';
import type { Budget } from '@/lib/types';
import { categories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface ManageBudgetDialogProps {
  budgets: Budget[];
  onSetBudgets: (budgets: Budget[]) => void;
  children?: React.ReactNode;
}

export function ManageBudgetDialog({
  budgets,
  onSetBudgets,
  children
}: ManageBudgetDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [localBudgets, setLocalBudgets] = React.useState(budgets);
  const [newCategory, setNewCategory] = React.useState('');
  const [newAmount, setNewAmount] = React.useState(0);

  const { toast } = useToast();

  React.useEffect(() => {
    setLocalBudgets(budgets);
  }, [budgets]);

  const handleAmountChange = (id: string, amount: number) => {
    setLocalBudgets(
      localBudgets.map((b) => (b.id === id ? { ...b, amount: amount || 0 } : b))
    );
  };

  const handleAddBudget = () => {
    if (!newCategory || newAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please select a category and enter a positive amount.',
      });
      return;
    }
    if (localBudgets.some(b => b.category === newCategory)) {
      toast({
        variant: 'destructive',
        title: 'Category already has a budget.',
        description: 'Please edit the existing budget for this category.',
      });
      return;
    }
    const newBudget: Budget = {
      id: crypto.randomUUID(),
      category: newCategory,
      amount: newAmount,
    };
    setLocalBudgets([...localBudgets, newBudget]);
    setNewCategory('');
    setNewAmount(0);
  };

  const handleRemoveBudget = (id: string) => {
    setLocalBudgets(localBudgets.filter((b) => b.id !== id));
  };

  const handleSaveChanges = () => {
    onSetBudgets(localBudgets);
    toast({
      title: 'Budget Goals Saved',
      description: 'Your category budget limits have been updated.',
    });
    setOpen(false);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  const availableCategories = categories.filter(c => !c.id.includes('salary') && !localBudgets.some(b => b.category === c.id));
  
  const trigger = children ? (
    <DialogTrigger asChild>{children}</DialogTrigger>
  ) : (
    <DialogTrigger asChild>
      <Button variant="outline" className="neu-btn gap-2">
        <Settings className="size-4" />
        <span>Manage Budget</span>
      </Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="sm:max-w-lg neu-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-headline">Manage Budget Goals</DialogTitle>
          <DialogDescription>
            Add, edit, or adjust your monthly spending thresholds for each category.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3 max-h-[55vh] overflow-y-auto pr-1">
          {localBudgets.map((budget) => (
            <div key={budget.id} className="flex items-center gap-3 p-3 rounded-xl neu-pressed-sm">
              <Label htmlFor={`budget-${budget.id}`} className="flex-1 font-semibold text-xs sm:text-sm">
                {getCategoryName(budget.category)}
              </Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-mono">₱</span>
                <Input
                  id={`budget-${budget.id}`}
                  type="number"
                  value={budget.amount}
                  onChange={(e) =>
                    handleAmountChange(budget.id, parseFloat(e.target.value))
                  }
                  className="w-28 text-right font-mono"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveBudget(budget.id)}
                className="size-8 rounded-lg neu-btn text-destructive hover:text-destructive shrink-0"
                title="Remove Goal"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}

          <div className="p-3.5 rounded-2xl neu-card-sm space-y-3 mt-4 border border-black/5 dark:border-white/5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add New Category Limit</span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Amount (₱)"
                value={newAmount || ''}
                onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                className="w-full sm:w-28 text-right font-mono"
              />
              <Button type="button" onClick={handleAddBudget} className="neu-btn shrink-0 text-xs px-3 gap-1.5">
                <PlusCircle className="size-3.5" />
                <span>Add</span>
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-black/5 dark:border-white/5">
          <Button variant="outline" onClick={() => setOpen(false)} className="neu-btn">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} className="neu-primary-btn">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
