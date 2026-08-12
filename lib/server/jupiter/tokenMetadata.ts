export interface JupiterTokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
}

interface JupiterSearchResult {
  id: string;
  symbol?: string;
  name?: string;
  decimals?: number;
}

/**
 * Real Solana token metadata via Jupiter's public token search. This is the
 * source that actually covers brand-new pump.fun launches: Alchemy's
 * Solana DAS `getAsset` isn't available on this plan (returns -32001 even
 * for USDC), and CoinGecko's contract lookup 404s on anything this new. No
 * API key required.
 */
export async function getSolanaTokenMetadata(mint: string): Promise<JupiterTokenMetadata | null> {
  try {
    const res = await fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(mint)}`);
    if (!res.ok) return null;

    const results = (await res.json()) as JupiterSearchResult[];
    const match = results.find((r) => r.id === mint) ?? results[0];
    if (!match?.symbol && !match?.name) return null;

    return {
      symbol: match.symbol ?? "UNKNOWN",
      name: match.name ?? "Unknown Token",
      decimals: match.decimals ?? 9,
    };
  } catch {
    return null;
  }
}
