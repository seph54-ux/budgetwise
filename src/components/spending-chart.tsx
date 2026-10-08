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
      <Card className="h-full flex items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <CardTitle className="text-xl font-headline font-bold">Category Distribution</CardTitle>
          <div className="neu-pressed-sm rounded-xl p-8 text-sm text-muted-foreground">
            No expense data recorded yet this month.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-headline font-bold">Category Distribution</CardTitle>
        <CardDescription>
          A visual breakdown of your outflows for this month
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="p-3 rounded-2xl neu-pressed-sm">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[290px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="name" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius="40%"
                outerRadius="80%"
                paddingAngle={3}
                strokeWidth={1}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(255,255,255,0.4)" />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center text-xs font-medium"
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
