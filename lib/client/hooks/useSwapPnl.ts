import { useQuery } from "@tanstack/react-query";
import { fetchJsonOrThrow } from "@/lib/client/fetchJson";
import type { ActiveWallet } from "@/types/wallet";
import type { SwapPnlSummary } from "@/types/portfolio";

export function useSwapPnl(wallet: ActiveWallet | null) {
  return useQuery({
    queryKey: ["swap-pnl", wallet?.ecosystem, wallet?.address],
    queryFn: async (): Promise<SwapPnlSummary> =>
      fetchJsonOrThrow<SwapPnlSummary>(`/api/wallets/${wallet!.ecosystem}/${wallet!.address}/swaps`),
    enabled: Boolean(wallet),
    staleTime: 30_000,
  });
}
