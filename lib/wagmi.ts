import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";
import { http } from "wagmi";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

function alchemyRpc(subdomain: string) {
  return alchemyKey ? `https://${subdomain}.g.alchemy.com/v2/${alchemyKey}` : undefined;
}

// RainbowKit requires a non-empty projectId at module-eval time even before
// WalletConnect is actually used (injected connectors like MetaMask/Coinbase
// Wallet work fine without one). This placeholder only blocks the
// WalletConnect QR-code connector until a real id is set in .env.local.
const WALLETCONNECT_PLACEHOLDER = "00000000000000000000000000000000";

export const wagmiConfig = getDefaultConfig({
  appName: "Crypto Portfolio & PnL Dashboard",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || WALLETCONNECT_PLACEHOLDER,
  chains: [mainnet, polygon, arbitrum, optimism, base],
  transports: {
    [mainnet.id]: http(alchemyRpc("eth-mainnet")),
    [polygon.id]: http(alchemyRpc("polygon-mainnet")),
    [arbitrum.id]: http(alchemyRpc("arb-mainnet")),
    [optimism.id]: http(alchemyRpc("opt-mainnet")),
    [base.id]: http(alchemyRpc("base-mainnet")),
  },
  ssr: true,
});
