import { prisma } from "@/lib/server/db/prisma";
import { getHistoricalPrice } from "@/lib/server/coingecko/prices";

/**
 * Daily price is immutable once known, so TokenPriceHistory rows are never
 * re-fetched once written — only genuinely missing (token, date) pairs hit
 * CoinGecko.
 */
export async function getCachedHistoricalPrice(
  tokenId: string,
  coingeckoId: string | null,
  date: Date
): Promise<number | null> {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

  const cached = await prisma.tokenPriceHistory.findUnique({
    where: { tokenId_currency_date: { tokenId, currency: "usd", date: day } },
  });
  if (cached) return Number(cached.price);

  if (!coingeckoId) return null;

  const dateStr = day.toISOString().slice(0, 10);
  const price = await getHistoricalPrice(coingeckoId, dateStr).catch(() => null);
  if (price === null) return null;

  await prisma.tokenPriceHistory.upsert({
    where: { tokenId_currency_date: { tokenId, currency: "usd", date: day } },
    update: { price },
    create: { tokenId, currency: "usd", date: day, price },
  });

  return price;
}
