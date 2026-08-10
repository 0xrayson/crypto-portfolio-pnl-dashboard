import { useQuery } from "@tanstack/react-query";
import type { ActiveWallet } from "@/types/wallet";
import type { TokenBalanceView } from "@/types/portfolio";

export function useWalletBalances(wallet: ActiveWallet | null) {
  return useQuery({
    queryKey: ["balances", wallet?.ecosystem, wallet?.address],
    queryFn: async (): Promise<TokenBalanceView[]> => {
      const res = await fetch(`/api/wallets/${wallet!.ecosystem}/${wallet!.address}/balances`);
      if (!res.ok) throw new Error("Failed to load balances");
      const data = await res.json();
      return data.balances;
    },
    enabled: Boolean(wallet),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
