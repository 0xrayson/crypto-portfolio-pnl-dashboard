import { useQuery } from "@tanstack/react-query";
import { fetchJsonOrThrow } from "@/lib/client/fetchJson";
import type { ActiveWallet } from "@/types/wallet";
import type { TransactionView } from "@/types/portfolio";

export function useTransactions(wallet: ActiveWallet | null) {
  return useQuery({
    queryKey: ["transactions", wallet?.ecosystem, wallet?.address],
    queryFn: async (): Promise<TransactionView[]> => {
      const data = await fetchJsonOrThrow<{ transactions: TransactionView[] }>(
        `/api/wallets/${wallet!.ecosystem}/${wallet!.address}/transactions`
      );
      return data.transactions;
    },
    enabled: Boolean(wallet),
    staleTime: 30_000,
  });
}
