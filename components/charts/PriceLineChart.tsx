"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatUsd } from "@/lib/format";
import type { PricePoint } from "@/types/portfolio";

const chartConfig: ChartConfig = {
  price: { label: "Price", color: "var(--chart-2)" },
};

export function PriceLineChart({ points }: { points: PricePoint[] }) {
  const data = points.map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: p.price,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <LineChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={32} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={72}
          domain={["auto", "auto"]}
          tickFormatter={(v) => formatUsd(v, { compact: true })}
        />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatUsd(Number(value))} />} />
        <Line dataKey="price" type="monotone" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}
