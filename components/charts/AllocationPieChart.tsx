"use client";

import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatUsd } from "@/lib/format";
import type { TokenBalanceView } from "@/types/portfolio";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function AllocationPieChart({ balances }: { balances: TokenBalanceView[] }) {
  const total = balances.reduce((sum, b) => sum + b.usdValue, 0);
  const top = balances.slice(0, 6);
  const rest = balances.slice(6);
  const restValue = rest.reduce((sum, b) => sum + b.usdValue, 0);

  const slices = [
    ...top.map((b) => ({ name: b.token.symbol, value: b.usdValue })),
    ...(restValue > 0 ? [{ name: "Other", value: restValue }] : []),
  ];

  const chartConfig: ChartConfig = Object.fromEntries(
    slices.map((s, i) => [s.name, { label: s.name, color: COLORS[i % COLORS.length] }])
  );

  if (total === 0) {
    return <p className="text-muted-foreground py-12 text-center text-sm">No balances to allocate yet.</p>;
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-64">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatUsd(Number(value))}
              nameKey="name"
            />
          }
        />
        <Pie data={slices} dataKey="value" nameKey="name" innerRadius={56} outerRadius={90} strokeWidth={2}>
          {slices.map((s, i) => (
            <Cell key={s.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
