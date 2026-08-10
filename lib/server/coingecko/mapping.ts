import { coingeckoFetch } from "./client";
import type { ChainName } from "@/lib/constants";
import { NATIVE_TOKEN_ADDRESS } from "@/lib/constants";

const PLATFORM_BY_CHAIN: Record<ChainName, string | null> = {
  ETHEREUM: "ethereum",
  POLYGON: "polygon-pos",
  ARBITRUM: "arbitrum-one",
  OPTIMISM: "optimistic-ethereum",
  BASE: "base",
  SOLANA: "solana",
};

const NATIVE_COINGECKO_ID: Record<ChainName, string> = {
  ETHEREUM: "ethereum",
  POLYGON: "matic-network",
  ARBITRUM: "ethereum",
  OPTIMISM: "ethereum",
  BASE: "ethereum",
  SOLANA: "solana",
};

interface ContractLookupResponse {
  id: string;
}

/**
 * Resolves a (chain, contract address) pair to a CoinGecko coin id. Callers
 * should persist the result on `Token.coingeckoId` and never call this again
 * for the same token.
 */
export async function resolveCoingeckoId(chain: ChainName, contractAddress: string): Promise<string | null> {
  if (contractAddress === NATIVE_TOKEN_ADDRESS) {
    return NATIVE_COINGECKO_ID[chain];
  }

  const platform = PLATFORM_BY_CHAIN[chain];
  if (!platform) return null;

  try {
    const data = await coingeckoFetch<ContractLookupResponse>(`/coins/${platform}/contract/${contractAddress.toLowerCase()}`);
    return data.id ?? null;
  } catch {
    return null;
  }
}
