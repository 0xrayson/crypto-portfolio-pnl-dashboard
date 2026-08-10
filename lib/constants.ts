export const EVM_CHAINS = ["ETHEREUM", "POLYGON", "ARBITRUM", "OPTIMISM", "BASE"] as const;
export type EvmChain = (typeof EVM_CHAINS)[number];

export const ALL_CHAINS = [...EVM_CHAINS, "SOLANA"] as const;
export type ChainName = (typeof ALL_CHAINS)[number];

export const CHAIN_LABELS: Record<ChainName, string> = {
  ETHEREUM: "Ethereum",
  POLYGON: "Polygon",
  ARBITRUM: "Arbitrum",
  OPTIMISM: "Optimism",
  BASE: "Base",
  SOLANA: "Solana",
};

export const NATIVE_TOKEN_ADDRESS = "native";

export const BALANCE_STALE_MS = 60_000;
export const PRICE_STALE_MS = 60_000;
