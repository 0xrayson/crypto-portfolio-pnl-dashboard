import { useQuery } from "@tanstack/react-query";
import { fetchJsonOrThrow } from "@/lib/client/fetchJson";
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
    queryFn: async (): Promise<PortfolioPnl> =>
      fetchJsonOrThrow<PortfolioPnl>(`/api/wallets/${wallet!.ecosystem}/${wallet!.address}/pnl`),
    enabled: Boolean(wallet),
    staleTime: 30_000,
  });
}
