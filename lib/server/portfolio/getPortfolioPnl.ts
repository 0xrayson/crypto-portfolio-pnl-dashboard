import { getSwapPnl } from "./getSwapPnl";
import { getBalances } from "./getBalances";
import type { Ecosystem } from "@/types/wallet";

export interface PortfolioPnl {
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
  source: "COMPUTED";
  /** True when some current holdings couldn't be priced against a known cost basis (acquired outside a tracked swap) and were excluded from unrealizedPnlUsd rather than guessed at. */
  hasUntrackedHoldings: boolean;
}

/**
 * Real PnL for the Overview card: realized comes straight from the swap
 * engine's all-time total; unrealized is derived from whatever open FIFO
 * lots remain (tokens bought via a tracked swap and still held), valued
 * against current market price. Holdings with no lot data — acquired via a
 * plain transfer/airdrop rather than a tracked swap — are excluded from
 * unrealizedPnlUsd rather than assumed to have zero cost basis.
 */
export async function getPortfolioPnl(ecosystem: Ecosystem, address: string): Promise<PortfolioPnl> {
  const [swapPnl, balances] = await Promise.all([getSwapPnl(ecosystem, address), getBalances(ecosystem, address)]);

  const balanceByTokenId = new Map(balances.map((b) => [b.token.id, b]));

  let unrealizedPnlUsd = 0;
  let hasUntrackedHoldings = false;

  for (const lot of swapPnl.openLots) {
    const balance = balanceByTokenId.get(lot.tokenId);
    if (!balance || lot.costBasisUsd === null || lot.quantity <= 0) {
      hasUntrackedHoldings = hasUntrackedHoldings || lot.costBasisUsd === null;
      continue;
    }

    const trackedQty = Math.min(lot.quantity, balance.balance);
    const unitCostUsd = lot.costBasisUsd / lot.quantity;
    unrealizedPnlUsd += trackedQty * balance.usdPrice - trackedQty * unitCostUsd;
    if (trackedQty < balance.balance) hasUntrackedHoldings = true;
  }

  const trackedTokenIds = new Set(swapPnl.openLots.map((l) => l.tokenId));
  if (balances.some((b) => !trackedTokenIds.has(b.token.id))) {
    hasUntrackedHoldings = true;
  }

  return {
    realizedPnlUsd: swapPnl.totalRealizedPnlUsd,
    unrealizedPnlUsd,
    source: "COMPUTED",
    hasUntrackedHoldings,
  };
}
