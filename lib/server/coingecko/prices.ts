import { coingeckoFetch } from "./client";

interface SimplePriceResponse {
  [coingeckoId: string]: { usd?: number; usd_24h_change?: number };
}

export interface CurrentPrice {
  coingeckoId: string;
  usd: number;
  usd24hChange: number | null;
}

/** Batched current-price lookup — always one request for N ids, never N requests. */
export async function getCurrentPrices(coingeckoIds: string[]): Promise<CurrentPrice[]> {
  if (coingeckoIds.length === 0) return [];
  const uniqueIds = Array.from(new Set(coingeckoIds));

  const data = await coingeckoFetch<SimplePriceResponse>("/simple/price", {
    ids: uniqueIds.join(","),
    vs_currencies: "usd",
    include_24hr_change: "true",
  });

  return uniqueIds
    .filter((id) => data[id]?.usd !== undefined)
    .map((id) => ({
      coingeckoId: id,
      usd: data[id].usd as number,
      usd24hChange: data[id].usd_24h_change ?? null,
    }));
}

interface MarketChartResponse {
  prices: [number, number][];
}

export interface PricePoint {
  date: string;
  price: number;
}

interface CoinHistoryResponse {
  market_data?: { current_price?: { usd?: number } };
}

/** Price for one token on one specific calendar date (UTC). `date` is YYYY-MM-DD. */
export async function getHistoricalPrice(coingeckoId: string, date: string): Promise<number | null> {
  const [year, month, day] = date.split("-");
  const data = await coingeckoFetch<CoinHistoryResponse>(`/coins/${coingeckoId}/history`, {
    date: `${day}-${month}-${year}`,
    localization: "false",
  });
  return data.market_data?.current_price?.usd ?? null;
}

/** Daily price series for one token over the trailing `days` days. */
export async function getMarketChart(coingeckoId: string, days: number): Promise<PricePoint[]> {
  const data = await coingeckoFetch<MarketChartResponse>(`/coins/${coingeckoId}/market_chart`, {
    vs_currency: "usd",
    days: String(days),
    interval: days > 90 ? "daily" : "daily",
  });

  return data.prices.map(([timestampMs, price]) => ({
    date: new Date(timestampMs).toISOString().slice(0, 10),
    price,
  }));
}
