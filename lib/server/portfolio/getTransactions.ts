import { prisma } from "@/lib/server/db/prisma";
import { getEvmAssetTransfers, type RawEvmTransfer } from "@/lib/server/alchemy/evm";
import {
  getSolanaSignatures,
  getSolanaParsedTransaction,
  diffTokenBalances,
  lamportsToSol,
} from "@/lib/server/alchemy/solana";
import { getOrCreateWallet } from "./wallet";
import { upsertToken } from "./tokens";
import { getCachedHistoricalPrice } from "./priceCache";
import { tagSwaps } from "./pairSwaps";
import { mapWithConcurrency } from "@/lib/server/concurrency";
import { EVM_CHAINS, NATIVE_TOKEN_ADDRESS } from "@/lib/constants";
import type { Ecosystem } from "@/types/wallet";
import type { TransactionView, TxDirection, TxType } from "@/types/portfolio";

// Deliberately deeper than a typical "recent activity" page size: swap PnL
// needs enough history for a sell's matching buy to actually be in view.
// Still bounded (not full lifetime backfill) — sells older than this window
// are reported as "cost basis unknown" rather than fetched exhaustively.
const PAGE_SIZE = 150;

async function upsertTransaction(input: {
  walletId: string;
  chain: (typeof EVM_CHAINS)[number] | "SOLANA";
  txHash: string;
  legId: string;
  blockTimestamp: Date;
  direction: TxDirection;
  type: TxType;
  tokenId: string | null;
  amount: number;
  counterpartyAddress: string | null;
  rawMetadata: unknown;
  coingeckoId: string | null;
}) {
  const amountUsdAtTx = input.tokenId
    ? await getCachedHistoricalPrice(input.tokenId, input.coingeckoId, input.blockTimestamp)
    : null;

  return prisma.transaction.upsert({
    where: {
      chain_txHash_walletId_legId: {
        chain: input.chain,
        txHash: input.txHash,
        walletId: input.walletId,
        legId: input.legId,
      },
    },
    update: {},
    create: {
      walletId: input.walletId,
      chain: input.chain,
      txHash: input.txHash,
      legId: input.legId,
      blockTimestamp: input.blockTimestamp,
      direction: input.direction,
      type: input.type,
      tokenId: input.tokenId,
      amount: input.amount,
      amountUsdAtTx: amountUsdAtTx ?? undefined,
      counterpartyAddress: input.counterpartyAddress,
      rawMetadata: input.rawMetadata as never,
    },
  });
}

async function ingestEvmTransfer(walletId: string, address: string, chain: (typeof EVM_CHAINS)[number], t: RawEvmTransfer) {
  const contractAddress = t.rawContract?.address ?? NATIVE_TOKEN_ADDRESS;
  const isNative = contractAddress === NATIVE_TOKEN_ADDRESS;

  const token = await upsertToken(chain, {
    address: contractAddress,
    isNative,
    decimals: t.rawContract?.decimal ? parseInt(t.rawContract.decimal, 16) : isNative ? 18 : null,
    symbol: t.asset ?? null,
    name: t.asset ?? null,
  });

  const fromSelf = t.from?.toLowerCase() === address.toLowerCase();
  const toSelf = t.to?.toLowerCase() === address.toLowerCase();
  const direction: TxDirection = fromSelf && toSelf ? "SELF" : fromSelf ? "OUT" : "IN";
  const counterparty = fromSelf ? t.to : t.from;

  const blockTimestamp = t.metadata?.blockTimestamp ? new Date(t.metadata.blockTimestamp) : new Date();

  await upsertTransaction({
    walletId,
    chain,
    txHash: t.hash,
    legId: t.uniqueId,
    blockTimestamp,
    direction,
    type: "TRANSFER",
    tokenId: token.id,
    amount: t.value ?? 0,
    counterpartyAddress: counterparty ?? null,
    rawMetadata: t,
    coingeckoId: token.coingeckoId,
  });
}

/** Merged, most-recent-first transfer history across all EVM chains for one address. */
async function getEvmTransactions(walletId: string, address: string): Promise<void> {
  const perChain = await Promise.allSettled(
    EVM_CHAINS.map(async (chain) => ({ chain, ...(await getEvmAssetTransfers(chain, address, { maxCount: PAGE_SIZE })) }))
  );

  await Promise.all(
    perChain.flatMap((r) => {
      if (r.status !== "fulfilled") return [];
      const { chain, transfers } = r.value;
      return transfers.map((t) => ingestEvmTransfer(walletId, address, chain, t));
    })
  );
}

/**
 * Reads each signature once and persists every leg it touches for the
 * wallet: the native SOL delta (fee-adjusted when the wallet paid it) plus
 * one leg per SPL mint whose balance changed — this is what lets a Solana
 * swap (token-for-token, not SOL-for-token) be detected at all. Concurrency
 * is capped since upsertToken fans out to CoinGecko for any mint seen for
 * the first time.
 */
async function getSolanaTransactions(walletId: string, address: string): Promise<void> {
  const signatures = await getSolanaSignatures(address, { limit: PAGE_SIZE });
  const solToken = await upsertToken("SOLANA", {
    address: NATIVE_TOKEN_ADDRESS,
    isNative: true,
    decimals: 9,
    symbol: "SOL",
    name: "Solana",
  });

  await mapWithConcurrency(signatures, 5, async (sig) => {
    if (!sig.blockTime) return;
    const parsed = await getSolanaParsedTransaction(sig.signature).catch(() => null);
    if (!parsed?.meta) return;

    const accountKeys = parsed.transaction.message.accountKeys.map((k) => k.pubkey.toBase58());
    const ownerIndex = accountKeys.indexOf(address);
    if (ownerIndex === -1) return;

    const blockTimestamp = new Date(sig.blockTime * 1000);

    const pre = parsed.meta.preBalances[ownerIndex] ?? 0;
    const post = parsed.meta.postBalances[ownerIndex] ?? 0;
    // The fee payer is always account index 0. Netting it back out avoids
    // overstating the SOL actually spent/received on a swap by the fee amount.
    const fee = ownerIndex === 0 ? parsed.meta.fee : 0;
    const deltaLamports = post - pre + fee;

    if (deltaLamports !== 0) {
      await upsertTransaction({
        walletId,
        chain: "SOLANA",
        txHash: sig.signature,
        legId: "native",
        blockTimestamp,
        direction: deltaLamports > 0 ? "IN" : "OUT",
        type: "TRANSFER",
        tokenId: solToken.id,
        amount: Math.abs(lamportsToSol(deltaLamports)),
        counterpartyAddress: null,
        rawMetadata: { slot: sig.slot, fee: parsed.meta.fee },
        coingeckoId: solToken.coingeckoId,
      });
    }

    const deltas = diffTokenBalances(parsed.meta.preTokenBalances, parsed.meta.postTokenBalances, address);
    for (const d of deltas) {
      const token = await upsertToken("SOLANA", {
        address: d.mint,
        isNative: false,
        decimals: d.decimals,
        symbol: null,
        name: null,
      });
      await upsertTransaction({
        walletId,
        chain: "SOLANA",
        txHash: sig.signature,
        legId: `spl:${d.mint}`,
        blockTimestamp,
        direction: d.rawDelta > 0n ? "IN" : "OUT",
        type: "TRANSFER",
        tokenId: token.id,
        amount: Math.abs(Number(d.rawDelta)) / 10 ** d.decimals,
        counterpartyAddress: null,
        rawMetadata: { slot: sig.slot, mint: d.mint },
        coingeckoId: token.coingeckoId,
      });
    }
  });
}

export async function refreshTransactions(ecosystem: Ecosystem, address: string): Promise<void> {
  const wallet = await getOrCreateWallet(ecosystem, address);
  if (ecosystem === "EVM") {
    await getEvmTransactions(wallet.id, address);
  } else {
    await getSolanaTransactions(wallet.id, address);
  }
  await tagSwaps(wallet.id);
}

export async function listTransactions(ecosystem: Ecosystem, address: string, limit = 50): Promise<TransactionView[]> {
  const wallet = await getOrCreateWallet(ecosystem, address);

  const rows = await prisma.transaction.findMany({
    where: { walletId: wallet.id },
    include: { token: true },
    orderBy: { blockTimestamp: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    chain: r.chain,
    txHash: r.txHash,
    blockTimestamp: r.blockTimestamp.toISOString(),
    direction: r.direction,
    type: r.type,
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
    feeUsdAtTx: r.feeUsdAtTx ? Number(r.feeUsdAtTx) : null,
    counterpartyAddress: r.counterpartyAddress,
  }));
}
