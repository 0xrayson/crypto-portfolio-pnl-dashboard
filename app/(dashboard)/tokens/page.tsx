"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useActiveWalletStore } from "@/lib/client/activeWalletStore";
import { useWalletBalances } from "@/lib/client/hooks/useWalletBalances";
import { usePriceHistory } from "@/lib/client/hooks/usePriceHistory";
import { TokenBalanceTable } from "@/components/tokens/TokenBalanceTable";
import { PriceLineChart } from "@/components/charts/PriceLineChart";
import { formatUsd } from "@/lib/format";
import { QueryError } from "@/components/dashboard/QueryError";
import type { TokenBalanceView } from "@/types/portfolio";

function TokenDrilldown({ token, onClose }: { token: TokenBalanceView; onClose: () => void }) {
  const { data: points, isLoading } = usePriceHistory(token.token.id, 30);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {token.token.name} ({token.token.symbol})
          </DialogTitle>
        </DialogHeader>
        <p className="text-2xl font-semibold tracking-tight">{formatUsd(token.usdPrice)}</p>
        {isLoading ? (
          <div className="bg-muted h-56 w-full animate-pulse rounded" />
        ) : points && points.length > 0 ? (
          <PriceLineChart points={points} />
        ) : (
          <p className="text-muted-foreground py-12 text-center text-sm">No price history available for this token.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function TokensPage() {
  const wallet = useActiveWalletStore((s) => s.wallet);
  const { data: balances, isLoading, error } = useWalletBalances(wallet);
  const [selected, setSelected] = useState<TokenBalanceView | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Token balances</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <QueryError message={`Couldn't load token balances: ${(error as Error).message}`} />
          ) : isLoading ? (
            <div className="bg-muted h-96 w-full animate-pulse rounded" />
          ) : (
            <TokenBalanceTable balances={balances ?? []} onSelectToken={setSelected} />
          )}
        </CardContent>
      </Card>

      {selected && <TokenDrilldown token={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
