import type { Ecosystem } from "@/types/wallet";

export function parseEcosystem(value: string): Ecosystem | null {
  return value === "EVM" || value === "SOLANA" ? value : null;
}
