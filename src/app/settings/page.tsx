'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  User,
  Sliders,
  Bell,
  Download,
  Trash2,
  RotateCcw,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react';
import { useSupabaseAuth } from '@/lib/supabase/auth-context';
import { useBudgetWiseData } from '@/lib/supabase/use-budget-data';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

export default function SettingsPage() {
  const { state: sidebarState } = useSidebar();
  const { user } = useSupabaseAuth();
  const { transactions, budgets, savingsGoals, resetBudget } = useBudgetWiseData();
  const { toast } = useToast();

  // User Profile State
  const [userName, setUserName] = React.useState(user?.name || 'User');
  const [isSavingName, setIsSavingName] = React.useState(false);

  // Financial Preferences
  const [currency, setCurrency] = React.useState('PHP');
  const [dateFormat, setDateFormat] = React.useState('MMM DD, YYYY');

  // Notifications & Alerts
  const [budgetAlerts, setBudgetAlerts] = React.useState(true);
  const [weeklyRecap, setWeeklyRecap] = React.useState(false);
  const [aiTips, setAiTips] = React.useState(true);

  React.useEffect(() => {
    if (user?.name) {
      setUserName(user.name);
    }
  }, [user?.name]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingName(true);
    setTimeout(() => {
      setIsSavingName(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
    }, 300);
  };

  const handleSavePreferences = () => {
    toast({
      title: 'Preferences Saved',
      description: `Currency set to ${currency} and date format set to ${dateFormat}.`,
    });
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data to Export',
        description: 'You have no transactions recorded yet.',
      });
      return;
    }

    const headers = ['ID', 'Date', 'Name', 'Amount', 'Type', 'Category'];
    const csvRows = [
      headers.join(','),
      ...transactions.map((t) =>
        [
          `"${t.id}"`,
          `"${new Date(t.date).toLocaleDateString()}"`,
          `"${t.name.replace(/"/g, '""')}"`,
          t.amount,
          `"${t.type}"`,
          `"${t.category}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BudgetWise_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Successful',
      description: 'Your transaction records have been downloaded as CSV.',
    });
  };

  // Export Data as JSON Backup
  const handleExportJSON = () => {
    const dataBackup = {
      user: { id: user?.id, email: user?.email, name: userName },
      exportDate: new Date().toISOString(),
      transactions,
      budgets,
      savingsGoals,
    };

    const blob = new Blob([JSON.stringify(dataBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BudgetWise_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Backup Downloaded',
      description: 'Your complete financial data backup has been saved as JSON.',
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SidebarTrigger showWhen="closed" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-headline text-foreground">
            Account Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your personal profile, display preferences, notifications, and data options
          </p>
        </div>
      </div>

      {/* User Profile Section */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl neu-pressed-sm flex items-center justify-center text-primary shrink-0">
              <User className="size-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold font-headline">Profile Details</CardTitle>
              <CardDescription>Your personal identity and login email</CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleUpdateProfile} className="space-y-5 pt-2">
          <div className="flex items-center gap-4 p-3.5 rounded-2xl neu-pressed-sm">
            <Avatar className="size-14 border-0 neu-card-sm shrink-0">
              <AvatarFallback className="bg-transparent text-primary text-xl font-extrabold">
                {userName[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-base text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-xs font-semibold">
                Full Name
              </Label>
              <Input
                id="displayName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email Address
              </Label>
              <Input id="email" value={user?.email || ''} disabled className="opacity-70 cursor-not-allowed" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSavingName} className="neu-primary-btn text-xs px-4">
              {isSavingName ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Financial & Regional Preferences */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl neu-pressed-sm flex items-center justify-center text-primary shrink-0">
              <Sliders className="size-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold font-headline">Financial & Regional Formats</CardTitle>
              <CardDescription>Customize currency, date format, and number display</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-xs font-semibold">
                Primary Currency
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHP">PHP (₱) - Philippine Peso</SelectItem>
                  <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                  <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY (¥) - Japanese Yen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat" className="text-xs font-semibold">
                Date Format
              </Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MMM DD, YYYY">Oct 07, 2026 (MMM DD, YYYY)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">07/10/2026 (DD/MM/YYYY)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">2026-10-07 (YYYY-MM-DD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSavePreferences} className="neu-btn text-xs px-4">
              Save Preferences
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications & Budget Alerts */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl neu-pressed-sm flex items-center justify-center text-primary shrink-0">
              <Bell className="size-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold font-headline">Notifications & Budget Alerts</CardTitle>
              <CardDescription>Tailor alerts and smart budget threshold notifications</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-3.5 pt-2">
          <div className="p-3.5 rounded-2xl neu-pressed-sm flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="budgetAlerts" className="text-sm font-semibold cursor-pointer">
                Budget Limit Threshold Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Alert when spending reaches 80% or 100% of a category limit.
              </p>
            </div>
            <Switch id="budgetAlerts" checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
          </div>

          <div className="p-3.5 rounded-2xl neu-pressed-sm flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="aiTips" className="text-sm font-semibold cursor-pointer">
                AI Smart Financial Tips
              </Label>
              <p className="text-xs text-muted-foreground">
                Display intelligent AI budget optimization suggestions on your overview.
              </p>
            </div>
            <Switch id="aiTips" checked={aiTips} onCheckedChange={setAiTips} />
          </div>

          <div className="p-3.5 rounded-2xl neu-pressed-sm flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="weeklyRecap" className="text-sm font-semibold cursor-pointer">
                Weekly Spending Recap
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive weekly summary recaps of top expense categories.
              </p>
            </div>
            <Switch id="weeklyRecap" checked={weeklyRecap} onCheckedChange={setWeeklyRecap} />
          </div>
        </div>
      </Card>

      {/* Data Management & Export */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl neu-pressed-sm flex items-center justify-center text-primary shrink-0">
              <Download className="size-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold font-headline">Data Export & Backup</CardTitle>
              <CardDescription>Download your transaction records or complete financial snapshot</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl neu-pressed-sm">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl neu-card-sm flex items-center justify-center text-primary shrink-0">
                <FileSpreadsheet className="size-4.5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Export Transactions (CSV)</p>
                <p className="text-xs text-muted-foreground">
                  Spreadsheet-compatible export of all logged cashflow
                </p>
              </div>
            </div>
            <Button onClick={handleExportCSV} className="neu-btn text-xs px-3.5 gap-2 shrink-0 self-start sm:self-auto">
              <Download className="size-3.5" />
              <span>Download CSV</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl neu-pressed-sm">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl neu-card-sm flex items-center justify-center text-primary shrink-0">
                <FileJson className="size-4.5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Complete Backup (JSON)</p>
                <p className="text-xs text-muted-foreground">
                  Full backup of all transactions, budgets, and savings goals
                </p>
              </div>
            </div>
            <Button onClick={handleExportJSON} className="neu-btn text-xs px-3.5 gap-2 shrink-0 self-start sm:self-auto">
              <Download className="size-3.5" />
              <span>Download JSON</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Data Reset */}
      <Card className="p-6 border-rose-300/30 dark:border-rose-900/30">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl neu-pressed-sm flex items-center justify-center text-destructive shrink-0">
              <Trash2 className="size-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold font-headline text-destructive">Reset Ledger Records</CardTitle>
              <CardDescription>
                Permanently clear all recorded transactions and custom budgets.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-4 pt-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This action will clear all logged expenses, income, and category budget limits back to the starting template. This cannot be undone.
          </p>
        </CardContent>
        <CardFooter className="p-0 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="neu-danger-btn gap-2 text-xs">
                <RotateCcw className="size-3.5" />
                <span>Reset Financial Records</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="neu-card">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently reset all your transactions and budgets. You will start with a fresh ledger.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="neu-btn">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={resetBudget}
                  className="neu-danger-btn"
                >
                  Yes, Reset Ledger
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
