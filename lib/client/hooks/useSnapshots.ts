import { useQuery } from "@tanstack/react-query";
import type { ActiveWallet } from "@/types/wallet";
import type { PortfolioSnapshotView } from "@/types/portfolio";

export function useSnapshots(wallet: ActiveWallet | null) {
  return useQuery({
    queryKey: ["snapshots", wallet?.ecosystem, wallet?.address],
    queryFn: async (): Promise<PortfolioSnapshotView[]> => {
      const res = await fetch(`/api/wallets/${wallet!.ecosystem}/${wallet!.address}/snapshots`);
      if (!res.ok) throw new Error("Failed to load portfolio history");
      const data = await res.json();
      return data.snapshots;
    },
    enabled: Boolean(wallet),
    staleTime: 60_000,
  });
}
