"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ValueHistoryPoint } from "@/lib/client/hooks/useValueHistory";

const chartConfig: ChartConfig = {
  totalUsdValue: { label: "Portfolio value", color: "var(--chart-1)" },
};

const RANGES: { days: 7 | 30 | 90; label: string }[] = [
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
];

interface Props {
  points: ValueHistoryPoint[];
  range: 7 | 30 | 90;
  onRangeChange: (days: 7 | 30 | 90) => void;
}

export function ValueHistoryChart({ points, range, onRangeChange }: Props) {
  const data = points.map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    totalUsdValue: p.totalUsdValue,
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <div className="border-border bg-muted inline-flex rounded-lg border p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => onRangeChange(r.days)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                range === r.days ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">Not enough transaction history to chart this period.</p>
      ) : (
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillValueHistory" x1="0" y1="0" x2="0" y2="1">
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
              fill="url(#fillValueHistory)"
              stroke="var(--chart-1)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}
