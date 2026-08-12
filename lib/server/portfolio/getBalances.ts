import { prisma } from "@/lib/server/db/prisma";
import { getEvmTokenBalances } from "@/lib/server/alchemy/evm";
import { getSolanaTokenBalances } from "@/lib/server/alchemy/solana";
import { getCurrentPrices } from "@/lib/server/coingecko/prices";
import { getOrCreateWallet } from "./wallet";
import { upsertToken } from "./tokens";
import { mapWithConcurrency } from "@/lib/server/concurrency";
import { EVM_CHAINS } from "@/lib/constants";
import type { ChainName } from "@/lib/constants";
import type { Ecosystem } from "@/types/wallet";
import type { TokenBalanceView } from "@/types/portfolio";

interface RawChainBalance {
  chain: ChainName;
  address: string;
  isNative: boolean;
  rawBalance: string;
  decimals: number | null;
  symbol: string | null;
  name: string | null;
  logo?: string | null;
}

async function fetchRawBalances(ecosystem: Ecosystem, address: string): Promise<RawChainBalance[]> {
  if (ecosystem === "EVM") {
    const perChain = await Promise.allSettled(
      EVM_CHAINS.map(async (chain) => {
        const balances = await getEvmTokenBalances(chain, address);
        return balances.map((b) => ({ chain, ...b, address: b.contractAddress }));
      })
    );

    const rejected = perChain.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    if (rejected.length === perChain.length) {
      // Every chain failed the same way (e.g. missing ALCHEMY_API_KEY) — surface
      // the real error instead of silently reporting an empty portfolio.
      throw rejected[0].reason;
    }

    return perChain.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  }

  const balances = await getSolanaTokenBalances(address);
  return balances.map((b) => ({
    chain: "SOLANA" as const,
    address: b.mint,
    isNative: b.isNative,
    rawBalance: b.rawBalance,
    decimals: b.decimals,
    symbol: b.isNative ? "SOL" : null,
    name: b.isNative ? "Solana" : null,
    logo: null,
  }));
}

/**
 * Fetches live balances from Alchemy, upserts Token/TokenBalance rows, and
 * joins current CoinGecko prices. This is the source of truth for the
 * "REAL" token balance, portfolio value, and allocation views.
 */
export async function getBalances(ecosystem: Ecosystem, address: string): Promise<TokenBalanceView[]> {
  const wallet = await getOrCreateWallet(ecosystem, address);
  const raw = (await fetchRawBalances(ecosystem, address)).filter((b) => BigInt(b.rawBalance) > 0n);

  // Concurrency-limited: upsertToken hits CoinGecko's contract-lookup endpoint
  // for any token seen for the first time, and firing all of them at once
  // reliably blows through CoinGecko's free-tier rate limit on wallets that
  // hold many distinct tokens.
  const withTokens = await mapWithConcurrency(raw, 5, async (r) => {
    const token = await upsertToken(r.chain, r);
    const decimals = r.decimals ?? token.decimals;
    const humanBalance = Number(r.rawBalance) / 10 ** decimals;
    return { token, chain: r.chain, humanBalance };
  });

  const nonZero = withTokens.filter((t) => t.humanBalance > 0);
  const coingeckoIds = nonZero.map((t) => t.token.coingeckoId).filter((id): id is string => Boolean(id));
  // Balances are the primary data here — a CoinGecko outage/rate-limit should
  // degrade to zeroed-out prices, not fail the whole balances response.
  const prices = await getCurrentPrices(coingeckoIds).catch(() => []);
  const priceById = new Map(prices.map((p) => [p.coingeckoId, p]));

  const views = await Promise.all(
    nonZero.map(async ({ token, chain, humanBalance }) => {
      const price = token.coingeckoId ? priceById.get(token.coingeckoId) : undefined;
      const usdPrice = price?.usd ?? 0;
      const usdValue = humanBalance * usdPrice;

      await prisma.tokenBalance.upsert({
        where: { walletId_tokenId: { walletId: wallet.id, tokenId: token.id } },
        update: { balance: humanBalance, usdValue, chain, fetchedAt: new Date() },
        create: { walletId: wallet.id, tokenId: token.id, chain, balance: humanBalance, usdValue },
      });

      const view: TokenBalanceView = {
        token: {
          id: token.id,
          chain,
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoUrl: token.logoUrl,
          isNative: token.isNative,
        },
        balance: humanBalance,
        usdValue,
        usdPrice,
        priceChange24h: price?.usd24hChange ?? null,
      };
      return view;
    })
  );

  return views.sort((a, b) => b.usdValue - a.usdValue);
}

export async function getPortfolioValue(ecosystem: Ecosystem, address: string): Promise<number> {
  const balances = await getBalances(ecosystem, address);
  return balances.reduce((sum, b) => sum + b.usdValue, 0);
}
