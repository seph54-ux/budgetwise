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
  Check,
  RotateCcw,
  Sparkles,
  Shield,
  Palette,
  CreditCard,
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

  // Appearance
  const [themeMode, setThemeMode] = React.useState('system');
  const [compactTables, setCompactTables] = React.useState(false);

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
        description: 'Your profile information has been saved.',
      });
    }, 400);
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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <SidebarTrigger
          className={cn(
            'data-[state=expanded]:hidden',
            sidebarState === 'collapsed' && 'block'
          )}
        />
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
            Account Settings
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage your profile, display preferences, notifications, and data options.
          </p>
        </div>
      </div>

      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Profile Details</CardTitle>
          </div>
          <CardDescription>
            Your personal account information and login details.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 pb-2">
              <Avatar className="h-16 w-16 border">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {userName[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-semibold text-base">{userName}</p>
                <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                  id="displayName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={user?.email || ''} disabled className="bg-muted/50" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-end">
            <Button type="submit" disabled={isSavingName} size="sm">
              {isSavingName ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Financial & Regional Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <CardTitle>Financial & Regional Preferences</CardTitle>
          </div>
          <CardDescription>
            Customize your currency, display units, and regional formats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Primary Currency</Label>
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
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MMM DD, YYYY">Oct 06, 2026 (MMM DD, YYYY)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">06/10/2026 (DD/MM/YYYY)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">2026-10-06 (YYYY-MM-DD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-end">
          <Button size="sm" variant="outline" onClick={handleSavePreferences}>
            Save Preferences
          </Button>
        </CardFooter>
      </Card>

      {/* Notifications & Smart Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications & Budget Alerts</CardTitle>
          </div>
          <CardDescription>
            Choose how you would like to be notified about budget progress and insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="budgetAlerts" className="text-base font-medium">
                Budget Limit Threshold Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Alert when spending reaches 80% or 100% of a category budget limit.
              </p>
            </div>
            <Switch id="budgetAlerts" checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
          </div>

          <div className="flex items-center justify-between space-x-2 border-t pt-3">
            <div className="space-y-0.5">
              <Label htmlFor="aiTips" className="text-base font-medium">
                AI Smart Financial Tips
              </Label>
              <p className="text-xs text-muted-foreground">
                Display intelligent AI budget optimization suggestions on your dashboard.
              </p>
            </div>
            <Switch id="aiTips" checked={aiTips} onCheckedChange={setAiTips} />
          </div>

          <div className="flex items-center justify-between space-x-2 border-t pt-3">
            <div className="space-y-0.5">
              <Label htmlFor="weeklyRecap" className="text-base font-medium">
                Weekly Spending Recap
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive weekly summary summaries of top expense categories.
              </p>
            </div>
            <Switch id="weeklyRecap" checked={weeklyRecap} onCheckedChange={setWeeklyRecap} />
          </div>
        </CardContent>
      </Card>

      {/* Data Management & Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle>Data Export & Backup</CardTitle>
          </div>
          <CardDescription>
            Download your transaction history or create a complete backup of your records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-muted/40 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Export Transactions (CSV)</p>
              <p className="text-xs text-muted-foreground">
                Download a spreadsheet-compatible file containing all your expenses and income.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-2 shrink-0">
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-muted/40 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Backup Financial Data (JSON)</p>
              <p className="text-xs text-muted-foreground">
                Export all your budgets, transactions, and savings goals in a single file.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportJSON} className="gap-2 shrink-0">
              <Download className="h-4 w-4" /> Download JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Data Reset */}
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Reset Account Records</CardTitle>
          </div>
          <CardDescription>
            Permanently clear all recorded transactions and custom budgets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            This action will remove all logged expenses, income, and category budget limits. This action cannot be undone.
          </p>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" /> Reset Financial Records
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your transactions and budgets. You will start with a fresh blank ledger.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={resetBudget}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
