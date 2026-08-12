import { useQuery } from "@tanstack/react-query";
import type { ActiveWallet } from "@/types/wallet";

export interface PortfolioPnl {
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
  source: "COMPUTED";
  hasUntrackedHoldings: boolean;
}

export function usePortfolioPnl(wallet: ActiveWallet | null) {
  return useQuery({
    queryKey: ["portfolio-pnl", wallet?.ecosystem, wallet?.address],
    queryFn: async (): Promise<PortfolioPnl> => {
      const res = await fetch(`/api/wallets/${wallet!.ecosystem}/${wallet!.address}/pnl`);
      if (!res.ok) throw new Error("Failed to load PnL");
      return res.json();
    },
    enabled: Boolean(wallet),
    staleTime: 30_000,
  });
}
