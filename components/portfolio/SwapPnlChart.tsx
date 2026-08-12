"use client";

import { Line, LineChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatUsd } from "@/lib/format";
import type { SwapView } from "@/types/portfolio";

const chartConfig: ChartConfig = {
  cumulativePnl: { label: "Cumulative realized PnL", color: "var(--chart-1)" },
};

/**
 * Cumulative realized PnL, oldest to newest, over whatever swaps the caller
 * passes in (already filtered to the selected window). Swaps with unknown
 * cost basis are skipped — same exclusion the summary totals use, so this
 * chart never implies a number the totals don't back up.
 */
export function SwapPnlChart({ swaps }: { swaps: SwapView[] }) {
  const ascending = [...swaps].reverse(); // swaps arrive most-recent-first
  const data = ascending
    .filter((s) => !s.costBasisUnknown)
    .reduce<{ date: string; cumulativePnl: number }[]>((acc, s) => {
      const previous = acc.at(-1)?.cumulativePnl ?? 0;
      return [
        ...acc,
        {
          date: new Date(s.blockTimestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          cumulativePnl: previous + (s.realizedPnlUsd ?? 0),
        },
      ];
    }, []);

  if (data.length === 0) {
    return <p className="text-muted-foreground py-12 text-center text-sm">No realized swaps with known cost basis in this period.</p>;
  }

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
        <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatUsd(Number(value))} />} />
        <Line dataKey="cumulativePnl" type="monotone" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}
