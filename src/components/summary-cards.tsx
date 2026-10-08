import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

type SummaryCardsProps = {
  income: number;
  expenses: number;
  balance: number;
};

export function SummaryCards({ income, expenses, balance }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expenses) / income) * 100)) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Balance Card */}
      <div className="neu-card p-5 transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Net Balance</span>
          <div className="size-10 rounded-xl neu-pressed-sm flex items-center justify-center text-primary">
            <Wallet className="size-5" />
          </div>
        </div>
        <div>
          <div className={cn(
            "text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight",
            balance >= 0 ? "text-foreground" : "text-destructive"
          )}>
            {formatCurrency(balance)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <span className={cn(
              "font-bold",
              balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {savingsRate}%
            </span>
            <span>saved from monthly income</span>
          </div>
        </div>
      </div>

      {/* Total Income Card */}
      <div className="neu-card p-5 transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Income</span>
          <div className="size-10 rounded-xl neu-pressed-sm flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="size-5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight text-foreground">
            {formatCurrency(income)}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Total inflows recorded this month
          </p>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="neu-card p-5 transition-all duration-200 hover:-translate-y-0.5 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Expenses</span>
          <div className="size-10 rounded-xl neu-pressed-sm flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ArrowDownRight className="size-5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight text-foreground">
            {formatCurrency(expenses)}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Total outflows across all categories
          </p>
        </div>
      </div>
    </div>
  );
}
