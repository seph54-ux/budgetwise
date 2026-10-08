'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

export default function HelpPage() {
  const { state: sidebarState } = useSidebar();

  const helpTopics = [
    {
      id: 'step-1',
      title: '1. Setting Your Monthly Inflow',
      content:
        'Tap the "Set Income" button on the dashboard to register your primary paycheck or monthly salary. This forms the baseline for budget allocation.',
    },
    {
      id: 'step-2',
      title: '2. Configuring Category Limits',
      content:
        'Use "Manage Budget" to designate target allowances across core categories like Food, Utilities, Transport, and Shopping. The dashboard automatically calculates your progress.',
    },
    {
      id: 'step-3',
      title: '3. Logging Transactions Quickly',
      content:
        'Tap "Add Transaction" anytime you spend or receive funds. Pick the category, amount, and date. Your net balance and category dials refresh instantly.',
    },
    {
      id: 'step-4',
      title: '4. Tracking Savings Goals',
      content:
        'Navigate to the "Savings" tab to create target funds for emergencies, electronics, travel, or milestone purchases. Add contributions over time to watch your completion percentage rise.',
    },
    {
      id: 'step-5',
      title: '5. AI Financial Suggestions',
      content:
        'Need insight into trimming outflows? Click "AI Suggestions" on the dashboard to get tailored, automated recommendations based on your recent spending habits.',
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <SidebarTrigger showWhen="closed" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-headline text-foreground">
            Help & Guidelines
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quick reference guide on how to get the most out of BudgetWise
          </p>
        </div>
      </div>

      <Card className="p-6">
        <CardHeader className="p-0 pb-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl neu-pressed-sm flex items-center justify-center text-primary shrink-0">
              <BookOpen className="size-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold font-headline">Quick Start Walkthrough</CardTitle>
              <CardDescription>Mastering your personal finances in five simple steps</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-2">
          <Accordion type="single" collapsible defaultValue="step-1" className="w-full">
            {helpTopics.map((topic) => (
              <AccordionItem key={topic.id} value={topic.id}>
                <AccordionTrigger>{topic.title}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">{topic.content}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
