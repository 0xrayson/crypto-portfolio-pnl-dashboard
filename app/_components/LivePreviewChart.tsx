"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatUsd } from "@/lib/format";

const sampleSeries = [
  { date: "Mon", value: 18420 },
  { date: "Tue", value: 18960 },
  { date: "Wed", value: 18710 },
  { date: "Thu", value: 19850 },
  { date: "Fri", value: 20330 },
  { date: "Sat", value: 20180 },
  { date: "Sun", value: 21540 },
];

const chartConfig: ChartConfig = {
  value: { label: "Portfolio value", color: "var(--color-emerald-500)" },
};

export function LivePreviewChart() {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <AreaChart data={sampleSeries} margin={{ left: 8, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillTrackPreview" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-emerald-500)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-emerald-500)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(v) => formatUsd(v, { compact: true })}
        />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatUsd(Number(value))} />} />
        <Area
          dataKey="value"
          type="monotone"
          fill="url(#fillTrackPreview)"
          stroke="var(--color-emerald-500)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
