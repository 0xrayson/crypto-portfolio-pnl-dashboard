"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveWalletStore } from "@/lib/client/activeWalletStore";
import { useWalletBalances } from "@/lib/client/hooks/useWalletBalances";
import { usePortfolioPnl } from "@/lib/client/hooks/usePortfolioPnl";
import { useValueHistory } from "@/lib/client/hooks/useValueHistory";
import { useTransactions } from "@/lib/client/hooks/useTransactions";
import { PortfolioValueCard } from "@/components/dashboard/PortfolioValueCard";
import { PnlSummaryCard } from "@/components/dashboard/PnlSummaryCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { TokenBalanceTable } from "@/components/tokens/TokenBalanceTable";
import { ValueHistoryChart } from "@/components/charts/ValueHistoryChart";
import { AllocationPieChart } from "@/components/charts/AllocationPieChart";
import { QueryError } from "@/components/dashboard/QueryError";

export default function OverviewPage() {
  const wallet = useActiveWalletStore((s) => s.wallet);
  const { data: balances, isLoading: balancesLoading, error: balancesError } = useWalletBalances(wallet);
  const { data: pnl, isLoading: pnlLoading } = usePortfolioPnl(wallet);
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useTransactions(wallet);
  const [historyRange, setHistoryRange] = useState<7 | 30 | 90>(30);
  const { data: history, isLoading: historyLoading } = useValueHistory(wallet, historyRange);

  const totalValue = (balances ?? []).reduce((sum, b) => sum + b.usdValue, 0);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      {balancesError && (
        <QueryError message={`Couldn't load live balances: ${(balancesError as Error).message}`} />
      )}
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 grid gap-4 duration-500 sm:grid-cols-2">
        <PortfolioValueCard value={totalValue} isLoading={balancesLoading} />
        <PnlSummaryCard
          realizedPnlUsd={pnl?.realizedPnlUsd ?? 0}
          unrealizedPnlUsd={pnl?.unrealizedPnlUsd ?? 0}
          source={pnl?.source ?? "COMPUTED"}
          isLoading={pnlLoading}
          hasUntrackedHoldings={pnl?.hasUntrackedHoldings}
        />
      </div>

      <Card className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-75 duration-500">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Portfolio value over time</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="bg-muted h-64 w-full animate-pulse rounded" />
          ) : (
            <div className="motion-safe:animate-in motion-safe:fade-in duration-300">
              <ValueHistoryChart points={history ?? []} range={historyRange} onRangeChange={setHistoryRange} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-150 grid gap-6 duration-500 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Token allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <div className="bg-muted mx-auto h-64 w-64 animate-pulse rounded-full" />
            ) : (
              <div className="motion-safe:animate-in motion-safe:fade-in duration-300">
                <AllocationPieChart balances={balances ?? []} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Top holdings</CardTitle>
            <Link href="/dashboard/tokens" className="text-muted-foreground text-xs hover:text-foreground">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <div className="bg-muted h-64 w-full animate-pulse rounded" />
            ) : (
              <div className="motion-safe:animate-in motion-safe:fade-in duration-300">
                <TokenBalanceTable balances={(balances ?? []).slice(0, 5)} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-200 duration-500">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
          <Link href="/dashboard/transactions" className="text-muted-foreground text-xs hover:text-foreground">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {transactionsError ? (
            <QueryError message={`Couldn't load activity: ${(transactionsError as Error).message}`} />
          ) : transactionsLoading ? (
            <div className="bg-muted h-40 w-full animate-pulse rounded" />
          ) : (
            <div className="motion-safe:animate-in motion-safe:fade-in duration-300">
              <ActivityFeed transactions={(transactions ?? []).slice(0, 5)} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
