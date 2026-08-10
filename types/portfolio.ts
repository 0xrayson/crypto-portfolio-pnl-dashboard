import type { ChainName } from "./wallet";

export interface TokenSummary {
  id: string;
  chain: ChainName;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string | null;
  isNative: boolean;
}

export interface TokenBalanceView {
  token: TokenSummary;
  balance: number;
  usdValue: number;
  usdPrice: number;
  priceChange24h: number | null;
}

export type TxDirection = "IN" | "OUT" | "SELF";
export type TxType = "TRANSFER" | "SWAP" | "MINT" | "BURN" | "APPROVAL" | "CONTRACT_CALL" | "UNKNOWN";

export interface TransactionView {
  id: string;
  chain: ChainName;
  txHash: string;
  blockTimestamp: string;
  direction: TxDirection;
  type: TxType;
  token: TokenSummary | null;
  amount: number;
  amountUsdAtTx: number | null;
  feeUsdAtTx: number | null;
  counterpartyAddress: string | null;
}

export interface PortfolioSnapshotView {
  capturedAt: string;
  totalUsdValue: number;
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
  source: "SEEDED_MOCK" | "COMPUTED";
}

export interface PricePoint {
  date: string;
  price: number;
}
