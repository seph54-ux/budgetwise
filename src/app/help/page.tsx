'use client';

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

export default function HelpPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Help & Support
        </h2>
        <p className="text-muted-foreground">
          Find answers to common questions about using BudgetWise.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to Use BudgetWise</CardTitle>
          <CardDescription>
            A quick guide to get you started on managing your finances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Step 1: Set Your Income</AccordionTrigger>
              <AccordionContent>
                Click the <strong>Set Income</strong> button on the dashboard to
                enter your total monthly income. This is the starting point for
                your budget.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Step 2: Manage Your Budget</AccordionTrigger>
              <AccordionContent>
                Use the <strong>Manage Budget</strong> button to create spending
                goals for different categories like Food, Transport, and
                Shopping. This helps you track where your money should be going.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Step 3: Add Transactions</AccordionTrigger>
              <AccordionContent>
                As you spend money or earn extra income, click the{' '}
                <strong>Add Transaction</strong> button. Log each expense or
                income to keep your budget up to date.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Step 4: View Your Dashboard</AccordionTrigger>
              <AccordionContent>
                Your dashboard gives you a complete overview. See your total
                income, expenses, and remaining balance at a glance. The charts
                show your spending habits and how well you're sticking to your
                budget goals.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>AI-Powered Suggestions</AccordionTrigger>
              <AccordionContent>
                Not sure where to save? Click the <strong>AI Suggestions</strong>{' '}
                button. Our AI will analyze your spending and provide personalized
                tips to help you save money and reach your goals faster.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
