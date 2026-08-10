"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActiveWalletStore } from "@/lib/client/activeWalletStore";
import { useWalletBalances } from "@/lib/client/hooks/useWalletBalances";
import { useSnapshots } from "@/lib/client/hooks/useSnapshots";
import { useTransactions } from "@/lib/client/hooks/useTransactions";
import { PortfolioValueCard } from "@/components/dashboard/PortfolioValueCard";
import { PnlSummaryCard } from "@/components/dashboard/PnlSummaryCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { TokenBalanceTable } from "@/components/tokens/TokenBalanceTable";
import { PortfolioValueChart } from "@/components/charts/PortfolioValueChart";
import { AllocationPieChart } from "@/components/charts/AllocationPieChart";
import { QueryError } from "@/components/dashboard/QueryError";

export default function OverviewPage() {
  const wallet = useActiveWalletStore((s) => s.wallet);
  const { data: balances, isLoading: balancesLoading, error: balancesError } = useWalletBalances(wallet);
  const { data: snapshots, isLoading: snapshotsLoading } = useSnapshots(wallet);
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useTransactions(wallet);

  const totalValue = (balances ?? []).reduce((sum, b) => sum + b.usdValue, 0);
  const latestSnapshot = snapshots?.[snapshots.length - 1];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      {balancesError && (
        <QueryError message={`Couldn't load live balances: ${(balancesError as Error).message}`} />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <PortfolioValueCard value={totalValue} isLoading={balancesLoading} />
        <PnlSummaryCard
          realizedPnlUsd={latestSnapshot?.realizedPnlUsd ?? 0}
          unrealizedPnlUsd={latestSnapshot?.unrealizedPnlUsd ?? 0}
          source={latestSnapshot?.source ?? "SEEDED_MOCK"}
          isLoading={snapshotsLoading}
        />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Portfolio value over time</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            Simulated history
          </Badge>
        </CardHeader>
        <CardContent>
          {snapshotsLoading ? (
            <div className="bg-muted h-64 w-full animate-pulse rounded" />
          ) : (
            <PortfolioValueChart data={snapshots ?? []} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Token allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <div className="bg-muted mx-auto h-64 w-64 animate-pulse rounded-full" />
            ) : (
              <AllocationPieChart balances={balances ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Top holdings</CardTitle>
            <Link href="/tokens" className="text-muted-foreground text-xs hover:text-foreground">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <div className="bg-muted h-64 w-full animate-pulse rounded" />
            ) : (
              <TokenBalanceTable balances={(balances ?? []).slice(0, 5)} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
          <Link href="/transactions" className="text-muted-foreground text-xs hover:text-foreground">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {transactionsError ? (
            <QueryError message={`Couldn't load activity: ${(transactionsError as Error).message}`} />
          ) : transactionsLoading ? (
            <div className="bg-muted h-40 w-full animate-pulse rounded" />
          ) : (
            <ActivityFeed transactions={(transactions ?? []).slice(0, 5)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
