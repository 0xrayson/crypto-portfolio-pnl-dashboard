export type { ChainName } from "@/lib/constants";

export type Ecosystem = "EVM" | "SOLANA";

export interface ActiveWallet {
  ecosystem: Ecosystem;
  address: string;
}
