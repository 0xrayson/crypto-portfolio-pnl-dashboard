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

export interface PricePoint {
  date: string;
  price: number;
}

export interface SwapView {
  txHash: string;
  chain: ChainName;
  blockTimestamp: string;
  soldToken: TokenSummary | null;
  soldAmount: number;
  boughtToken: TokenSummary | null;
  boughtAmount: number;
  proceedsUsd: number | null;
  costBasisUsd: number | null;
  realizedPnlUsd: number | null;
  costBasisUnknown: boolean;
}

export type SwapPnlWindowLabel = "1D" | "1W" | "1M" | "6M";

export interface SwapPnlWindow {
  label: SwapPnlWindowLabel;
  days: number;
  realizedPnlUsd: number;
  swapCount: number;
  winCount: number;
  lossCount: number;
  unknownCostBasisCount: number;
}

/** Unconsumed FIFO buy-lots for a token still held, as of the end of the processed leg history. */
export interface OpenLot {
  tokenId: string;
  quantity: number;
  /** null if any underlying lot's cost basis is unknown — never fabricated as 0. */
  costBasisUsd: number | null;
}

export interface SwapPnlSummary {
  totalRealizedPnlUsd: number;
  totalSwaps: number;
  winCount: number;
  lossCount: number;
  unknownCostBasisCount: number;
  swaps: SwapView[];
  /** Trailing-window realized PnL (each window overlaps the shorter ones), ordered 1D -> 6M. */
  windows: SwapPnlWindow[];
  openLots: OpenLot[];
}
