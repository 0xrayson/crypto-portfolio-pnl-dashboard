import { prisma } from "@/lib/server/db/prisma";
import { resolveCoingeckoId } from "@/lib/server/coingecko/mapping";
import type { ChainName } from "@/lib/constants";

interface RawTokenInput {
  address: string;
  isNative: boolean;
  decimals: number | null;
  symbol: string | null;
  name: string | null;
  logo?: string | null;
}

/** Upserts a Token row, resolving + caching its CoinGeckoId on first sight only. */
export async function upsertToken(chain: ChainName, raw: RawTokenInput) {
  const existing = await prisma.token.findUnique({
    where: { chain_address: { chain, address: raw.address } },
  });

  if (existing) {
    if (!existing.coingeckoId) {
      const coingeckoId = await resolveCoingeckoId(chain, raw.address);
      if (coingeckoId) {
        return prisma.token.update({ where: { id: existing.id }, data: { coingeckoId } });
      }
    }
    return existing;
  }

  const coingeckoId = await resolveCoingeckoId(chain, raw.address);
  return prisma.token.create({
    data: {
      chain,
      address: raw.address,
      symbol: raw.symbol ?? "UNKNOWN",
      name: raw.name ?? "Unknown Token",
      decimals: raw.decimals ?? 18,
      isNative: raw.isNative,
      logoUrl: raw.logo ?? null,
      coingeckoId,
    },
  });
}
