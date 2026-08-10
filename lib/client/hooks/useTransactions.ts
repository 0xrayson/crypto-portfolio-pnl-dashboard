import { useQuery } from "@tanstack/react-query";
import type { ActiveWallet } from "@/types/wallet";
import type { TransactionView } from "@/types/portfolio";

export function useTransactions(wallet: ActiveWallet | null) {
  return useQuery({
    queryKey: ["transactions", wallet?.ecosystem, wallet?.address],
    queryFn: async (): Promise<TransactionView[]> => {
      const res = await fetch(`/api/wallets/${wallet!.ecosystem}/${wallet!.address}/transactions`);
      if (!res.ok) throw new Error("Failed to load transactions");
      const data = await res.json();
      return data.transactions;
    },
    enabled: Boolean(wallet),
    staleTime: 30_000,
  });
}
