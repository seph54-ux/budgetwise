'use client';

import * as React from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { categories } from '@/lib/data';

type SpendingChartProps = {
  transactions: Transaction[];
};

export function SpendingChart({ transactions }: SpendingChartProps) {
  const chartData = React.useMemo(() => {
    const expenseData: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const categoryInfo = categories.find((c) => c.id === t.category);
        if (categoryInfo) {
          expenseData[categoryInfo.name] = (expenseData[categoryInfo.name] || 0) + t.amount;
        }
      });

    return Object.keys(expenseData).map((name) => {
      const categoryInfo = categories.find((c) => c.name === name);
      return {
        name,
        value: expenseData[name],
        fill: categoryInfo?.color || 'hsl(var(--muted))',
        icon: categoryInfo?.icon,
      };
    });
  }, [transactions]);
  
  const chartConfig = React.useMemo(() => {
    const config: any = {};
    chartData.forEach(item => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
        icon: item.icon,
      };
    });
    return config;
  }, [chartData]);


  if (chartData.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>No expense data to display.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          A breakdown of your expenses for this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="name" hideLabel />}
            />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="30%" strokeWidth={2}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
