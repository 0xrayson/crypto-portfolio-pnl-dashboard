import { prisma } from "@/lib/server/db/prisma";
import { getOrCreateWallet } from "./wallet";
import { computeSwapPnl, type SwapLegInput } from "./swapPnl";
import type { Ecosystem } from "@/types/wallet";
import type { SwapPnlSummary } from "@/types/portfolio";

/**
 * Pure read — mirrors `listTransactions` vs. `refreshTransactions`: this
 * does not hit Alchemy/CoinGecko itself, callers refresh transactions first.
 */
export async function getSwapPnl(ecosystem: Ecosystem, address: string): Promise<SwapPnlSummary> {
  const wallet = await getOrCreateWallet(ecosystem, address);

  const rows = await prisma.transaction.findMany({
    where: { walletId: wallet.id, type: "SWAP" },
    include: { token: true },
    orderBy: { blockTimestamp: "asc" },
  });

  const legs: SwapLegInput[] = rows.map((r) => ({
    id: r.id,
    txHash: r.txHash,
    chain: r.chain,
    blockTimestamp: r.blockTimestamp,
    direction: r.direction,
    tokenId: r.tokenId,
    token: r.token
      ? {
          id: r.token.id,
          chain: r.token.chain,
          address: r.token.address,
          symbol: r.token.symbol,
          name: r.token.name,
          decimals: r.token.decimals,
          logoUrl: r.token.logoUrl,
          isNative: r.token.isNative,
        }
      : null,
    amount: Number(r.amount),
    amountUsdAtTx: r.amountUsdAtTx ? Number(r.amountUsdAtTx) : null,
  }));

  return computeSwapPnl(legs);
}
