import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SwapPnlSummary } from "@/types/portfolio";

export function SwapPnlSummaryCard({ summary, isLoading }: { summary: SwapPnlSummary | undefined; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-medium">Realized swap PnL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading || !summary ? (
          <div className="bg-muted h-9 w-40 animate-pulse rounded" />
        ) : (
          <>
            <p
              className={cn(
                "text-3xl font-semibold tracking-tight",
                summary.totalRealizedPnlUsd >= 0 ? "text-emerald-500" : "text-red-500"
              )}
            >
              {summary.totalRealizedPnlUsd >= 0 ? "+" : ""}
              {formatUsd(summary.totalRealizedPnlUsd)}
            </p>
            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span>{summary.totalSwaps} swaps</span>
              <span className="text-emerald-500">{summary.winCount} wins</span>
              <span className="text-red-500">{summary.lossCount} losses</span>
              {summary.unknownCostBasisCount > 0 && (
                <span>
                  {summary.unknownCostBasisCount} with unknown cost basis (excluded from totals — matching buy
                  wasn&apos;t in the fetched history)
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
