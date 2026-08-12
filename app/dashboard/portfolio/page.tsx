"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveWalletStore } from "@/lib/client/activeWalletStore";
import { useSwapPnl } from "@/lib/client/hooks/useSwapPnl";
import { SwapPnlSummaryCard } from "@/components/portfolio/SwapPnlSummaryCard";
import { SwapPnlWindows } from "@/components/portfolio/SwapPnlWindows";
import { SwapPnlChart } from "@/components/portfolio/SwapPnlChart";
import { SwapTable } from "@/components/portfolio/SwapTable";
import { QueryError } from "@/components/dashboard/QueryError";
import type { SwapPnlWindowLabel } from "@/types/portfolio";

export default function PortfolioPage() {
  const wallet = useActiveWalletStore((s) => s.wallet);
  const { data: summary, isLoading, error } = useSwapPnl(wallet);
  const [selectedWindow, setSelectedWindow] = useState<SwapPnlWindowLabel>("1M");
  // Captured once per mount rather than read fresh in useMemo, which React's
  // purity rules treat as an impure render (Date.now() can differ call to call).
  const [now] = useState(() => Date.now());

  const selectedDays = summary?.windows.find((w) => w.label === selectedWindow)?.days ?? 30;

  const swapsInWindow = useMemo(() => {
    if (!summary) return [];
    const cutoff = now - selectedDays * 24 * 60 * 60 * 1000;
    return summary.swaps.filter((s) => new Date(s.blockTimestamp).getTime() >= cutoff);
  }, [summary, selectedDays, now]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      {error ? (
        <QueryError message={`Couldn't load swap PnL: ${(error as Error).message}`} />
      ) : (
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 flex flex-col gap-6 duration-500">
          <SwapPnlSummaryCard summary={summary} isLoading={isLoading} />
          <SwapPnlWindows
            windows={summary?.windows}
            isLoading={isLoading}
            selected={selectedWindow}
            onSelect={setSelectedWindow}
          />
        </div>
      )}

      <Card className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-100 duration-500">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Realized PnL — {selectedWindow}</CardTitle>
        </CardHeader>
        <CardContent>
          {!error &&
            (isLoading ? (
              <div className="bg-muted h-56 w-full animate-pulse rounded" />
            ) : (
              <div className="motion-safe:animate-in motion-safe:fade-in duration-300">
                <SwapPnlChart swaps={swapsInWindow} />
              </div>
            ))}
        </CardContent>
      </Card>

      <Card className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-150 duration-500">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Swap history — {selectedWindow}</CardTitle>
        </CardHeader>
        <CardContent>
          {!error &&
            (isLoading ? (
              <div className="bg-muted h-96 w-full animate-pulse rounded" />
            ) : (
              <div className="motion-safe:animate-in motion-safe:fade-in duration-300">
                <SwapTable swaps={swapsInWindow} />
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
