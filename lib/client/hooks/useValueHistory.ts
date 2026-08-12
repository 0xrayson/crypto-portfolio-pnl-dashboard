import { useQuery } from "@tanstack/react-query";
import type { ActiveWallet } from "@/types/wallet";

export interface ValueHistoryPoint {
  date: string;
  totalUsdValue: number;
}

export function useValueHistory(wallet: ActiveWallet | null, days: 7 | 30 | 90) {
  return useQuery({
    queryKey: ["value-history", wallet?.ecosystem, wallet?.address, days],
    queryFn: async (): Promise<ValueHistoryPoint[]> => {
      const res = await fetch(`/api/wallets/${wallet!.ecosystem}/${wallet!.address}/value-history?days=${days}`);
      if (!res.ok) throw new Error("Failed to load portfolio value history");
      const data = await res.json();
      return data.points;
    },
    enabled: Boolean(wallet),
    staleTime: 60_000,
  });
}
