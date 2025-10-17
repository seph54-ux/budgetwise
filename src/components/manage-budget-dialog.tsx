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
      title: 'Success',
      description: 'Budget goals updated successfully.',
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
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Manage Budget
        </Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Budget Goals</DialogTitle>
          <DialogDescription>
            Add, edit, or remove your monthly budget goals for each category.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {localBudgets.map((budget) => (
            <div key={budget.id} className="flex items-center gap-2">
              <Label htmlFor={`budget-${budget.id}`} className="flex-1">
                {getCategoryName(budget.category)}
              </Label>
              <Input
                id={`budget-${budget.id}`}
                type="number"
                value={budget.amount}
                onChange={(e) =>
                  handleAmountChange(budget.id, parseFloat(e.target.value))
                }
                className="w-28"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveBudget(budget.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2 border-t pt-4">
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
              placeholder="Amount"
              value={newAmount || ''}
              onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
              className="w-28"
            />
            <Button variant="outline" size="icon" onClick={handleAddBudget}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
