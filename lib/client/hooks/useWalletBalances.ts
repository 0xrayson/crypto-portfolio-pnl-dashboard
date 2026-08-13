import { useQuery } from "@tanstack/react-query";
import { fetchJsonOrThrow } from "@/lib/client/fetchJson";
import type { ActiveWallet } from "@/types/wallet";
import type { TokenBalanceView } from "@/types/portfolio";

export function useWalletBalances(wallet: ActiveWallet | null) {
  return useQuery({
    queryKey: ["balances", wallet?.ecosystem, wallet?.address],
    queryFn: async (): Promise<TokenBalanceView[]> => {
      const data = await fetchJsonOrThrow<{ balances: TokenBalanceView[] }>(
        `/api/wallets/${wallet!.ecosystem}/${wallet!.address}/balances`
      );
      return data.balances;
    },
    enabled: Boolean(wallet),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
