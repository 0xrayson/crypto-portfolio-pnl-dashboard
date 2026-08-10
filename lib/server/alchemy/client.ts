import { Alchemy, Network } from "alchemy-sdk";
import type { EvmChain } from "@/lib/constants";

const NETWORK_BY_CHAIN: Record<EvmChain, Network> = {
  ETHEREUM: Network.ETH_MAINNET,
  POLYGON: Network.MATIC_MAINNET,
  ARBITRUM: Network.ARB_MAINNET,
  OPTIMISM: Network.OPT_MAINNET,
  BASE: Network.BASE_MAINNET,
};

const clientCache = new Map<EvmChain, Alchemy>();

export function getAlchemyClient(chain: EvmChain): Alchemy {
  const cached = clientCache.get(chain);
  if (cached) return cached;

  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error("ALCHEMY_API_KEY is not set");
  }

  const client = new Alchemy({ apiKey, network: NETWORK_BY_CHAIN[chain] });
  clientCache.set(chain, client);
  return client;
}

export function getSolanaRpcUrl(): string {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error("ALCHEMY_API_KEY is not set");
  }
  return `https://solana-mainnet.g.alchemy.com/v2/${apiKey}`;
}
