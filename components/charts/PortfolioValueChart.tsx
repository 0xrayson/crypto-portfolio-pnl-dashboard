"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatUsd } from "@/lib/format";
import type { PortfolioSnapshotView } from "@/types/portfolio";

const chartConfig: ChartConfig = {
  totalUsdValue: { label: "Portfolio value", color: "var(--chart-1)" },
};

export function PortfolioValueChart({ data }: { data: PortfolioSnapshotView[] }) {
  const points = data.map((d) => ({
    date: new Date(d.capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    totalUsdValue: d.totalUsdValue,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <AreaChart data={points} margin={{ left: 8, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={32} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(v) => formatUsd(v, { compact: true })}
        />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatUsd(Number(value))} />} />
        <Area
          dataKey="totalUsdValue"
          type="monotone"
          fill="url(#fillValue)"
          stroke="var(--chart-1)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
