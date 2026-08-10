export const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  ? `https://solana-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  : "https://api.mainnet-beta.solana.com";
