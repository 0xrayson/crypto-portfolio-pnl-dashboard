import type { ChainName } from "@/lib/constants";
import type { OpenLot, SwapPnlSummary, SwapPnlWindow, SwapPnlWindowLabel, SwapView, TokenSummary } from "@/types/portfolio";

export interface SwapLegInput {
  id: string;
  txHash: string;
  chain: ChainName;
  blockTimestamp: Date;
  direction: "IN" | "OUT" | "SELF";
  tokenId: string | null;
  token: TokenSummary | null;
  amount: number;
  amountUsdAtTx: number | null;
}

interface Lot {
  quantity: number;
  unitCostUsd: number | null;
}

const EPSILON = 1e-9;

/**
 * Per-token FIFO cost basis over already-tagged SWAP legs, oldest first.
 * A sell that runs out of buy-lots (its cost basis predates the fetch
 * window, or the token was acquired outside a swap) — or whose own price
 * lookup is missing — is reported with `costBasisUnknown: true` and a null
 * PnL rather than a guessed number. Legs must be pre-sorted ascending by
 * `blockTimestamp`. `now` is injectable for testability, defaulting to the
 * real current time.
 */
export function computeSwapPnl(legs: SwapLegInput[], now: Date = new Date()): SwapPnlSummary {
  const lotsByToken = new Map<string, Lot[]>();
  const legsByTxHash = new Map<string, SwapLegInput[]>();
  for (const leg of legs) {
    const group = legsByTxHash.get(leg.txHash);
    if (group) group.push(leg);
    else legsByTxHash.set(leg.txHash, [leg]);
  }

  const swaps: SwapView[] = [];

  for (const leg of legs) {
    if (!leg.tokenId || leg.direction === "SELF") continue;

    if (leg.direction === "IN") {
      const unitCostUsd = leg.amountUsdAtTx != null && leg.amount > 0 ? leg.amountUsdAtTx / leg.amount : null;
      const lots = lotsByToken.get(leg.tokenId) ?? [];
      lots.push({ quantity: leg.amount, unitCostUsd });
      lotsByToken.set(leg.tokenId, lots);
      continue;
    }

    // OUT leg = a sell: consume oldest lots first.
    const lots = lotsByToken.get(leg.tokenId) ?? [];
    let remaining = leg.amount;
    let consumedCostUsd = 0;
    let costBasisKnown = true;

    while (remaining > EPSILON && lots.length > 0) {
      const lot = lots[0];
      const take = Math.min(remaining, lot.quantity);
      if (lot.unitCostUsd === null) costBasisKnown = false;
      else consumedCostUsd += take * lot.unitCostUsd;
      lot.quantity -= take;
      remaining -= take;
      if (lot.quantity <= EPSILON) lots.shift();
    }
    if (remaining > EPSILON) costBasisKnown = false;

    const proceedsUsd = leg.amountUsdAtTx;
    const unknown = !costBasisKnown || proceedsUsd == null;
    const boughtLeg = pickPrimaryBoughtLeg(legsByTxHash.get(leg.txHash) ?? []);

    swaps.push({
      txHash: leg.txHash,
      chain: leg.chain,
      blockTimestamp: leg.blockTimestamp.toISOString(),
      soldToken: leg.token,
      soldAmount: leg.amount,
      boughtToken: boughtLeg?.token ?? null,
      boughtAmount: boughtLeg?.amount ?? 0,
      proceedsUsd,
      costBasisUsd: unknown ? null : consumedCostUsd,
      realizedPnlUsd: unknown ? null : (proceedsUsd as number) - consumedCostUsd,
      costBasisUnknown: unknown,
    });
  }

  const known = swaps.filter((s) => !s.costBasisUnknown);
  const mostRecentFirst = [...swaps].reverse();
  return {
    totalRealizedPnlUsd: known.reduce((sum, s) => sum + (s.realizedPnlUsd ?? 0), 0),
    totalSwaps: swaps.length,
    winCount: known.filter((s) => (s.realizedPnlUsd ?? 0) > 0).length,
    lossCount: known.filter((s) => (s.realizedPnlUsd ?? 0) < 0).length,
    unknownCostBasisCount: swaps.length - known.length,
    swaps: mostRecentFirst,
    windows: computeSwapPnlWindows(mostRecentFirst, now),
    openLots: collectOpenLots(lotsByToken),
  };
}

/**
 * Unconsumed buy-lots left after processing every leg — the cost-basis side
 * of "what's still held that we bought via a tracked swap." If any lot for a
 * token has an unknown unit cost, the whole token's open position is
 * reported with `costBasisUsd: null` rather than silently treating the
 * unknown portion as free.
 */
function collectOpenLots(lotsByToken: Map<string, Lot[]>): OpenLot[] {
  const openLots: OpenLot[] = [];
  for (const [tokenId, lots] of lotsByToken.entries()) {
    const remaining = lots.filter((l) => l.quantity > EPSILON);
    if (remaining.length === 0) continue;

    const quantity = remaining.reduce((sum, l) => sum + l.quantity, 0);
    const hasUnknownCost = remaining.some((l) => l.unitCostUsd === null);
    const costBasisUsd = hasUnknownCost
      ? null
      : remaining.reduce((sum, l) => sum + l.quantity * (l.unitCostUsd as number), 0);

    openLots.push({ tokenId, quantity, costBasisUsd });
  }
  return openLots;
}

const WINDOW_DEFINITIONS: { label: SwapPnlWindowLabel; days: number }[] = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "6M", days: 180 },
];

/**
 * Trailing-window realized PnL — each window is "PnL over the last N days",
 * so 1W's swaps are a superset of 1D's, not a distinct non-overlapping
 * bucket (matches how exchanges show 24h/7d/30d change). The highest window
 * offered today is 6M; longer windows are a natural future addition, not a
 * hard limit of the underlying data.
 */
function computeSwapPnlWindows(swapsMostRecentFirst: SwapView[], now: Date): SwapPnlWindow[] {
  return WINDOW_DEFINITIONS.map(({ label, days }) => {
    const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
    const inWindow = swapsMostRecentFirst.filter((s) => new Date(s.blockTimestamp).getTime() >= cutoff);
    const known = inWindow.filter((s) => !s.costBasisUnknown);

    return {
      label,
      days,
      realizedPnlUsd: known.reduce((sum, s) => sum + (s.realizedPnlUsd ?? 0), 0),
      swapCount: inWindow.length,
      winCount: known.filter((s) => (s.realizedPnlUsd ?? 0) > 0).length,
      lossCount: known.filter((s) => (s.realizedPnlUsd ?? 0) < 0).length,
      unknownCostBasisCount: inWindow.length - known.length,
    };
  });
}

/**
 * Multi-token buys within one swap tx are rare; for display purposes only
 * (this doesn't affect FIFO correctness, which processes every leg
 * independently) we show the highest-USD-value bought leg as representative.
 */
function pickPrimaryBoughtLeg(group: SwapLegInput[]): SwapLegInput | null {
  const bought = group.filter((l) => l.direction === "IN");
  if (bought.length === 0) return null;
  return bought.reduce((best, l) => ((l.amountUsdAtTx ?? 0) > (best.amountUsdAtTx ?? 0) ? l : best), bought[0]);
}
