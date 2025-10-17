'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your application settings here. This is a placeholder page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>More settings will be available here in the future.</p>
        </CardContent>
      </Card>
    </div>
  );
}
