import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import { resolveCoingeckoId } from "@/lib/server/coingecko/mapping";
import { getEvmTokenMetadata } from "@/lib/server/alchemy/evm";
import { getSolanaTokenMetadata } from "@/lib/server/jupiter/tokenMetadata";
import { EVM_CHAINS, NATIVE_TOKEN_ADDRESS } from "@/lib/constants";
import type { ChainName, EvmChain } from "@/lib/constants";

interface RawTokenInput {
  address: string;
  isNative: boolean;
  decimals: number | null;
  symbol: string | null;
  name: string | null;
  logo?: string | null;
}

interface ResolvedMetadata {
  symbol: string | null;
  name: string | null;
  decimals: number | null;
  logo?: string | null;
}

const UNKNOWN_SYMBOL = "UNKNOWN";
const UNKNOWN_NAME = "Unknown Token";

function isEvmChain(chain: ChainName): chain is EvmChain {
  return (EVM_CHAINS as readonly string[]).includes(chain);
}

/**
 * Best-effort real symbol/name/decimals from an on-chain-adjacent source,
 * never a transfer's own `asset` field (often null) or CoinGecko (404s on
 * anything too new to be listed — which is most memecoins). EVM goes through
 * Alchemy's token metadata (reads the contract directly); Solana goes
 * through Jupiter's token search, since Alchemy's Solana DAS `getAsset`
 * isn't available on this plan. Never throws.
 */
async function resolvePlatformMetadata(chain: ChainName, address: string): Promise<ResolvedMetadata | null> {
  if (address === NATIVE_TOKEN_ADDRESS) return null;

  if (isEvmChain(chain)) {
    try {
      const meta = await getEvmTokenMetadata(chain, address);
      return meta.symbol || meta.name ? meta : null;
    } catch {
      return null;
    }
  }

  if (chain === "SOLANA") {
    const meta = await getSolanaTokenMetadata(address);
    return meta ? { symbol: meta.symbol, name: meta.name, decimals: meta.decimals, logo: null } : null;
  }

  return null;
}

/** Upserts a Token row, resolving + caching its CoinGeckoId and real on-chain symbol/name on first sight only. */
export async function upsertToken(chain: ChainName, raw: RawTokenInput) {
  const existing = await prisma.token.findUnique({
    where: { chain_address: { chain, address: raw.address } },
  });

  if (existing) {
    const updates: { coingeckoId?: string; symbol?: string; name?: string; decimals?: number; logoUrl?: string } = {};

    if (!existing.coingeckoId) {
      const coingeckoId = await resolveCoingeckoId(chain, raw.address);
      if (coingeckoId) updates.coingeckoId = coingeckoId;
    }

    // A prior ingestion path (e.g. a transfer with no `asset` field) may have
    // created this token with placeholder values — retry with real metadata.
    if (existing.symbol === UNKNOWN_SYMBOL || existing.name === UNKNOWN_NAME || !existing.symbol) {
      const meta = await resolvePlatformMetadata(chain, raw.address);
      if (meta?.symbol) updates.symbol = meta.symbol;
      if (meta?.name) updates.name = meta.name;
      if (meta?.decimals != null) updates.decimals = meta.decimals;
      if (meta?.logo) updates.logoUrl = meta.logo;
    }

    return Object.keys(updates).length > 0 ? prisma.token.update({ where: { id: existing.id }, data: updates }) : existing;
  }

  const coingeckoId = await resolveCoingeckoId(chain, raw.address);
  let symbol = raw.symbol;
  let name = raw.name;
  let decimals = raw.decimals;
  let logo = raw.logo ?? null;

  if (!symbol) {
    const meta = await resolvePlatformMetadata(chain, raw.address);
    if (meta) {
      symbol = meta.symbol ?? symbol;
      name = meta.name ?? name;
      decimals = meta.decimals ?? decimals;
      logo = meta.logo ?? logo;
    }
  }

  try {
    return await prisma.token.create({
      data: {
        chain,
        address: raw.address,
        symbol: symbol ?? UNKNOWN_SYMBOL,
        name: name ?? UNKNOWN_NAME,
        decimals: decimals ?? 18,
        isNative: raw.isNative,
        logoUrl: logo,
        coingeckoId,
      },
    });
  } catch (err) {
    // A concurrent call already created this token between our findUnique and
    // create (e.g. two signatures referencing the same new mint, processed
    // in parallel under mapWithConcurrency) — use the row it created instead
    // of failing the whole request.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const winner = await prisma.token.findUnique({ where: { chain_address: { chain, address: raw.address } } });
      if (winner) return winner;
    }
    throw err;
  }
}
