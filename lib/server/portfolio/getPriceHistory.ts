import { prisma } from "@/lib/server/db/prisma";
import { getMarketChart } from "@/lib/server/coingecko/prices";
import type { PricePoint } from "@/types/portfolio";

export async function getPriceHistory(tokenId: string, days: number): Promise<PricePoint[]> {
  const token = await prisma.token.findUnique({ where: { id: tokenId } });
  if (!token?.coingeckoId) return [];

  const points = await getMarketChart(token.coingeckoId, days);

  await prisma.$transaction(
    points.map((p) =>
      prisma.tokenPriceHistory.upsert({
        where: { tokenId_currency_date: { tokenId, currency: "usd", date: new Date(p.date) } },
        update: { price: p.price },
        create: { tokenId, currency: "usd", date: new Date(p.date), price: p.price },
      })
    )
  );

  return points;
}
