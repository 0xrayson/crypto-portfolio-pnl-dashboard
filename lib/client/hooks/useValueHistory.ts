import { useQuery } from "@tanstack/react-query";
import { fetchJsonOrThrow } from "@/lib/client/fetchJson";
import type { ActiveWallet } from "@/types/wallet";

export interface ValueHistoryPoint {
  date: string;
  totalUsdValue: number;
}

export function useValueHistory(wallet: ActiveWallet | null, days: 7 | 30 | 90) {
  return useQuery({
    queryKey: ["value-history", wallet?.ecosystem, wallet?.address, days],
    queryFn: async (): Promise<ValueHistoryPoint[]> => {
      const data = await fetchJsonOrThrow<{ points: ValueHistoryPoint[] }>(
        `/api/wallets/${wallet!.ecosystem}/${wallet!.address}/value-history?days=${days}`
      );
      return data.points;
    },
    enabled: Boolean(wallet),
    staleTime: 60_000,
  });
}
