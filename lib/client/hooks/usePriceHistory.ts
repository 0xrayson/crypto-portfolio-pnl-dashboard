import { useQuery } from "@tanstack/react-query";
import { fetchJsonOrThrow } from "@/lib/client/fetchJson";
import type { PricePoint } from "@/types/portfolio";

export function usePriceHistory(tokenId: string | null, days = 30) {
  return useQuery({
    queryKey: ["price-history", tokenId, days],
    queryFn: async (): Promise<PricePoint[]> => {
      const data = await fetchJsonOrThrow<{ points: PricePoint[] }>(`/api/tokens/${tokenId}/price-history?days=${days}`);
      return data.points;
    },
    enabled: Boolean(tokenId),
    staleTime: 5 * 60_000,
  });
}
