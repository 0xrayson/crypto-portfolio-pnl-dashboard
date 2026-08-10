import { useQuery } from "@tanstack/react-query";
import type { PricePoint } from "@/types/portfolio";

export function usePriceHistory(tokenId: string | null, days = 30) {
  return useQuery({
    queryKey: ["price-history", tokenId, days],
    queryFn: async (): Promise<PricePoint[]> => {
      const res = await fetch(`/api/tokens/${tokenId}/price-history?days=${days}`);
      if (!res.ok) throw new Error("Failed to load price history");
      const data = await res.json();
      return data.points;
    },
    enabled: Boolean(tokenId),
    staleTime: 5 * 60_000,
  });
}
