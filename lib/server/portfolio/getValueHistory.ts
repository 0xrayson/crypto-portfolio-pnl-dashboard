import { prisma } from "@/lib/server/db/prisma";
import { getOrCreateWallet } from "./wallet";
import { getBalances } from "./getBalances";
import { getCachedHistoricalPrice } from "./priceCache";
import { mapWithConcurrency } from "@/lib/server/concurrency";
import type { Ecosystem } from "@/types/wallet";

export interface ValueHistoryPoint {
  date: string;
  totalUsdValue: number;
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addUtcDays(d: Date, delta: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + delta);
  return copy;
}

function toDateStr(d: Date): string {
  return startOfUtcDay(d).toISOString().slice(0, 10);
}

/**
 * Reconstructs the wallet's real total USD value at the end of each day over
 * the trailing `days` days — no seeded/mock data. Starting from today's real
 * balances, it walks each token's quantity backward one day at a time using
 * the wallet's actual transaction deltas, re-pricing each past day with
 * cached/fetched historical prices. Today's point uses the live current
 * price directly so it always matches the Portfolio value card exactly.
 *
 * Bounded by how far back the ingested transaction history reaches (same
 * recent-history limit as the swap PnL feature) — the series simply starts
 * wherever real data starts, nothing earlier is invented. A token whose
 * historical price can't be resolved for a given day contributes 0 to that
 * day's total rather than blocking the whole point.
 */
export async function getValueHistory(ecosystem: Ecosystem, address: string, days: number): Promise<ValueHistoryPoint[]> {
  const wallet = await getOrCreateWallet(ecosystem, address);
  const balances = await getBalances(ecosystem, address);
  const currentQty = new Map(balances.map((b) => [b.token.id, b.balance]));
  const currentPrice = new Map(balances.map((b) => [b.token.id, b.usdPrice]));

  const today = startOfUtcDay(new Date());
  const earliestDate = addUtcDays(today, -days);

  const txRows = await prisma.transaction.findMany({
    where: {
      walletId: wallet.id,
      tokenId: { not: null },
      direction: { in: ["IN", "OUT"] },
      blockTimestamp: { gte: earliestDate },
    },
    select: { tokenId: true, direction: true, amount: true, blockTimestamp: true },
  });

  const deltaByTokenDate = new Map<string, number>();
  const touchedTokenIds = new Set<string>();
  for (const row of txRows) {
    if (!row.tokenId) continue;
    touchedTokenIds.add(row.tokenId);
    const key = `${row.tokenId}|${toDateStr(row.blockTimestamp)}`;
    const signed = row.direction === "IN" ? Number(row.amount) : -Number(row.amount);
    deltaByTokenDate.set(key, (deltaByTokenDate.get(key) ?? 0) + signed);
  }

  const tokenIds = [...new Set([...currentQty.keys(), ...touchedTokenIds])];
  const tokens = await prisma.token.findMany({ where: { id: { in: tokenIds } } });
  const tokenById = new Map(tokens.map((t) => [t.id, t]));

  const dayList: Date[] = [];
  for (let i = 0; i <= days; i++) dayList.push(addUtcDays(today, -i));

  // Walk quantity backward one day at a time (pure, no I/O).
  const qtyByDay = new Map<string, Map<string, number>>();
  const runningQty = new Map<string, number>();
  for (const id of tokenIds) runningQty.set(id, currentQty.get(id) ?? 0);

  for (const day of dayList) {
    const dateStr = toDateStr(day);
    qtyByDay.set(dateStr, new Map(runningQty));
    for (const tokenId of tokenIds) {
      const delta = deltaByTokenDate.get(`${tokenId}|${dateStr}`) ?? 0;
      if (delta !== 0) runningQty.set(tokenId, (runningQty.get(tokenId) ?? 0) - delta);
    }
  }

  // Only past days need a historical price lookup; today uses the live price.
  const todayStr = toDateStr(today);
  const lookups: { tokenId: string; date: Date }[] = [];
  for (const day of dayList.slice(1)) {
    const dayQty = qtyByDay.get(toDateStr(day))!;
    for (const tokenId of tokenIds) {
      if ((dayQty.get(tokenId) ?? 0) > 0) lookups.push({ tokenId, date: day });
    }
  }

  const priceResults = await mapWithConcurrency(lookups, 5, async ({ tokenId, date }) => {
    const token = tokenById.get(tokenId);
    const price = await getCachedHistoricalPrice(tokenId, token?.coingeckoId ?? null, date).catch(() => null);
    return { tokenId, dateStr: toDateStr(date), price };
  });
  const priceByKey = new Map(priceResults.map((r) => [`${r.tokenId}|${r.dateStr}`, r.price]));

  const points: ValueHistoryPoint[] = dayList.map((day) => {
    const dateStr = toDateStr(day);
    const dayQty = qtyByDay.get(dateStr)!;
    let totalUsdValue = 0;
    for (const tokenId of tokenIds) {
      const qty = dayQty.get(tokenId) ?? 0;
      if (qty <= 0) continue;
      const price = dateStr === todayStr ? (currentPrice.get(tokenId) ?? 0) : (priceByKey.get(`${tokenId}|${dateStr}`) ?? 0);
      totalUsdValue += qty * price;
    }
    return { date: dateStr, totalUsdValue };
  });

  return points.reverse();
}
