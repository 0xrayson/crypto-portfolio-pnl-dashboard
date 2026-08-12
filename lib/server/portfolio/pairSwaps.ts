import { prisma } from "@/lib/server/db/prisma";
import type { TxDirection } from "@/types/portfolio";

interface LegForClassification {
  id: string;
  txHash: string;
  tokenId: string | null;
  direction: TxDirection;
}

/**
 * Groups legs by txHash and returns the ids of every leg belonging to a real
 * swap: a tx with at least one OUT leg and at least one IN leg touching
 * different tokens. Pure transfers (all-OUT or all-IN) and same-token
 * round trips (e.g. wrap/unwrap) are left alone. Multi-leg swaps (3+ tokens,
 * or a sell split across multiple buys) are tagged in full — every sold leg
 * is later treated as an independent FIFO consumption event, every bought
 * leg as an independent new lot, with no attempt to compute a single ratio
 * across them.
 */
export function classifySwapLegs(legs: LegForClassification[]): string[] {
  const byTxHash = new Map<string, LegForClassification[]>();
  for (const leg of legs) {
    const group = byTxHash.get(leg.txHash);
    if (group) group.push(leg);
    else byTxHash.set(leg.txHash, [leg]);
  }

  const swapLegIds: string[] = [];
  for (const group of byTxHash.values()) {
    const out = group.filter((l) => l.direction === "OUT");
    const inn = group.filter((l) => l.direction === "IN");
    if (out.length === 0 || inn.length === 0) continue;

    const outTokens = new Set(out.map((l) => l.tokenId));
    const inTokens = new Set(inn.map((l) => l.tokenId));
    const isSameSingleTokenRoundTrip = outTokens.size === 1 && inTokens.size === 1 && [...outTokens][0] === [...inTokens][0];
    if (isSameSingleTokenRoundTrip) continue;

    swapLegIds.push(...out.map((l) => l.id), ...inn.map((l) => l.id));
  }
  return swapLegIds;
}

/** Re-tags every swap-eligible leg for a wallet as type SWAP. Idempotent, safe to call after every ingestion pass. */
export async function tagSwaps(walletId: string): Promise<void> {
  const legs = await prisma.transaction.findMany({
    where: { walletId },
    select: { id: true, txHash: true, tokenId: true, direction: true },
  });

  const swapLegIds = classifySwapLegs(legs);
  if (swapLegIds.length === 0) return;

  await prisma.transaction.updateMany({
    where: { id: { in: swapLegIds }, type: { not: "SWAP" } },
    data: { type: "SWAP" },
  });
}
