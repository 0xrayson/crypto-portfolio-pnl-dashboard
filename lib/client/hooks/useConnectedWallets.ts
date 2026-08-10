import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import type { ActiveWallet } from "@/types/wallet";

/** All wallets currently connected across both ecosystems. */
export function useConnectedWallets(): ActiveWallet[] {
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { publicKey, connected: isSolanaConnected } = useWallet();

  const wallets: ActiveWallet[] = [];
  if (isEvmConnected && evmAddress) {
    wallets.push({ ecosystem: "EVM", address: evmAddress });
  }
  if (isSolanaConnected && publicKey) {
    wallets.push({ ecosystem: "SOLANA", address: publicKey.toBase58() });
  }
  return wallets;
}
