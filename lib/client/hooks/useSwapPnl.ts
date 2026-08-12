import { useQuery } from "@tanstack/react-query";
import type { ActiveWallet } from "@/types/wallet";
import type { SwapPnlSummary } from "@/types/portfolio";

export function useSwapPnl(wallet: ActiveWallet | null) {
  return useQuery({
    queryKey: ["swap-pnl", wallet?.ecosystem, wallet?.address],
    queryFn: async (): Promise<SwapPnlSummary> => {
      const res = await fetch(`/api/wallets/${wallet!.ecosystem}/${wallet!.address}/swaps`);
      if (!res.ok) throw new Error("Failed to load swap PnL");
      return res.json();
    },
    enabled: Boolean(wallet),
    staleTime: 30_000,
  });
}
